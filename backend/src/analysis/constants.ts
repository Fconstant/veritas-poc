
export const REASONING_CONFIDENCE_INPUT = `
Evaluate its own answer against the following criteria.
Each criterion must be explicitly considered.
If all are satisfied, the output is highly reliable and requires no further external research.
If one or more criteria fail, confidence should be reduced and research may be needed.

Clarity and Specificity: The output is precise, unambiguous, and avoids vague statements.
Internal Consistency: No contradictions exist within the answer.
Logical Coherence: The reasoning follows a clear, logical structure without leaps or gaps.
Evidence Alignment: The claim is supported by known, widely accepted facts or well-established reasoning.
Domain Fit: The claim falls within well-documented and stable knowledge domains (e.g., mathematics, historical facts, definitions).
Cross-Verification: The answer could be independently verified by multiple reliable sources, and it does not rely on a single fragile assumption.
Temporal Validity: The information is not time-sensitive or subject to rapid change (e.g., current events, stock prices, elections).
Neutrality: The claim avoids biased or opinionated framing and sticks to factual representation.
Completeness: The output addresses all parts of the question without omitting key aspects.
Confidence Statement: The model can articulate why the claim is correct and what underlying knowledge supports it.
`;
