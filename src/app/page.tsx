"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  BrainCircuit, 
  Settings, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Moon, 
  Sun,
  LayoutTemplate
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            WordAI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Link href="/dashboard">
            <Button className="rounded-full px-5 shadow-md shadow-primary/20 flex items-center gap-1.5 group">
              Iniciar App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-20 flex flex-col items-center text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide mb-8"
          >
            <Zap className="h-3 w-3 fill-primary" />
            O Futuro da Edição de Documentos Chegou
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-none"
          >
            O editor de documentos <br />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              mais inteligente do planeta.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            Crie, edite e formate documentos corporativos de alta performance em segundos com IA nativa. Uma experiência fluida que mistura o poder de Notion, Canva e ChatGPT.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
            <Link href="/dashboard" className="sm:w-auto w-full">
              <Button size="lg" className="rounded-full px-8 w-full font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/30 flex items-center gap-2">
                Começar Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#features" className="sm:w-auto w-full">
              <Button size="lg" variant="outline" className="rounded-full px-8 w-full font-semibold glass border-border/80">
                Ver Recursos
              </Button>
            </a>
          </motion.div>

          {/* Visual Showcase (Browser mockup) */}
          <motion.div 
            variants={itemVariants}
            className="w-full rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl p-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/40">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="text-xs text-muted-foreground/80 font-mono bg-muted/60 px-3 py-1 rounded-md max-w-xs truncate">
                wordai.app/doc/proposta-comercial
              </div>
              <div className="w-12" />
            </div>
            
            {/* Mock Editor Canvas */}
            <div className="p-8 md:p-12 text-left bg-background/20 min-h-[300px] flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="h-8 bg-muted rounded-md w-1/3 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-muted rounded w-4/5 animate-pulse" />
              </div>
              <div className="border border-border/40 rounded-xl p-4 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    AI
                  </div>
                  <span className="text-sm font-semibold text-foreground/90">Gerando proposta de climatização premium...</span>
                </div>
                <div className="h-2 w-24 bg-primary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-infinite-scroll" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <section id="features" className="w-full pt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Diga adeus à formatação cansativa.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Nossa IA integrada e editor modular cuidam de toda a parte pesada para você focar no que importa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
            <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 group hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl">IA Contextual Nativa</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nossa inteligência artificial analisa todo o documento e compreende o tom que você deseja expressar. Edite apenas com comandos de linguagem natural.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 group hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl">Biblioteca de Templates</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Parta de designs modernos e ultra sofisticados para contratos, currículos, propostas comerciais ou relatórios corporativos.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 group hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl">Comandos Rápidos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Digite "/" para ter controle total sobre tabelas, imagens, listas, callouts e blocos de IA sem retirar as mãos do teclado.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 md:px-12 glass flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} WordAI Technologies Inc. Todos os direitos reservados.
        </span>
        <div className="flex gap-6 text-xs text-muted-foreground/80">
          <a href="#" className="hover:text-foreground">Privacidade</a>
          <a href="#" className="hover:text-foreground">Termos de Uso</a>
          <a href="#" className="hover:text-foreground">Contato</a>
        </div>
      </footer>
    </div>
  )
}
