"use client";

import { useState } from 'react';
import { ConfirmationDialog } from '@/components/veritas/common';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);
  const [lastAction, setLastAction] = useState('Nenhuma ação executada');

  const handleCancel = () => {
    console.log('🚫 Modal cancelado - fechando modal');
    setLastAction('❌ Modal cancelado - fechado');
    setShowModal(false);
  };

  const handleConfirm = () => {
    console.log('✅ Modal confirmado - executando ação');
    setLastAction('✅ Modal confirmado - redirecionando');
    setShowModal(false);
    // Simular redirecionamento
    setTimeout(() => {
      setLastAction('🏠 Redirecionado para home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Teste do Modal de Confirmação
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Teste do ConfirmationDialog</h2>
          
          <button
            onClick={() => {
              setShowModal(true);
              setLastAction('Modal aberto');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Abrir Modal de Novo Texto
          </button>
          
          <div className="mt-4 p-4 bg-gray-50 border rounded">
            <p className="text-sm font-medium text-gray-700">Última ação:</p>
            <p className="text-sm text-gray-600">{lastAction}</p>
          </div>
        </div>

        <ConfirmationDialog
          isOpen={showModal}
          onClose={() => {
            setLastAction('❌ Modal fechado via onClose');
            setShowModal(false);
          }}
          onCancel={handleCancel}
          variant="new-text"
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}
