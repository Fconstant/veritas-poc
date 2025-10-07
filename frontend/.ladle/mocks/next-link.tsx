import React from 'react';

// Mock do Next.js Link para o Ladle
interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  [key: string]: unknown;
}

const Link: React.FC<LinkProps> = ({ href, children, ...props }) => {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export default Link;
