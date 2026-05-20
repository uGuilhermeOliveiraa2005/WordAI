"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEditorStore, Document } from "@/store/useEditorStore"
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Clock, 
  Star, 
  ChevronRight, 
  Sun, 
  Moon, 
  PanelLeft, 
  ArrowLeft,
  Briefcase,
  FileBadge,
  LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function Dashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const { 
    documents, 
    createDocument, 
    deleteDocument, 
    setCurrentDocument,
    isSidebarOpen,
    setSidebarOpen
  } = useEditorStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'recent'>('all')

  // Set initial sample docs if the user has no documents
  useEffect(() => {
    if (documents.length === 0) {
      // Create some beautiful default sample documents
      const docs = [
        {
          title: "Contrato de Prestação de Serviços - TI",
          content: "Contrato padrão de desenvolvimento de software e soluções com inteligência artificial generativa."
        },
        {
          title: "Proposta Comercial Premium - VRF Climatização",
          content: "Orçamento e projeto técnico completo para instalação de sistema de refrigeração industrial inovador."
        },
        {
          title: "Currículo do Futuro - Engenharia de Software",
          content: "Modelagem profissional de trajetória profissional focada em IA, React, Next.js e computação em nuvem."
        }
      ]
      docs.forEach(doc => {
        const id = createDocument(doc.title)
        // Set the content manually or via direct storage to avoid simple empty ones
        useEditorStore.getState().updateDocument(id, doc.content)
      })
      toast.success("Documentos de exemplo criados com sucesso!")
    }
  }, [documents.length, createDocument])

  const handleCreateNew = () => {
    const id = createDocument()
    setCurrentDocument(id)
    toast.success("Novo documento criado!")
    router.push(`/editor/${id}`)
  }

  const handleSelectDoc = (id: string) => {
    setCurrentDocument(id)
    router.push(`/editor/${id}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteDocument(id)
    toast.info("Documento removido com sucesso")
  }

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar Workspace */}
      <aside className={`glass border-r border-border/40 h-full flex flex-col justify-between transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-none'
      }`}>
        <div className="p-4 flex flex-col gap-6">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm tracking-tight">WordAI Workspace</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 hover:bg-muted"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <Button 
            onClick={handleCreateNew}
            className="w-full justify-start gap-2 shadow-sm rounded-xl font-semibold"
          >
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 text-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                filter === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Meus Documentos
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                filter === 'recent' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Clock className="h-4 w-4" />
              Recentes
            </button>
          </nav>
        </div>

        {/* User Footer Settings */}
        <div className="p-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary/10">
              WA
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-foreground">Sua Conta</span>
              <span className="text-muted-foreground font-mono">Premium SaaS</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 hover:bg-muted"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-6 md:px-12 py-8">
        {/* Toggle Sidebar Button when closed */}
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 h-9 w-9 glass rounded-xl border border-border shadow-sm"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Dashboard Title */}
        <div className="flex justify-between items-center mb-8 mt-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Seja bem-vindo ao futuro
            </h1>
            <p className="text-muted-foreground text-sm">
              Seus documentos, automatizados e desenhados por inteligência artificial.
            </p>
          </div>
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar documentos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border bg-card/60 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Prebuilt Templates Quick Start */}
        <div className="mb-10">
          <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-1.5 text-foreground/90">
            <Sparkles className="h-4 w-4 text-primary" />
            Começo Rápido com Modelos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Quick Template Cards */}
            <Card 
              onClick={() => {
                const id = createDocument("Nova Proposta Comercial")
                // Populate content
                useEditorStore.getState().updateDocument(id, "# Proposta Comercial\n*Criado via template*\n\nInsira os dados da sua proposta...")
                toast.success("Template aplicado!")
                router.push(`/editor/${id}`)
              }}
              className="glass p-5 rounded-2xl border-border/80 hover:border-primary/40 cursor-pointer flex flex-col gap-3 group transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground/95 flex items-center gap-1">
                  Proposta Comercial
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Orçamento elegante, cronogramas e escopo estruturados.</p>
              </div>
            </Card>

            <Card 
              onClick={() => {
                const id = createDocument("Contrato de Parceria Comercial")
                useEditorStore.getState().updateDocument(id, "# Contrato de Parceria Comercial\n*Criado via template*\n\nEste contrato regula...")
                toast.success("Template aplicado!")
                router.push(`/editor/${id}`)
              }}
              className="glass p-5 rounded-2xl border-border/80 hover:border-primary/40 cursor-pointer flex flex-col gap-3 group transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileBadge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground/95 flex items-center gap-1">
                  Contrato de TI / Jurídico
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Documentos legais, termos e cláusulas padronizadas.</p>
              </div>
            </Card>

            <Card 
              onClick={() => {
                const id = createDocument("Currículo Profissional - Tech")
                useEditorStore.getState().updateDocument(id, "# Currículo Profissional\n*Criado via template*\n\nInsira sua experiência...")
                toast.success("Template aplicado!")
                router.push(`/editor/${id}`)
              }}
              className="glass p-5 rounded-2xl border-border/80 hover:border-primary/40 cursor-pointer flex flex-col gap-3 group transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground/95 flex items-center gap-1">
                  Currículo Profissional
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Ganha destaque no mercado com estruturação premium.</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Document Grid / List */}
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-4 text-foreground/90 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Seus Documentos Recentes
          </h2>
          
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-border/40">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground/90">Nenhum documento encontrado</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Crie um novo documento clicando no botão acima ou aplicando um template rápido.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc.id)}
                  className="glass-card hover:border-primary/30 transition-all duration-300 rounded-2xl p-5 cursor-pointer relative group flex flex-col justify-between min-h-[160px] overflow-hidden"
                >
                  <div>
                    {/* Header Doc Card */}
                    <div className="flex items-start justify-between">
                      <div className="h-9 w-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shadow-sm">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, doc.id)}
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Meta Title */}
                    <h3 className="font-bold text-sm mt-4 text-foreground/90 group-hover:text-primary transition-colors truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {doc.content ? doc.content.replace(/[#*`\-]/g, "").slice(0, 120) : "Nenhum conteúdo adicionado..."}
                    </p>
                  </div>

                  {/* Footer Doc Card */}
                  <div className="flex items-center justify-between mt-6 text-[10px] text-muted-foreground border-t border-border/30 pt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atualizado em {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full font-semibold">
                      SaaS Doc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
