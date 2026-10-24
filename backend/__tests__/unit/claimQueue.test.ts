import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ClaimQueue,
  QueueCancelledError,
  QueueDeferredError,
  QueueTimeoutError,
} from '#/live/claimQueue.js';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const tick = async (ms = 0): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
};

describe('ClaimQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('never exceeds the configured concurrency and drains all accepted work', async () => {
    const queue = new ClaimQueue<string>({ concurrency: 2, timeoutMs: 0 });
    const gates = [deferred<string>(), deferred<string>(), deferred<string>()];
    const started: string[] = [];
    let running = 0;
    let peak = 0;

    const promises = gates.map((gate, index) => {
      const id = `claim-${index.toString()}`;
      return queue.enqueue({
        id,
        run: () => {
          started.push(id);
          running += 1;
          peak = Math.max(peak, running);
          return gate.promise.finally(() => {
            running -= 1;
          });
        },
      });
    });

    await tick();

    expect(started).toEqual(['claim-0', 'claim-1']);
    expect(queue.getMetrics()).toMatchObject({ active: 2, queued: 1 });

    gates[0].resolve('r0');
    await tick();

    expect(started).toEqual(['claim-0', 'claim-1', 'claim-2']);

    gates[1].resolve('r1');
    gates[2].resolve('r2');

    await expect(Promise.all(promises)).resolves.toEqual(['r0', 'r1', 'r2']);
    expect(peak).toBe(2);
    expect(queue.getMetrics()).toEqual({
      queued: 0,
      active: 0,
      completed: 3,
      failed: 0,
      deferred: 0,
      cancelled: 0,
      cacheHits: 0,
    });
  });

  it('reports DEFERRED instead of dropping work beyond the capacity', async () => {
    const queue = new ClaimQueue<string>({
      concurrency: 1,
      capacity: 1,
      timeoutMs: 0,
    });
    const blocker = deferred<string>();

    const active = queue.enqueue({ id: 'claim-1', run: () => blocker.promise });
    const queued = queue.enqueue({
      id: 'claim-2',
      run: () => Promise.resolve('2'),
    });
    const deferredOutcome = queue
      .enqueue({ id: 'claim-3', run: () => Promise.resolve('3') })
      .catch((error: unknown) => error);

    await expect(deferredOutcome).resolves.toBeInstanceOf(QueueDeferredError);
    await expect(deferredOutcome).resolves.toMatchObject({
      claimId: 'claim-3',
      capacity: 1,
    });
    expect(queue.getMetrics()).toMatchObject({
      deferred: 1,
      queued: 1,
      active: 1,
    });

    blocker.resolve('1');

    await expect(active).resolves.toBe('1');
    await expect(queued).resolves.toBe('2');
  });

  it('reuses a completed investigation by key and version for new occurrences', async () => {
    const queue = new ClaimQueue<number>({ timeoutMs: 0 });
    let calls = 0;
    const run = (): Promise<number> => {
      calls += 1;
      return Promise.resolve(calls);
    };

    await expect(queue.enqueue({ id: 'claim-1', key: 'pix-2015', run })).resolves.toBe(1);
    await expect(queue.enqueue({ id: 'claim-2', key: 'pix-2015', run })).resolves.toBe(1);

    expect(calls).toBe(1);
    expect(queue.getMetrics().cacheHits).toBe(1);

    await expect(
      queue.enqueue({ id: 'claim-3', key: 'pix-2015', version: 2, run }),
    ).resolves.toBe(2);
    await expect(
      queue.enqueue({ id: 'claim-4', key: 'pix-2015', version: 2, run }),
    ).resolves.toBe(2);

    expect(calls).toBe(2);
    expect(queue.getMetrics().cacheHits).toBe(2);
  });

  it('keeps the cache bounded', async () => {
    const queue = new ClaimQueue<number>({ timeoutMs: 0, cacheLimit: 1 });
    let calls = 0;
    const run = (): Promise<number> => {
      calls += 1;
      return Promise.resolve(calls);
    };

    await queue.enqueue({ id: 'claim-1', key: 'k1', run });
    await queue.enqueue({ id: 'claim-2', key: 'k2', run });
    await queue.enqueue({ id: 'claim-3', key: 'k1', run });

    expect(calls).toBe(3);
    expect(queue.getMetrics().cacheHits).toBe(0);
  });

  it('aborts the task signal on timeout and rejects with QueueTimeoutError', async () => {
    const queue = new ClaimQueue<string>({ timeoutMs: 1_000 });
    let signal: AbortSignal | undefined;
    const outcome = queue
      .enqueue({
        id: 'claim-slow',
        run: (taskSignal) => {
          signal = taskSignal;
          return new Promise<string>(() => {
            // intentionally never settles
          });
        },
      })
      .catch((error: unknown) => error);

    await tick(999);
    expect(signal?.aborted).toBe(false);

    await tick(1);
    await expect(outcome).resolves.toBeInstanceOf(QueueTimeoutError);
    expect(signal?.aborted).toBe(true);
    expect(queue.getMetrics()).toMatchObject({ failed: 1, active: 0 });
  });

  it('does not retry a timeout', async () => {
    const queue = new ClaimQueue<string>({
      timeoutMs: 100,
      maxRetries: 2,
      retryDelayMs: 10,
    });
    let attempts = 0;
    const outcome = queue
      .enqueue({
        id: 'claim-slow',
        run: () => {
          attempts += 1;
          return new Promise<string>(() => {
            // intentionally never settles
          });
        },
      })
      .catch((error: unknown) => error);

    await tick(100);

    await expect(outcome).resolves.toBeInstanceOf(QueueTimeoutError);
    expect(attempts).toBe(1);
  });

  it('retries a transient failure once and completes', async () => {
    const queue = new ClaimQueue<number>({
      timeoutMs: 0,
      maxRetries: 1,
      retryDelayMs: 500,
    });
    let attempts = 0;
    const promise = queue.enqueue({
      id: 'claim-1',
      run: () => {
        attempts += 1;
        return attempts === 1
          ? Promise.reject(new Error('temporary failure'))
          : Promise.resolve(42);
      },
    });

    await tick();
    await tick(499);
    expect(attempts).toBe(1);

    await tick(1);
    await expect(promise).resolves.toBe(42);
    expect(attempts).toBe(2);
    expect(queue.getMetrics()).toMatchObject({
      completed: 1,
      failed: 0,
      active: 0,
    });
  });

  it('honours a custom retry predicate', async () => {
    class QuotaError extends Error {}

    const queue = new ClaimQueue<string>({
      timeoutMs: 0,
      maxRetries: 3,
      retryDelayMs: 10,
      isRetryable: (error) => error instanceof QuotaError,
    });
    let attempts = 0;
    const promise = queue.enqueue({
      id: 'claim-1',
      run: () => {
        attempts += 1;
        return attempts < 3
          ? Promise.reject(new QuotaError('quota exceeded'))
          : Promise.resolve('ok');
      },
    });

    await tick();
    await tick(10);
    await tick();
    await tick(10);

    await expect(promise).resolves.toBe('ok');
    expect(attempts).toBe(3);
  });

  it('cancels active and pending work, aborting the active signal', async () => {
    const queue = new ClaimQueue<string>({
      concurrency: 1,
      capacity: 5,
      timeoutMs: 0,
    });
    let activeSignal: AbortSignal | undefined;

    const activeOutcome = queue
      .enqueue({
        id: 'claim-active',
        run: (signal) => {
          activeSignal = signal;
          return new Promise<string>(() => {
            // intentionally never settles
          });
        },
      })
      .catch((error: unknown) => error);
    const pendingOutcome = queue
      .enqueue({ id: 'claim-pending', run: () => Promise.resolve('never') })
      .catch((error: unknown) => error);

    await tick();
    expect(queue.getMetrics()).toMatchObject({ active: 1, queued: 1 });

    queue.cancelAll('sessão encerrada');

    const activeError = await activeOutcome;
    const pendingError = await pendingOutcome;

    expect(activeError).toBeInstanceOf(QueueCancelledError);
    expect(activeError).toMatchObject({
      claimId: 'claim-active',
      reason: 'sessão encerrada',
    });
    expect(activeSignal?.aborted).toBe(true);
    expect(pendingError).toBeInstanceOf(QueueCancelledError);
    expect(pendingError).toMatchObject({ claimId: 'claim-pending' });
    expect(queue.getMetrics()).toMatchObject({
      cancelled: 2,
      active: 0,
      queued: 0,
    });

    await expect(queue.drain()).resolves.toBeUndefined();
  });

  it('isolates a failed investigation from the rest of the queue', async () => {
    const queue = new ClaimQueue<string>({
      concurrency: 2,
      timeoutMs: 0,
      maxRetries: 0,
    });

    const failing = queue
      .enqueue({ id: 'claim-bad', run: () => Promise.reject(new Error('boom')) })
      .catch((error: unknown) => error);
    const first = queue.enqueue({ id: 'claim-1', run: () => Promise.resolve('one') });
    const second = queue.enqueue({ id: 'claim-2', run: () => Promise.resolve('two') });

    const [failure, one, two] = await Promise.all([failing, first, second]);

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toBe('boom');
    expect([one, two]).toEqual(['one', 'two']);
    expect(queue.getMetrics()).toMatchObject({ completed: 2, failed: 1 });
  });

  it('discards late results from timed-out tasks and does not cache them', async () => {
    const queue = new ClaimQueue<string>({ timeoutMs: 100, maxRetries: 0 });
    let finish: ((value: string) => void) | undefined;
    const outcome = queue
      .enqueue({
        id: 'claim-late',
        key: 'late',
        run: () =>
          new Promise<string>((resolve) => {
            finish = resolve;
          }),
      })
      .catch((error: unknown) => error);

    await tick(100);
    await expect(outcome).resolves.toBeInstanceOf(QueueTimeoutError);

    finish?.('late result');
    await tick();

    expect(queue.getMetrics()).toMatchObject({
      completed: 0,
      failed: 1,
      cacheHits: 0,
    });
    await expect(
      queue.enqueue({ id: 'claim-fresh', key: 'late', run: () => Promise.resolve('fresh') }),
    ).resolves.toBe('fresh');
  });

  it('runs higher priority work first', async () => {
    const queue = new ClaimQueue<string>({ concurrency: 1, timeoutMs: 0 });
    const blocker = deferred<string>();
    const order: string[] = [];

    const first = queue.enqueue({
      id: 'claim-blocker',
      run: () => {
        order.push('blocker');
        return blocker.promise;
      },
    });
    const low = queue.enqueue({
      id: 'claim-low',
      priority: 1,
      run: () => {
        order.push('low');
        return Promise.resolve('low');
      },
    });
    const high = queue.enqueue({
      id: 'claim-high',
      priority: 5,
      run: () => {
        order.push('high');
        return Promise.resolve('high');
      },
    });

    await tick();
    expect(order).toEqual(['blocker']);

    blocker.resolve('blocker');
    await tick();
    await Promise.all([first, low, high]);

    expect(order).toEqual(['blocker', 'high', 'low']);
  });

  it('emits status events and survives a throwing observer', async () => {
    const events: string[] = [];
    const queue = new ClaimQueue<number>({
      timeoutMs: 0,
      maxRetries: 0,
      onEvent: (event) => {
        events.push(event.type);
        throw new Error('observer failure');
      },
    });

    await expect(queue.enqueue({ id: 'claim-1', key: 'k', run: () => Promise.resolve(1) })).resolves.toBe(1);
    await expect(queue.enqueue({ id: 'claim-2', key: 'k', run: () => Promise.resolve(2) })).resolves.toBe(1);

    expect(events).toEqual(['STARTED', 'COMPLETED', 'CACHE_HIT']);
  });

  it('cancels a task while it waits for the retry delay', async () => {
    const queue = new ClaimQueue<string>({
      timeoutMs: 0,
      maxRetries: 2,
      retryDelayMs: 500,
    });
    let attempts = 0;
    const outcome = queue
      .enqueue({
        id: 'claim-retry',
        run: () => {
          attempts += 1;
          return Promise.reject(new Error('transient failure'));
        },
      })
      .catch((error: unknown) => error);

    await tick();
    expect(attempts).toBe(1);
    expect(queue.getMetrics().active).toBe(1);

    queue.cancelAll('sessão cancelada');

    await expect(outcome).resolves.toBeInstanceOf(QueueCancelledError);
    expect(attempts).toBe(1);
    expect(queue.getMetrics()).toMatchObject({ cancelled: 1, active: 0 });
  });

  it('defers every occurrence when the capacity is zero', async () => {
    const queue = new ClaimQueue<number>({ capacity: 0 });

    await expect(
      queue.enqueue({ id: 'claim-1', run: () => Promise.resolve(1) }),
    ).rejects.toBeInstanceOf(QueueDeferredError);
  });

  it('rejects an empty claim id synchronously', () => {
    const queue = new ClaimQueue<number>();

    expect(() =>
      queue.enqueue({ id: '', run: () => Promise.resolve(1) }),
    ).toThrow(TypeError);
  });

  it('drain waits for accepted work', async () => {
    const queue = new ClaimQueue<number>({ timeoutMs: 0 });
    const promise = queue.enqueue({ id: 'claim-1', run: () => Promise.resolve(1) });

    await queue.drain();

    await expect(promise).resolves.toBe(1);
    expect(queue.getMetrics().completed).toBe(1);
  });

  it('starts with zeroed metrics', () => {
    expect(new ClaimQueue().getMetrics()).toEqual({
      queued: 0,
      active: 0,
      completed: 0,
      failed: 0,
      deferred: 0,
      cancelled: 0,
      cacheHits: 0,
    });
  });
});
