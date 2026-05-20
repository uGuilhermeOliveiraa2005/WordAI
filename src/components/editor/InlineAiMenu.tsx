"use client"

import React, { useState } from "react"
import { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { 
  Sparkles, 
  RefreshCw, 
  AlignLeft, 
  Languages, 
  Check, 
  HelpCircle,
  FileCheck2,
  Gauge
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { aiService } from "@/services/ai"
import { toast } from "sonner"

interface InlineAiMenuProps {
  editor: Editor | null;
}

export default function InlineAiMenu({ editor }: InlineAiMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [explainOpen, setExplainOpen] = useState(false)
  const [explainText, setExplainText] = useState("")
  const [isExplaining, setIsExplaining] = useState(false)

  if (!editor) return null;

  const handleAiAction = async (action: 'improve' | 'summarize' | 'translate' | 'professional' | 'casual') => {
    // Get currently selected text
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    
    if (!selectedText.trim()) return;

    setIsLoading(true);
    toast.info("A IA está trabalhando no seu texto...");

    try {
      let response;
      
      if (action === 'improve') {
        response = await aiService.improveText(selectedText);
      } else if (action === 'summarize') {
        response = await aiService.summarize(selectedText);
      } else if (action === 'translate') {
        response = await aiService.translate(selectedText, "Inglês");
      } else if (action === 'professional') {
        response = await aiService.rewriteText(selectedText, 'professional');
      } else if (action === 'casual') {
        response = await aiService.rewriteText(selectedText, 'casual');
      }

      if (response instanceof Response && response.body) {
        // Delete current selection before inserting the replacement
        editor.chain().focus().deleteSelection().run();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: !done });
          
          // Insert the streamed text at the current cursor point
          editor.commands.insertContent(chunk);
        }
        
        toast.success("Texto atualizado com sucesso!");
      } else {
        const text = typeof response === 'string' ? response : 'Erro ao processar';
        editor.chain().focus().insertContent(text).run();
        toast.success("Texto atualizado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Houve uma falha na geração da IA inline.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleExplain = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    
    if (!selectedText.trim()) return;

    setExplainOpen(true);
    setIsExplaining(true);
    setExplainText("");
    toast.info("A IA está analisando seu texto...");

    try {
      const response = await aiService.explainText(selectedText);
      
      if (response instanceof Response && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: !done });
          setExplainText(prev => prev + chunk);
        }
        toast.success("Explicação concluída!");
      } else {
        setExplainText(typeof response === 'string' ? response : 'Erro ao processar');
        toast.success("Explicação concluída!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Houve uma falha na geração da IA inline.");
    } finally {
      setIsExplaining(false);
    }
  }

  return (
    <>
    <BubbleMenu 
      editor={editor} 
      options={{ placement: 'top' }}
      className="glass p-1.5 rounded-xl flex items-center gap-1 shadow-xl border border-border/40 relative z-30"
    >
      <div className="flex items-center gap-1">
        {/* Floating AI Logo Indicator */}
        <div className="px-2.5 py-1 text-xs font-bold text-primary flex items-center gap-1 select-none border-r border-border/40 pr-2">
          <Sparkles className="h-3.5 w-3.5 animate-pulse fill-primary/10" />
          WordAI
        </div>

        {/* Action Button: Explain */}
        <Button
          onClick={handleExplain}
          disabled={isLoading || isExplaining}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs font-semibold px-2 hover:bg-muted text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 mr-1"
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          Explicar
        </Button>

        {/* Action Button: Improve */}
        <Button
          onClick={() => handleAiAction('improve')}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs font-semibold px-2 hover:bg-muted text-foreground/80"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Melhorar
        </Button>

        {/* Action Button: Summarize */}
        <Button
          onClick={() => handleAiAction('summarize')}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs font-semibold px-2 hover:bg-muted text-foreground/80"
        >
          <AlignLeft className="h-3 w-3 mr-1" />
          Resumir
        </Button>

        {/* Action Dropdown: Rewrite Tone */}
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isLoading}
            className={buttonVariants({ 
              variant: "ghost", 
              size: "sm", 
              className: "h-8 rounded-lg text-xs font-semibold px-2 hover:bg-muted text-foreground/80 flex items-center gap-1 cursor-pointer" 
            })}
          >
            <Gauge className="h-3 w-3 mr-1" />
            Tom
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass rounded-xl p-1 border-border/40">
            <DropdownMenuItem onClick={() => handleAiAction('professional')} className="text-xs rounded-lg cursor-pointer">
              Profissional
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAiAction('casual')} className="text-xs rounded-lg cursor-pointer">
              Descontraído
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action Button: Translate to English */}
        <Button
          onClick={() => handleAiAction('translate')}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs font-semibold px-2 hover:bg-muted text-foreground/80"
        >
          <Languages className="h-3 w-3 mr-1" />
          Traduzir (EN)
        </Button>
      </div>
    </BubbleMenu>

    {/* Explanation Modal */}
    <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
      <DialogContent className="glass sm:max-w-md border-border/40 z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Explicação da IA
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 rounded-xl bg-background/50 border border-border/40 mt-2 min-h-[100px] max-h-[60vh] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
          {explainText || (isExplaining ? "Analisando o texto..." : "")}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
