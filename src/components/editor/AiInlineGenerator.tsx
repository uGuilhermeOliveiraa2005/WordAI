"use client"

import React, { useEffect, useRef } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { Editor } from "@tiptap/react"
import { parseMarkdown, markdownToTiptapHTML } from "@/utils/markdownParser"
import { Bot, CheckCircle2, XCircle, Sparkles } from "lucide-react"

export function AiInlineGenerator({ editor }: { editor: Editor | null }) {
  const { inlineGeneration, setInlineGeneration } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll as content streams
  useEffect(() => {
    if (containerRef.current && inlineGeneration.status === 'streaming') {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [inlineGeneration.content, inlineGeneration.status])

  if (inlineGeneration.status === 'idle') return null;

  const handleAccept = () => {
    if (!editor || !inlineGeneration.content) return;
    
    // Inject into editor
    const cleanContent = inlineGeneration.content.replace(/^```(markdown|md)?\s*/i, '').replace(/\s*```$/i, '');
    const html = markdownToTiptapHTML(cleanContent);
    
    if (editor.isEmpty) {
      editor.commands.setContent(html);
    } else {
      editor.chain().focus('end').insertContent('<p></p><hr><p></p>').insertContent(html).run();
    }
    
    // Reset state
    setInlineGeneration({
      status: 'idle',
      content: '',
      prompt: ''
    });

    // Scroll to the new content
    setTimeout(() => {
      const pm = document.querySelector('.ProseMirror');
      if (pm) {
        const lastChild = pm.lastElementChild;
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleDiscard = () => {
    setInlineGeneration({
      status: 'idle',
      content: '',
      prompt: ''
    });
  };

  return (
    <div 
      ref={containerRef}
      className="my-4 mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 relative"
    >
      {/* Content Area - Seamless with the document */}
      <div className="py-2">
        {inlineGeneration.content && (
          <div className="font-sans space-y-3 text-foreground/90 leading-relaxed ProseMirror-like">
            {parseMarkdown(inlineGeneration.content.replace(/^```(markdown|md)?\s*/i, '').replace(/\s*```$/i, ''))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {inlineGeneration.status === 'done' && (
        <div className="mt-4 border border-primary/20 bg-primary/5 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-primary/80">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Revisão do Documento Gerado</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            >
              <XCircle className="h-4 w-4" />
              Descartar
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aceitar e Inserir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
