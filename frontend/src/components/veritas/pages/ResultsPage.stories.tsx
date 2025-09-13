import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ResultsPage from "./ResultsPage";

export default {
  title: "veritas/pages/ResultsPage",
} satisfies StoryDefault;

export const Default: Story = () => (
  <div className="h-screen">
    <ResultsPage />
  </div>
);

export const CustomText: Story = () => (
  <div className="h-screen">
    <ResultsPage 
      text="Este é um texto personalizado para demonstração da página de resultados. O sistema irá processar e verificar este texto específico."
    />
  </div>
);

export const LongText: Story = () => (
  <div className="h-screen">
    <ResultsPage 
      text={`
Este é um texto muito longo para demonstrar como a página de resultados lida com textos extensos.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incididunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.

Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
      `.trim()}
    />
  </div>
);

export const Interactive: Story = () => {
  const [text, setText] = useState("Este é um texto de exemplo para demonstração da página de resultados.");

  const handleNewVerification = () => {
    console.log('Nova verificação iniciada!');
    setText("Novo texto para verificação: " + new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ResultsPage Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Esta página demonstra o fluxo completo de resultados com simulação de dados
        </p>
      </div>

      <div className="h-screen">
        <ResultsPage 
          text={text}
          onNewVerification={handleNewVerification}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Texto atual:</strong> {text}</p>
        <p><strong>Caracteres:</strong> {text.length}</p>
      </div>
    </div>
  );
};
