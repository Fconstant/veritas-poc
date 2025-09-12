import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/veritas/Header/Header';
import HeroSection from './HeroSection';
import VerificationForm from './VerificationForm';
import HomePageToast from './HomePageToast';

interface HomePageProps {
  className?: string;
}

const HomePage: React.FC<HomePageProps> = ({ className }) => {
  const [textValue, setTextValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const handleUseExample = () => {
    const exampleText = "O presidente anunciou hoje que a economia cresceu 5% no último trimestre, segundo dados do IBGE. Esta é a maior taxa de crescimento dos últimos 10 anos e representa um marco histórico para o país.";
    setTextValue(exampleText);
  };

  const handleCheckFacts = () => {
    if (textValue.trim()) {
      setIsLoading(true);
      // Aqui seria feita a chamada para a API de verificação
      console.log('Verificando fatos para:', textValue);
      
      // Simular loading
      setTimeout(() => {
        setIsLoading(false);
        // Simular sucesso ou erro
        const isSuccess = Math.random() > 0.3; // 70% de chance de sucesso
        
        if (isSuccess) {
          setToast({
            type: 'success',
            message: 'Verificação concluída! Redirecionando para os resultados...',
            isVisible: true
          });
          
          // Auto-hide toast after 3 seconds
          setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
            // Aqui seria redirecionado para a página de resultados
            // Exemplo: router.push('/results');
          }, 3000);
        } else {
          setToast({
            type: 'error',
            message: 'Erro na verificação. Tente novamente.',
            isVisible: true
          });
          
          // Auto-hide toast after 5 seconds
          setTimeout(() => {
            setToast(prev => ({ ...prev, isVisible: false }));
          }, 5000);
        }
      }, 3000);
    }
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-[#f5f5f5] opacity-90 relative size-full to-[#eaeaea] min-h-screen overflow-hidden",
      className
    )}>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-[1280px] mx-auto px-5">
          <Header />
        </div>
      </div>
      
      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-[800px] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#351397]/5 via-transparent to-transparent" />
        {/* Decorative waves pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#351397]/10 to-transparent opacity-30">
          <svg 
            className="absolute bottom-0 left-0 w-full h-full" 
            viewBox="0 0 1440 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
              fill="currentColor" 
              className="text-[#351397]/20"
            />
          </svg>
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-5 py-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Hero Section - Left Side */}
            <div className="order-2 lg:order-1">
              <HeroSection className="max-w-[629px] mx-auto lg:mx-0" />
            </div>
            
            {/* Verification Form - Right Side */}
            <div className="order-1 lg:order-2">
              <div className="max-w-[571px] mx-auto lg:mx-0">
                <VerificationForm
                  onUseExample={handleUseExample}
                  onCheckFacts={handleCheckFacts}
                  onTextChange={handleTextChange}
                  loading={isLoading}
                  value={textValue}
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Mobile/Tablet specific adjustments */}
      <div className="lg:hidden">
        {/* Additional spacing for mobile */}
        <div className="h-20" />
      </div>
      
      {/* Toast Notification */}
      <HomePageToast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default HomePage;
