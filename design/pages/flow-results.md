# Flow

Aparentemente a integração está funcionando. Então precisamos criar a página de Resultados. Entenda o fluxo de interação:

Veja o design de todo o fluxo no figma aqui: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=175-2518&t=qpmCsx79zBf2qjqJ-11

Agora entenda cada passo:

### Landing Page / Processing confirmation > Text processing

- Design link: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-9500&t=qpmCsx79zBf2qjqJ-4

Esta página é uma confirmação ao usuário de que recebemos o texto e começamos a análise: 

Mostrar essa tela não mais de 2 ou 3 segundos, e então fazer uma animação de transição para a tela de Resultados em si.

Assim que o usuário clicar em VERIFICAR FATOS, iremos fazer uma transição bem smooth, com animações do VERIFICATION FORM se movendo para o centro da tela, e o TEXT AREA mudando para o estado de DISABLED, desabilitando a edição do texto inserido. 

A HERO SECTION vai desaparecendo da tela. 

Quando o VERIFICATION FORM chegar ao centro, os BOTOES USAR EXEMPLO E VERIFICAR FATOS desapareceram, e entrará o LOADING, com um ícone animado de loading girando, vamos usar o ícone "loader” do Lucide. 

A label será "Lendo Texto…” - E os três pontos ao final, serão animados, mostrando primeiro: 

- 1º: 1 ponto: ".”
- 2º 2 pontos "..”
- Por fim 3 pontos: "…”
- Depois, recomeça o loop com 1 ponto ".”

Veja o exemplo:

/* HTML: <div class="loader"></div> */
.loader {
width: 60px;
aspect-ratio: 4;
background: radial-gradient(circle closest-side,#000 90%,#0000) 0/calc(100%/3) 100% space;
clip-path: inset(0 100% 0 0);
animation: l1 1s steps(4) infinite;
}
@keyframes l1 {to{clip-path: inset(0 -34% 0 0)}}

### Landing Page / Transition to Results page

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12550&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12550&t=qpmCsx79zBf2qjqJ-11)

Página aparecerá em branco apenas com o header para servir de transição.

### Results / Display text processed

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11365&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11365&t=qpmCsx79zBf2qjqJ-11)

**Layout**: Interface dividida em duas colunas

Primeiramente, mostraremos a coluna de esquerda em que no header:

- Title: "Text processed"
- Botão "New" para começar nova verificação com a inserção de novo texto (Veja fluxo abaixo)

E logo abaixo, mostraremos o Texto original inserido pelo usuário exibido integralmente, como mostra no design. Caso o texto ultrapasse a altura da tela disponível, fazer rolagem do texto.

Veja o design: @https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11365&t=qpmCsx79zBf2qjqJ-11

### Results / Display results verification area

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11)

No máximo de 1, a 2 segundos depois, mostraremos a coluna da direita: Area preparada para mostrar os resultados. Está area terá diferente estados, 1º Verificação em andamento, 2º Primeiros resultados, e por fim 3º Verificação completa.

1º Verificação em andamento. 

- Header: Verificando…
    - Adicionar animação nos três pontos "…” e no ícone verde, como se estivesse pulsando.
- Results: Mostrar card com o lazy loading animado enquanto nenhum resultado aparece.

Veja o design: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11)

### Results / First Results

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12766&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12766&t=qpmCsx79zBf2qjqJ-11)

Esta tela representa o 2º Primeiros resultados. Em que o card com os primeiros resultados enviados pelo back-end aparecem na tela

### Results / Display all facts verified

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-13092&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-13092&t=qpmCsx79zBf2qjqJ-11)

### Cancel Verification / Dialog Confirmation

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3276&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3276&t=qpmCsx79zBf2qjqJ-11)

### New Text / Dialog Confirmation

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3861&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3861&t=qpmCsx79zBf2qjqJ-11)

### New Text / Transition

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=175-2568&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=175-2568&t=qpmCsx79zBf2qjqJ-11)

### Back to Landing Page / Empty State

- Design link: [https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-4446&t=qpmCsx79zBf2qjqJ-11](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-4446&t=qpmCsx79zBf2qjqJ-11)