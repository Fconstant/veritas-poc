import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface ResultData {
  id: string;
  text: string;
  confidence: number;
  status: 'verified' | 'unverified' | 'pending' | 'loading';
  sources?: string[];
  explanation?: string;
}

interface ResultCardProps {
  result: ResultData;
  className?: string;
}

// ATENÇÃO: Componente desativado temporariamente.
// Até que haja status por resultado, não renderizamos os cartões individuais.
// Mantemos os tipos para compatibilidade e possíveis usos futuros.
const ResultCard: React.FC<ResultCardProps> = ({
  result,
  className
}) => {
  return (
    <Card className={cn('p-4 border-dashed border-[#d7d4de] text-muted-foreground', className)}>
      ResultCard desativado — use o ResultsHeader para o status global.
    </Card>
  );

  /* Implementação anterior mantida para referência
  const getStatusIcon = () => {
    switch (result.status) {
      case 'verified':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'unverified':
        return <XCircle className="size-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="size-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="size-5 text-primary animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (result.status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'unverified':
        return <Badge variant="destructive">Unverified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'loading':
        return <Badge variant="outline">Loading...</Badge>;
      default:
        return null;
    }
  };

  if (result.status === 'loading') {
    return (
      <Card className={cn('p-4 animate-pulse', className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
        <div className="text-sm text-muted-foreground">
          {Math.round(result.confidence * 100)}% confidence
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[#102148] leading-relaxed">
          {result.text}
        </p>

        {result.explanation && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
            <strong>Explanation:</strong> {result.explanation}
          </div>
        )}

        {result.sources && result.sources.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <strong>Sources:</strong>
            <ul className="mt-1 space-y-1">
              {result.sources.map((source, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <a 
                    href={source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
  */
};

export default ResultCard;
