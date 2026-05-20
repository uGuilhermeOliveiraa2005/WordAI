"use client"

import React, { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { Extension, Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"

import Toolbar from "./Toolbar"
import InlineAiMenu from "./InlineAiMenu"
import AiSidebar from "./AiSidebar"
import { useEditorStore } from "@/store/useEditorStore"
import { 
  Sparkles, 
  Heading1, 
  Heading2, 
  List, 
  CheckSquare, 
  Table as TableIcon,
  Quote,
  Command,
  FileCode,
  Check,
  X,
  Loader2
} from "lucide-react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { toast } from "sonner"

interface TiptapEditorProps {
  documentId: string;
}

export default function TiptapEditor({ documentId }: TiptapEditorProps) {
  const { documents, updateDocument, globalGeneration, setGlobalGeneration } = useEditorStore()
  const documentItem = documents.find((doc) => doc.id === documentId)

  const [title, setTitle] = useState(documentItem?.title || "Untitled Document")
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })

  const CustomAttributes = Extension.create({
    name: 'customAttributes',
    addGlobalAttributes() {
      return [
        {
          types: ['text', 'paragraph', 'heading', 'table', 'tableCell', 'tableHeader', 'tableRow', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'divBlock', 'spanInline'],
          attributes: {
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => {
                if (!attributes.class) return {}
                return { class: attributes.class }
              },
            },
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) return {}
                return { style: attributes.style }
              },
            }
          }
        }
      ]
    }
  })

  const DivNode = Node.create({
    name: 'divBlock',
    group: 'block',
    content: 'block*',
    parseHTML() {
      return [{ tag: 'div' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes), 0]
    },
  })

  const SpanNode = Node.create({
    name: 'spanInline',
    group: 'inline',
    inline: true,
    content: 'inline*',
    parseHTML() {
      return [{ tag: 'span' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', mergeAttributes(HTMLAttributes), 0]
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Digite '/' para blocos e IA, ou simplesmente selecione o texto..."
      }),
      CustomAttributes,
      DivNode,
      SpanNode
    ],
    content: documentItem?.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Auto-save changes dynamically to Zustand
      updateDocument(documentId, html, title)

      // Handle custom Notion-style slash command detection
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.nodeBefore?.text || ""
      
      if (textBefore.endsWith("/")) {
        // Simple and robust detection for slash suggestions
        const view = editor.view
        const coords = view.coordsAtPos($from.pos)
        setSlashMenuPosition({
          top: coords.top + window.scrollY + 20,
          left: coords.left + window.scrollX
        })
        setShowSlashMenu(true)
      } else {
        setShowSlashMenu(false)
      }
    }
  })

  // Watch for external content or document swaps
  useEffect(() => {
    if (editor && documentItem) {
      if (editor.getHTML() !== documentItem.content) {
        editor.commands.setContent(documentItem.content)
      }
      setTitle(documentItem.title)
    }
  }, [documentId, editor])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (editor) {
      updateDocument(documentId, editor.getHTML(), newTitle)
    }
  }

  // Helper to execute commands from slash popover
  const executeSlashCommand = (command: string) => {
    if (!editor) return;

    // Delete the "/" typed before executing
    const { selection } = editor.state
    const { $from } = selection
    editor.commands.deleteRange({ from: $from.pos - 1, to: $from.pos })

    if (command === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    } else if (command === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    } else if (command === 'bullet') {
      editor.chain().focus().toggleBulletList().run()
    } else if (command === 'todo') {
      editor.chain().focus().toggleTaskList().run()
    } else if (command === 'quote') {
      editor.chain().focus().toggleBlockquote().run()
    } else if (command === 'code') {
      editor.chain().focus().toggleCodeBlock().run()
    } else if (command === 'table') {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    } else if (command === 'ai') {
      // Trigger AI sidebar or custom immediate generator
      useEditorStore.getState().setAiChatOpen(true)
    }

    setShowSlashMenu(false)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Editor Main Canvas panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Toolbar 
          editor={editor} 
          title={title} 
          docId={documentId} 
          onTitleChange={handleTitleChange} 
        />
        
        {/* Document Editing Surface */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-4xl mx-auto w-full select-text relative">
          <InlineAiMenu editor={editor} />
          
          <div className={`glass-card p-10 md:p-16 rounded-3xl min-h-[700px] border shadow-xl relative bg-card/45 backdrop-blur-md print:border-none print:shadow-none print:bg-transparent transition-all duration-500 ${
            globalGeneration.isGenerating 
              ? 'border-primary/50 shadow-primary/10' 
              : 'border-border/40'
          }`}>
            {/* Soft subtle border top highlight */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-primary via-indigo-500 to-purple-500 transition-opacity duration-300 ${
              globalGeneration.isGenerating ? 'animate-pulse' : ''
            }`} />

            {/* Floating AI Generation Indicator */}
            {globalGeneration.isGenerating && (
              <div className="sticky top-4 z-30 flex justify-center mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/30 backdrop-blur-xl shadow-lg shadow-primary/5">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-primary">IA redigindo documento...</span>
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <EditorContent editor={editor} />
          </div>

          {/* Floating Accept / Discard Bar after generation */}
          {globalGeneration.showActions && (
            <div className="sticky bottom-6 z-30 flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/90 border border-border/60 backdrop-blur-xl shadow-2xl">
                <span className="text-xs font-medium text-muted-foreground">Documento gerado pela IA</span>
                <button
                  onClick={() => {
                    setGlobalGeneration({ showActions: false });
                    toast.success("Documento mantido com sucesso!");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                    bg-gradient-to-r from-emerald-500 to-green-500 text-white
                    shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40
                    hover:scale-[1.03] active:scale-[0.97]
                    transition-all duration-200 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Manter
                </button>
                <button
                  onClick={() => {
                    if (editor && globalGeneration.previousHTML) {
                      editor.commands.setContent(globalGeneration.previousHTML);
                    } else if (editor) {
                      editor.commands.clearContent();
                    }
                    setGlobalGeneration({ showActions: false, previousHTML: '' });
                    toast.info("Conteúdo gerado foi descartado.");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                    bg-gradient-to-r from-red-500 to-rose-500 text-white
                    shadow-md shadow-red-500/20 hover:shadow-red-500/40
                    hover:scale-[1.03] active:scale-[0.97]
                    transition-all duration-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notion-style custom inline slash commands overlay */}
      {showSlashMenu && (
        <div 
          style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
          className="absolute z-50 glass-card p-2 rounded-2xl shadow-2xl border border-border/80 w-64 flex flex-col gap-1 transition-all"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1 border-b border-border/30 mb-1">
            <Command className="h-3 w-3" />
            Adicionar Bloco
          </div>
          
          <button 
            onClick={() => executeSlashCommand('ai')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-primary font-semibold bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Pedir para IA WordAI
          </button>
          
          <button 
            onClick={() => executeSlashCommand('h1')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <Heading1 className="h-4 w-4 text-muted-foreground" />
            Título 1
          </button>

          <button 
            onClick={() => executeSlashCommand('h2')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <Heading2 className="h-4 w-4 text-muted-foreground" />
            Título 2
          </button>

          <button 
            onClick={() => executeSlashCommand('bullet')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <List className="h-4 w-4 text-muted-foreground" />
            Lista com Marcadores
          </button>

          <button 
            onClick={() => executeSlashCommand('todo')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Lista de Tarefas
          </button>

          <button 
            onClick={() => executeSlashCommand('table')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <TableIcon className="h-4 w-4 text-muted-foreground" />
            Tabela Inteligente
          </button>

          <button 
            onClick={() => executeSlashCommand('quote')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <Quote className="h-4 w-4 text-muted-foreground" />
            Citação / Destaque
          </button>

          <button 
            onClick={() => executeSlashCommand('code')}
            className="flex items-center gap-2.5 w-full text-left text-xs p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            <FileCode className="h-4 w-4 text-muted-foreground" />
            Bloco de Código
          </button>
        </div>
      )}

      {/* Sidebar AI ChatGPT-like Panel */}
      <AiSidebar editor={editor} />
    </div>
  )
}
