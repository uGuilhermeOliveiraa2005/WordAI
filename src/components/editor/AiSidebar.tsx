"use client"

import React, { useState, useRef, useEffect } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { Editor } from "@tiptap/react"
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Trash2, 
  ClipboardCheck,
  ChevronRight,
  Compass,
  FileCheck2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { aiService, Message } from "@/services/ai"
import { toast } from "sonner"
import { parseMarkdown, markdownToTiptapHTML } from "@/utils/markdownParser"

interface AiSidebarProps {
  editor: Editor | null;
}

export default function AiSidebar({ editor }: AiSidebarProps) {
  const { isAiChatOpen, setAiChatOpen, setGlobalGeneration } = useEditorStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente do WordAI. Posso ajudar você a gerar contratos, propostas, artigos inteiros ou otimizar seu documento atual. O que gostaria de criar?'
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Direct scrollTop manipulation strictly isolates scrolling to this container, preventing browser viewport bubbles
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!isAiChatOpen) return null;

  const handleSendMessage = async (customPrompt?: string, forceInline: boolean = false) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;

    if (!customPrompt) setInput("");
    setIsLoading(true);

    const isDocumentGenerationIntent = forceInline || /^(crie|gere|escreva|elabore|faça|redija|desenvolva|monte|produza|formate|prepare|esboce)\b/i.test(promptText.trim());

    if (isDocumentGenerationIntent && editor) {
      setAiChatOpen(false); // Hide sidebar to focus on the document generation
      
      const prevHTML = editor.getHTML();
      const previousHTML = editor.isEmpty ? '' : prevHTML + '<p></p><hr><p></p>';
      
      setGlobalGeneration({
        isGenerating: true,
        showActions: false,
        previousHTML: prevHTML,
      });

      const toastId = toast.loading("Redigindo documento com IA... Por favor, aguarde.", { id: "doc-generation" });

      try {
        const systemPrompt = `Você é um consultor executivo sênior e estrategista corporativo de classe mundial (nível Partner em MBB - McKinsey, BCG, Bain). Sua missão é criar documentos empresariais IMPECÁVEIS, definitivos e de altíssimo valor (milhões de dólares), focados em C-Level e Conselhos de Administração.

REGRAS ABSOLUTAS DE GERAÇÃO:
1. ESTRUTURA PREMIUM E RICA: O documento DEVE ser escultural. Comece com um "Sumário Executivo" de alto impacto. Use extensamente Títulos (H1, H2, H3), subtítulos, listas com marcadores complexas e numeradas. Aplique NEGRITO para destacar KPIs, métricas e termos estratégicos vitais. Utilize Blockquotes (>) para insights críticos ou recomendações chave.
2. TABELAS COMPLEXAS E INTELIGENTES: Esta é sua assinatura. SEMPRE inclua tabelas Markdown excepcionalmente estruturadas e detalhadas (ex: Matrizes de Risco, Cronogramas de Implementação, Quadros Comparativos, Projeções Financeiras, Frameworks de Decisão). As tabelas devem ter múltiplas colunas bem definidas.
3. PROFUNDIDADE ANALÍTICA: NUNCA gere "texto enchedor de linguiça" ou genérico. Cada frase deve ser densa em valor, estratégica e baseada na lógica "MECE" (Mutually Exclusive, Collectively Exhaustive). Vá direto ao ponto, mas com profundidade absoluta. Termine sempre com "Próximos Passos" ou "Plano de Ação" tático.
4. TOM EXECUTIVO: Linguagem culta, assertiva, persuasiva e baseada em dados reais ou lógicos. Seja o consultor que resolve os maiores problemas do mundo.
5. FORMATAÇÃO TÉCNICA E CAMPOS: Responda APENAS com o conteúdo do documento final em Markdown. NUNCA envolva sua resposta em blocos de código (ex: \`\`\`markdown). Retorne o texto cru imediatamente.
   - PARA CAMPOS E ASSINATURAS: NUNCA USE linhas pontilhadas/tracejadas (ex: ______ ou NOME: ...........). Em vez disso, injete blocos HTML premium.
   - Exemplo de Assinatura: \`<div class="signature-container"><div class="signature-wrapper"><div class="signature-line"></div><p class="signature-name">Nome do Executivo</p><p class="signature-role">Cargo Ocupado</p></div></div>\`
   - Exemplo de Campo (Formulário): \`<div class="field-box"><span class="field-label">NOME DA EMPRESA:</span><span class="field-value"></span></div>\``;

        const response = await aiService.callOpenCode([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText }
        ], true);
        
        if (response instanceof Response && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let responseText = "";

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            const chunk = decoder.decode(value, { stream: !done });
            responseText += chunk;
            
            const cleanContent = responseText.replace(/^```(markdown|md)?\s*/i, '').replace(/\s*```$/i, '');
            const html = markdownToTiptapHTML(cleanContent);
            
            // Stream live into the editor by replacing the content with previous + new
            editor.commands.setContent(previousHTML + html);
            
            // Auto scroll to bottom of the editor
            const pm = document.querySelector('.ProseMirror');
            if (pm) {
              const lastChild = pm.lastElementChild;
              if (lastChild) {
                lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }
            }
          }
          toast.success("Documento gerado com sucesso!", { id: toastId });
          setGlobalGeneration({ isGenerating: false, showActions: true });
        } else {
          const finalResponseText = typeof response === 'string' ? response : 'Sem resposta do serviço de IA';
          const cleanContent = finalResponseText.replace(/^```(markdown|md)?\s*/i, '').replace(/\s*```$/i, '');
          editor.commands.setContent(previousHTML + markdownToTiptapHTML(cleanContent));
          toast.success("Documento gerado com sucesso!", { id: toastId });
          setGlobalGeneration({ isGenerating: false, showActions: true });
        }
      } catch (err) {
        console.error(err);
        toast.error("Ocorreu um erro ao gerar o documento.", { id: toastId });
        setGlobalGeneration({ isGenerating: false });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const userMessage: Message = { role: 'user', content: promptText };
    setMessages(prev => [...prev, userMessage]);

    try {
      const assistantMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      const response = await aiService.callOpenCode([
        { role: 'system', content: 'Você é um assistente corporativo. Responda em Markdown.' },
        ...messages,
        userMessage
      ], true);
      
      let finalResponseText = "";

      if (response instanceof Response && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let responseText = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: !done });
          responseText += chunk;
          
          setMessages(prev => {
            const next = [...prev];
            if (next[assistantMessageIndex]) {
              next[assistantMessageIndex].content = responseText;
            }
            return next;
          });
        }
      } else {
        finalResponseText = typeof response === 'string' ? response : 'Sem resposta do serviço de IA';
        setMessages(prev => {
          const next = [...prev];
          if (next[assistantMessageIndex]) {
            next[assistantMessageIndex].content = finalResponseText;
          }
          return next;
        });
      }

    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao gerar a resposta de IA.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInsertIntoEditor = async (rawText: string) => {
    if (!editor) return;

    // We use a toast promise to show the user we are "professionalizing" the content
    toast.loading("Adaptando para formato profissional...", { id: "insert-toast" });

    try {
      // Create a specific prompt to rewrite the chat response into a highly professional document format
      const prompt = `Transforme o seguinte conteúdo em um fragmento de documento executivo de altíssimo nível (padrão consultoria de elite mundial).
O texto deve adquirir um tom estritamente corporativo, analítico, persuasivo e altamente profissional.
Estruture o conteúdo de forma rica utilizando formatação avançada de Markdown:
- Títulos hierárquicos (H1, H2, H3)
- Listas elaboradas e aninhadas
- Tabelas detalhadas para dados ou comparações (se aplicável)
- Blockquotes (>) para destaques e negrito para métricas/termos-chave.
- Tabelas de alto nível em Markdown
- PARA CAMPOS E ASSINATURAS: É PROIBIDO o uso de sublinhados amadores (ex: _______). Você DEVE utilizar os seguintes blocos HTML premium:
  * Bloco de Assinatura: \`<div class="signature-container"><div class="signature-wrapper"><div class="signature-line"></div><p class="signature-name">Nome</p><p class="signature-role">Cargo</p></div></div>\`
  * Campo de Formulário: \`<div class="field-box"><span class="field-label">Label:</span><span class="field-value"></span></div>\`
NÃO inclua NENHUMA saudação, introdução ou explicação sobre o que você fez. Retorne APENAS o conteúdo Markdown/HTML final. NUNCA envolva sua resposta em blocos de código (ex: \`\`\`markdown).

Conteúdo base:
${rawText}`;

      // Call our AI service to generate the high-quality professional version
      const response = await aiService.callOpenCode([
        { role: 'system', content: 'Você é um especialista em editoração e estruturação de documentos de nível empresarial.' },
        { role: 'user', content: prompt }
      ], false); // Get full response, not streamed for flawless HTML conversion
      
      let professionalMarkdown = rawText; // fallback
      
      if (typeof response === 'string') {
        professionalMarkdown = response;
      } else if (response instanceof Response) {
        const data = await response.json();
        if (data && data.text) professionalMarkdown = data.text;
      }

      // Convert the professional markdown to semantic TipTap HTML
      const html = markdownToTiptapHTML(professionalMarkdown);

      if (editor.isEmpty) {
        // Empty doc: set entire content
        editor.commands.setContent(html);
      } else {
        // Non-empty doc: insert a separator then content at end
        editor
          .chain()
          .focus('end')
          .insertContent('<p></p><hr><p></p>') // Ensure clear separation
          .insertContent(html)
          .run();
      }

      // Scroll the new content smoothly into view
      requestAnimationFrame(() => {
        const pm = document.querySelector('.ProseMirror');
        if (pm) {
          const lastChild = pm.lastElementChild;
          if (lastChild) {
            lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });

      // Trigger premium glow pulse on the editor card
      const card = document.querySelector('.glass-card');
      if (card) {
        card.classList.remove('insertion-glow');
        // Force reflow so re-adding the class restarts animation
        void (card as HTMLElement).offsetWidth;
        card.classList.add('insertion-glow');
        setTimeout(() => card.classList.remove('insertion-glow'), 2000);
      }

      toast.success('Documento estruturado e inserido com sucesso!', { id: "insert-toast" });
    } catch (error) {
      console.error("Insertion error:", error);
      toast.error('Erro ao estruturar o documento.', { id: "insert-toast" });
      
      // Fallback: just insert the raw text if AI fails
      const html = markdownToTiptapHTML(rawText);
      editor.chain().focus('end').insertContent(html).run();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu assistente do WordAI. Posso ajudar você a gerar contratos, propostas, artigos inteiros ou otimizar seu documento atual. O que gostaria de criar?'
      }
    ]);
  }

  return (
    <aside className="w-80 md:w-96 border-l border-border/40 h-full flex flex-col justify-between bg-card/30 backdrop-blur-xl relative z-20">
      {/* Header Sidebar AI */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-bold text-sm">Assistente WordAI</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            className="h-8 w-8 hover:bg-muted"
            title="Limpar Chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setAiChatOpen(false)}
            className="h-8 w-8 hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area - Scroll-isolated standard div */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-4 pr-3 custom-scrollbar scroll-smooth"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex flex-col gap-1.5 max-w-[85%] ${
                msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {/* Profile Badge */}
              <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                {msg.role === 'user' ? (
                  <>
                    <span>Você</span>
                    <User className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-primary" />
                    <span>IA WordAI</span>
                  </>
                )}
              </div>

              {/* Message Content Bubble */}
              <div className={`p-3 rounded-2xl text-sm leading-relaxed w-full ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10 rounded-tr-none' 
                  : 'glass text-foreground rounded-tl-none border-border/60'
              }`}>
                {/* Parse Markdown Stream to Premium Custom-Styled Elements */}
                <div className="font-sans space-y-2">
                  {msg.role === 'user' ? msg.content : parseMarkdown(msg.content)}
                </div>

                {/* Insertion button inside assistant bubble if text is substantial */}
                {msg.role === 'assistant' && msg.content.length > 50 && (
                  <button
                    type="button"
                    onClick={() => handleInsertIntoEditor(msg.content)}
                    className="mt-3 w-full rounded-xl flex items-center justify-center gap-2 text-[11px] py-2.5 font-bold cursor-pointer
                      bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white
                      shadow-lg shadow-primary/20 hover:shadow-primary/35
                      hover:scale-[1.02] active:scale-[0.97]
                      transition-all duration-200 ease-out
                      border border-white/10"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    Inserir no Documento
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground self-start pl-2">
              <Bot className="h-3.5 w-3.5 text-primary animate-bounce" />
              <span>Redigindo com IA...</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested prompts list */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-border/30 bg-muted/20 flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
            <Compass className="h-3 w-3" />
            Modelos de Prompt Rápidos
          </span>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleSendMessage("Crie uma proposta comercial moderna para uma empresa de refrigeração industrial e climatização inteligente", true)}
              className="text-left text-xs p-2 rounded-xl glass hover:border-primary/30 transition-all text-foreground/80 flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">Proposta Comercial de Refrigeração</span>
              <Sparkles className="h-3 w-3 text-primary" />
            </button>
            <button
              onClick={() => handleSendMessage("Gere um contrato de prestação de serviços de TI completo com cláusulas de propriedade intelectual e sigilo", true)}
              className="text-left text-xs p-2 rounded-xl glass hover:border-primary/30 transition-all text-foreground/80 flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">Contrato de Serviços de TI</span>
              <Sparkles className="h-3 w-3 text-primary" />
            </button>
            <button
              onClick={() => handleSendMessage("Crie um currículo profissional inovador para um Engenheiro de Software sênior especialista em Next.js", true)}
              className="text-left text-xs p-2 rounded-xl glass hover:border-primary/30 transition-all text-foreground/80 flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">Currículo de Software Engineer</span>
              <Sparkles className="h-3 w-3 text-primary" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-border/40">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="relative bg-muted/40 rounded-2xl border border-border/60 p-1 flex items-center gap-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ou peça um documento..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none border-none ring-0 placeholder:text-muted-foreground/80 text-foreground"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 rounded-xl shrink-0 shadow-sm cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </aside>
  )
}

