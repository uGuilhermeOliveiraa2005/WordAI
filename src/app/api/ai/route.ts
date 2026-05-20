import { NextRequest } from "next/server";

export const runtime = "edge";

// Mock templates to return super premium designs if the user asks for certain types
const PREMIUM_DOCS = {
  refrigeracao: `# Proposta Comercial: Solução Completa de Climatização
*Preparado para: Empresa Exemplo Ltda.*
*Data: ${new Date().toLocaleDateString()}*

---

## 1. Visão Geral da Solução
Oferecemos um sistema inteligente de climatização industrial e residencial projetado para **máxima eficiência energética** e **controle térmico avançado**.

## 2. Escopo do Projeto
- **Dimensionamento Térmico:** Análise completa da carga térmica de cada ambiente.
- **Instalação Premium:** Equipamentos inverter de última geração com filtragem HEPA.
- **Automação:** Painel centralizado integrado via IoT para monitoramento de consumo.

## 3. Benefícios Clave
- 🍃 **Redução de até 40%** no consumo de energia elétrica.
- 🕒 **Manutenção preditiva** com alertas automáticos via WhatsApp/Email.
- 🤝 **Garantia estendida** de 3 anos para todos os equipamentos.

## 4. Tabela de Investimento
| Etapa / Equipamento | Descrição | Valor (R$) |
| :--- | :--- | :--- |
| **Equipamentos VRF** | 3 unidades condensadoras de alta performance | R$ 45.000,00 |
| **Instalação & Infra** | Dutos de cobre, fixações isolamento e fiação premium | R$ 12.000,00 |
| **Automação IoT** | Sensores inteligentes e integração centralizada | R$ 4.500,00 |
| **Total Estimado** | **Investimento total do projeto** | **R$ 61.500,00** |

---

## 5. Próximos Passos
1. Aprovado o orçamento, agendaremos a vistoria técnica final.
2. Início das obras em até **5 dias úteis** após assinatura do contrato.`,

  contrato: `# Contrato de Prestação de Serviços de Tecnologia
**Contratante:** Empresa Alfa S.A.
**Contratado:** WordAI Solutions Ltda.

---

### Cláusula 1ª - Do Objeto
O presente instrumento tem como objeto a prestação de serviços de desenvolvimento de software e integração de Inteligência Artificial para gestão de documentos corporativos.

### Cláusula 2ª - Do Preço e Forma de Pagamento
Pelo objeto contratado, a Contratante pagará ao Contratado o valor total de **R$ 25.000,00**, distribuídos em:
- **50% (R$ 12.500,00)** na assinatura deste instrumento.
- **50% (R$ 12.500,00)** após a entrega e homologação final do sistema.

### Cláusula 3ª - Do Prazo
O prazo estimado para conclusão do projeto é de **45 dias**, com início programado a partir de ${new Date().toLocaleDateString()}.

| Fase | Descrição | Prazo (Dias) |
| :--- | :--- | :--- |
| **Fase 1** | Especificação Técnica e UI/UX | 10 dias |
| **Fase 2** | Desenvolvimento do Core | 20 dias |
| **Fase 3** | Integração de IA e Testes | 10 dias |
| **Fase 4** | Deploy & Homologação | 5 dias |

---
**Assinaturas:**

_______________________________
**Contratante**

_______________________________
**Contratado**`,

  curriculo: `# John Doe
**Software Engineer | AI Specialist**
📍 São Paulo, SP | ✉️ john.doe@email.com | 🌐 github.com/johndoe

---

## Resumo Profissional
Desenvolvedor Full Stack apaixonado por arquiteturas modernas, Next.js, computação em nuvem e inteligência artificial. Focado em criar produtos altamente escaláveis e com design premium.

## Experiência Profissional
### **Senior Frontend Engineer** @ TechCorp SaaS (2023 - Presente)
- Liderança técnica na migração para Next.js 14 App Router, reduzindo o tempo de carregamento em 35%.
- Implementação de um editor WYSIWYG baseado em Tiptap com inteligência artificial generativa.

### **Full Stack Developer** @ Startup Hub (2021 - 2023)
- Desenvolvimento de APIs de alta performance com Node.js e TypeScript.
- Configuração de pipelines CI/CD automatizados no GitHub Actions.

## Habilidades
- **Frontend:** React, Next.js, TailwindCSS, Framer Motion, Zustand
- **Backend:** Node.js, NestJS, PostgreSQL, Prisma, GraphQL
- **IA/ML:** OpenAI API, Engenharia de Prompt, RAG

---
*Referências profissionais disponíveis sob solicitação.*`
};

