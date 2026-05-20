"use client"

import React, { use } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import TiptapEditor from "@/components/editor/TiptapEditor"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileWarning, Home } from "lucide-react"

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const router = useRouter()
  // Resolve params asynchronously according to Next.js 15 conventions
  const { id } = use(params)
  
  const { documents } = useEditorStore()
  const documentExists = documents.some((doc) => doc.id === id)

  if (!documentExists) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <FileWarning className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Documento não encontrado</h1>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          O documento solicitado pode ter sido excluído ou o endereço de acesso é inválido.
        </p>
        <Button 
          onClick={() => router.push("/dashboard")} 
          className="rounded-xl font-semibold gap-2 shadow-sm"
        >
          <Home className="h-4 w-4" />
          Voltar para Home
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <TiptapEditor documentId={id} />
    </div>
  )
}
