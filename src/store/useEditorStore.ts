import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EditorState {
  documents: Document[];
  currentDocumentId: string | null;
  isSidebarOpen: boolean;
  isAiChatOpen: boolean;
  inlineGeneration: {
    status: 'idle' | 'streaming' | 'done';
    content: string;
    prompt: string;
  };
  globalGeneration: {
    isGenerating: boolean;
    showActions: boolean;
    previousHTML: string;
  };
  
  // Actions
  setSidebarOpen: (isOpen: boolean) => void;
  setAiChatOpen: (isOpen: boolean) => void;
  setInlineGeneration: (data: Partial<EditorState['inlineGeneration']>) => void;
  setGlobalGeneration: (data: Partial<EditorState['globalGeneration']>) => void;
  createDocument: (title?: string) => string;
  setCurrentDocument: (id: string) => void;
  updateDocument: (id: string, content: string, title?: string) => void;
  deleteDocument: (id: string) => void;
  getCurrentDocument: () => Document | undefined;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocumentId: null,
      isSidebarOpen: true,
      isAiChatOpen: false,
      inlineGeneration: {
        status: 'idle',
        content: '',
        prompt: '',
      },
      globalGeneration: {
        isGenerating: false,
        showActions: false,
        previousHTML: '',
      },

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setAiChatOpen: (isOpen) => set({ isAiChatOpen: isOpen }),
      setInlineGeneration: (data) => set((state) => ({ 
        inlineGeneration: { ...state.inlineGeneration, ...data } 
      })),
      setGlobalGeneration: (data) => set((state) => ({
        globalGeneration: { ...state.globalGeneration, ...data }
      })),

      createDocument: (title = 'Untitled Document') => {
        const newDoc: Document = {
          id: crypto.randomUUID(),
          title,
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          documents: [newDoc, ...state.documents],
          currentDocumentId: newDoc.id,
        }));
        return newDoc.id;
      },

      setCurrentDocument: (id) => set({ currentDocumentId: id }),

      updateDocument: (id, content, title) => set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                content,
                ...(title !== undefined && { title }),
                updatedAt: new Date().toISOString(),
              }
            : doc
        ),
      })),

      deleteDocument: (id) => set((state) => {
        const newDocs = state.documents.filter((d) => d.id !== id);
        return {
          documents: newDocs,
          currentDocumentId: state.currentDocumentId === id 
            ? (newDocs.length > 0 ? newDocs[0].id : null) 
            : state.currentDocumentId,
        };
      }),

      getCurrentDocument: () => {
        const { documents, currentDocumentId } = get();
        return documents.find((d) => d.id === currentDocumentId);
      },
    }),
    {
      name: 'wordai-storage',
      partialize: (state) => ({ documents: state.documents }),
    }
  )
);
