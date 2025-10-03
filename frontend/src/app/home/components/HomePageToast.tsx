import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/app/shared/components/ui/button';

interface HomePageToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const HomePageToast: React.FC<HomePageToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
  className
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="size-5 text-red-500" />;
      case 'info':
        return <Info className="size-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm w-full",
      "transform transition-all duration-300 ease-in-out",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      className
    )}>
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        getBackgroundColor()
      )}>
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {message}
          </p>
        </div>
        
        <Button
          variant="link"
          size="sm"
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <span className="sr-only">Fechar</span>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default HomePageToast;