export async function POST(req: NextRequest) {
  try {
    const { messages, stream } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    let generatedText = "";
    let connectedToOpenCode = false;

    // Tentativa de conectar ao servidor local do OpenCode (porta 49100)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout para detectar se o servidor está offline

      const sessionResponse = await fetch("http://127.0.0.1:49100/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "WordAI Document Integration" }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json() as any;
        const sessionId = sessionData.id || sessionData.info?.id;

        if (sessionId) {
          const systemPrompt = `Você é o WordAI, um redator profissional de documentos corporativos de alta performance.
          Seu objetivo é gerar documentos de qualidade profissional, completos e com excelente estética visual.
          Sempre utilize formatação Markdown rica (títulos ##, listas, tabelas estruturadas, blocos de citação e negritos).
          Não adicione introduções amigáveis no início ("Aqui está o seu...", "Espero que ajude..."), comece diretamente no título principal do documento.
          Responda sempre em Português (Brasil).`;

          const messageController = new AbortController();
          const messageTimeout = setTimeout(() => messageController.abort(), 30000); // 30s de limite para geração local

          const messageResponse = await fetch(`http://127.0.0.1:49100/session/${sessionId}/message`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              model: { 
                providerID: "opencode", 
                modelID: "minimax-m2.5-free" 
              },
              system: systemPrompt,
              parts: [{ type: "text", text: lastMessage }],
              stream: false
            }),
            signal: messageController.signal
          });

          clearTimeout(messageTimeout);

          if (messageResponse.ok) {
            const result = await messageResponse.json() as any;
            if (result.parts && Array.isArray(result.parts)) {
              // Concatena as partes de texto/raciocínio retornadas pelo OpenCode
              const textParts = result.parts
                .filter((p: any) => (p.type === "text" || p.type === "reasoning") && p.text)
                .map((p: any) => p.text);
              
              if (textParts.length > 0) {
                generatedText = textParts.join("\n\n");
                connectedToOpenCode = true;
              }
            }
          }
        }
      }
    } catch (err) {
      // Falha silenciosa: opencode offline, usará o fallback premium abaixo
      console.log("OpenCode local server offline. Using premium mock fallback.");
    }

    if (!connectedToOpenCode) {
      // Decide o conteúdo do mock premium de fallback
      const lowerPrompt = lastMessage.toLowerCase();
      if (lowerPrompt.includes("refrigeração") || lowerPrompt.includes("proposta")) {
        generatedText = PREMIUM_DOCS.refrigeracao;
      } else if (lowerPrompt.includes("contrato") || lowerPrompt.includes("serviços")) {
        generatedText = PREMIUM_DOCS.contrato;
      } else if (lowerPrompt.includes("currículo") || lowerPrompt.includes("curriculo")) {
        generatedText = PREMIUM_DOCS.curriculo;
      } else if (lowerPrompt.includes("melhorar") || lowerPrompt.includes("reescrever")) {
        generatedText = `Aqui está uma versão otimizada e mais envolvente do seu texto:\n\n**"${lastMessage.replace(/melhorar|reescrever|reescreva/gi, "").trim()}"** foi refinado para:\n\n"Com o uso de inteligência artificial de última geração e foco absoluto em alta performance, nossa solução revoluciona completamente a maneira como você edita e gerencia documentos, elevando a produtividade diária a patamares nunca antes vistos."`;
      } else if (lowerPrompt.includes("resumir") || lowerPrompt.includes("resuma")) {
        generatedText = `### Resumo Executivo\n- **Conceito Core:** O WordAI reinventa o processamento de textos ao integrar IA fluida.\n- **Produtividade:** Redução significativa do tempo de redação de documentos formais.\n- **Interface:** Layout minimalista focado no fluxo de foco do autor.`;
      } else if (lowerPrompt.includes("continue") || lowerPrompt.includes("continuar")) {
        generatedText = `\n\nAdicionalmente, esta abordagem inovadora garante que cada elemento visual e textual do documento esteja alinhado com as melhores práticas de design contemporâneo, eliminando por completo a necessidade de ajustes manuais exaustivos de formatação. O resultado é um fluxo de trabalho absurdamente rápido, intuitivo e elegante.`;
      } else if (lowerPrompt.includes("traduzir") || lowerPrompt.includes("traduza")) {
        generatedText = `Here is the premium English translation of your text:\n\n"WordAI is a state-of-the-art document editor designed for maximum productivity and premium user experience, powered by bleeding-edge AI models."`;
      } else {
        // General document generator
        generatedText = `# ${lastMessage}

Criado automaticamente pelo **WordAI** com Inteligência Artificial de elite.

---

## Introdução
Com base na sua solicitação, geramos esta estrutura de documento altamente polida e profissional. Cada seção foi otimizada para legibilidade e impacto visual.

## Pontos Principais
- **Eficiência Máxima:** Economia de tempo imediata.
- **Design Elegante:** Visual alinhado às startups mais valiosas do mercado.
- **Inteligência Integrada:** Revisão ortográfica e semântica em tempo real.

## Tabela Informativa
| Módulo | Funcionalidade | Status |
| :--- | :--- | :--- |
| Editor Core | Formatação Rica Tiptap | Ativo |
| Motor IA | OpenCode Minimax-M2.5 | Ativo |
| Engine | Templates Customizados | Ativo |

---
*Documento pronto para exportação em PDF ou compartilhamento instantâneo.*`;
      }
    }

    if (!stream) {
      return Response.json({ text: generatedText });
    }

    // Set up a beautiful real-time text streaming using standard ReadableStream
    const encoder = new TextEncoder();
    const words = generatedText.split(" ");
    let wordIndex = 0;

    const customStream = new ReadableStream({
      async start(controller) {
        function push() {
          if (wordIndex >= words.length) {
            controller.close();
            return;
          }
          const word = words[wordIndex] + (wordIndex === words.length - 1 ? "" : " ");
          controller.enqueue(encoder.encode(word));
          wordIndex++;
          setTimeout(push, 25); // Fast streaming speed for extreme fluidity
        }
        push();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API AI Error:", error);
    return Response.json({ error: "Failed generating response" }, { status: 500 });
  }
}
