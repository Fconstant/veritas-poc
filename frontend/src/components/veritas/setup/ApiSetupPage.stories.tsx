import type { StoryDefault } from '@ladle/react';
import ApiSetupPage from './ApiSetupPage';
import { useState } from 'react';

export default {
  title: "veritas/setup/ApiSetupPage",
} satisfies StoryDefault;

export const FirstTime = () => {
  const [completed, setCompleted] = useState(false);
  const [keys, setKeys] = useState<{ google: string; tavily: string } | null>(null);

  if (completed && keys) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea] p-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Configuração Completa!</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Google Key:</strong> {keys.google.substring(0, 20)}...</p>
            <p><strong>Tavily Key:</strong> {keys.tavily.substring(0, 20)}...</p>
          </div>
          <button
            onClick={() => {
              setCompleted(false);
              setKeys(null);
            }}
            className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reiniciar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApiSetupPage
      onComplete={(apiKeys) => {
        setKeys(apiKeys);
        setCompleted(true);
      }}
    />
  );
};

export const WithExistingKeys = () => {
  const [completed, setCompleted] = useState(false);
  const [keys, setKeys] = useState({
    google: 'AIzaSyABC123_existing_key_example',
    tavily: 'tvly-ABC123_existing_key_example'
  });

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea] p-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Keys Atualizadas!</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Google Key:</strong> {keys.google.substring(0, 20)}...</p>
            <p><strong>Tavily Key:</strong> {keys.tavily.substring(0, 20)}...</p>
          </div>
          <button
            onClick={() => setCompleted(false)}
            className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Editar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApiSetupPage
      onComplete={(apiKeys) => {
        setKeys(apiKeys);
        setCompleted(true);
      }}
      initialKeys={keys}
    />
  );
};
