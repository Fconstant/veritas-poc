// Mock do Next.js navigation hooks para o Ladle

export const useRouter = () => ({
  push: (url: string) => console.log('Mock router push:', url),
  replace: (url: string) => console.log('Mock router replace:', url),
  back: () => console.log('Mock router back'),
  pathname: '/',
  query: {},
});

export const usePathname = () => '/';

export const useSearchParams = () => new URLSearchParams();
