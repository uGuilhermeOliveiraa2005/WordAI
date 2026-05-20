// Since we don't have the actual OpenCode SDK installed, we'll simulate the interface
// and use the standard fetch API to communicate if needed, or mock it beautifully.
// In a real environment, you'd import from 'opencode'
// import opencode from 'opencode';

const MODEL = "opencode/minimax-m2.5-free";

// We'll create an interface for the messages
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Since I am an AI acting as the system, and OpenCode.cmd is an internal tool,
// we will simulate the connection using a mock function that streams responses for demonstration,
// but structure it exactly as requested.
// To make it functional in this Next.js app, we can use server actions or API routes.
// Let's create an API route fetcher here.

export const aiService = {
  async callOpenCode(messages: Message[], stream = true): Promise<Response | string> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: MODEL, stream }),
      });
      
      if (!response.ok) throw new Error('Failed to generate AI response');
      
      if (stream) return response; // Returns the readable stream response
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  async generateDocument(prompt: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: `Você é um especialista em criação de documentos profissionais no WordAI.
Sempre gere documentos modernos, bem estruturados, claros, visualmente organizados e altamente profissionais.
Utilize Markdown rico. Formate bem com títulos (H1, H2), listas, negrito e tabelas quando aplicável.
Não inclua explicações, apenas o conteúdo do documento.`,
      },
      { role: 'user', content: prompt }
    ];
    return this.callOpenCode(messages, true);
  },

  async improveText(text: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'Melhore a escrita do texto a seguir. Torne-o mais profissional, claro e envolvente. Mantenha o formato original (markdown se houver). Retorne apenas o texto melhorado.',
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  },

  async rewriteText(text: string, tone: 'professional' | 'casual' | 'academic' = 'professional') {
    const messages: Message[] = [
      {
        role: 'system',
        content: `Reescreva o texto a seguir com um tom ${tone}. Retorne apenas o texto reescrito.`,
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  },

  async summarize(text: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'Resuma o texto a seguir de forma concisa e direta. Mantenha os pontos principais em bullet points.',
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  },

  async continueWriting(text: string, context?: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'Continue escrevendo o texto a partir de onde parou. Mantenha o mesmo tom e estilo. ' + (context ? `Contexto do documento: ${context}` : ''),
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  },
  
  async translate(text: string, targetLanguage: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: `Traduza o texto a seguir para ${targetLanguage}. Retorne apenas a tradução.`,
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  },

  async explainText(text: string) {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'Você é um especialista. Explique do que se trata o seguinte texto ou projeto de forma altamente profissional, resumida e fácil de entender. Retorne apenas a explicação.',
      },
      { role: 'user', content: text }
    ];
    return this.callOpenCode(messages, true);
  }
};
