"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useEditorStore } from "@/store/useEditorStore"
import { Editor } from "@tiptap/react"
import { 
  ArrowLeft, 
  Sparkles, 
  Download, 
  Share2, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Table,
  Heading1,
  Heading2,
  Code,
  Undo2,
  Redo2,
  CheckSquare
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  editor: Editor | null;
  title: string;
  docId: string;
  onTitleChange: (newTitle: string) => void;
}

export default function Toolbar({ editor, title, docId, onTitleChange }: ToolbarProps) {
  const router = useRouter()
  const { setAiChatOpen, isAiChatOpen } = useEditorStore()

  if (!editor) return null;

  const handleExport = (format: 'pdf' | 'docx' | 'markdown' | 'html') => {
    const content = editor.getHTML()
    const markdown = editor.getText()

    if (format === 'markdown') {
      const element = document.createElement("a");
      const file = new Blob([markdown], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
      document.body.appendChild(element);
      element.click();
      toast.success("Documento exportado em Markdown!");
    } else if (format === 'html') {
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(element);
      element.click();
      toast.success("Documento exportado em HTML!");
    } else if (format === 'pdf') {
      // Premium PDF generation via browser native print
      window.print();
      toast.success("Preparando PDF para impressão...");
    } else if (format === 'docx') {
      // Mock docx download
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'application/msword' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/\s+/g, '-')}.doc`;
      document.body.appendChild(element);
      element.click();
      toast.success("Documento exportado em DOCX!");
    }
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40 py-3 px-6 flex items-center justify-between gap-4">
      {/* Navigation & Editable Title */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <input 
          type="text" 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-lg font-bold border-none outline-none focus:ring-0 focus:border-b focus:border-primary/50 text-foreground truncate w-full max-w-[150px] sm:max-w-[240px] md:max-w-[320px]"
          placeholder="Untitled Document"
        />
      </div>

      {/* Basic Formatting toolbar for quick access */}
      <div className={cn(
        "items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/20",
        isAiChatOpen ? "hidden xl:flex" : "hidden lg:flex"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("bold") ? "bg-primary/10 text-primary" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("italic") ? "bg-primary/10 text-primary" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("heading", { level: 1 }) ? "bg-primary/10 text-primary" : ""}`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("heading", { level: 2 }) ? "bg-primary/10 text-primary" : ""}`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("bulletList") ? "bg-primary/10 text-primary" : ""}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("orderedList") ? "bg-primary/10 text-primary" : ""}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("taskList") ? "bg-primary/10 text-primary" : ""}`}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 rounded-lg ${editor.isActive("blockquote") ? "bg-primary/10 text-primary" : ""}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 rounded-lg"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 rounded-lg"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-2">
        {/* Toggle AI Sidebar Button */}
        <Button
          onClick={() => setAiChatOpen(!isAiChatOpen)}
          className={`rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
            isAiChatOpen 
              ? "bg-primary text-primary-foreground shadow-primary/20" 
              : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden md:inline">Assistente IA</span>
        </Button>

        {/* Dropdown Export */}
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ 
            variant: "outline", 
            className: "rounded-xl flex items-center gap-1.5 glass border-border/80 cursor-pointer" 
          })}>
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass rounded-xl p-1 border-border/40">
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-lg gap-2 cursor-pointer">
              Exportar para PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')} className="rounded-lg gap-2 cursor-pointer">
              Exportar para Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('markdown')} className="rounded-lg gap-2 cursor-pointer">
              Exportar Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('html')} className="rounded-lg gap-2 cursor-pointer">
              Exportar HTML (.html)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
