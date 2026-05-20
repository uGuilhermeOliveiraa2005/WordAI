import React, { useState } from "react"
import { ClipboardCheck } from "lucide-react"
import { toast } from "sonner"

// Interactive CodeBlock with Copy Button
export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Código copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl border border-border/40 overflow-hidden shadow-md bg-zinc-950 text-zinc-100 font-mono text-xs w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border/20">
        <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
          {language || "código"}
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white transition text-zinc-400 text-[10px] cursor-pointer"
        >
          <ClipboardCheck className="h-3 w-3" />
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Inline Markdown Elements Parser (Bold, Italic, Inline Code)
export function parseInlineMarkdown(text: string): React.ReactNode {
  let parts: React.ReactNode[] = [text];
  
  // 1. Process inline code: `code`
  parts = parts.flatMap((part, idx) => {
    if (typeof part !== 'string') return part;
    const regex = /`([^`]+)`/g;
    const pieces = part.split(regex);
    return pieces.map((piece, i) => {
      if (i % 2 === 1) {
        return (
          <code key={`code-inline-${idx}-${i}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary/90 border border-border/30">
            {piece}
          </code>
        );
      }
      return piece;
    });
  });

  // 2. Process bold: **bold**
  parts = parts.flatMap((part, idx) => {
    if (typeof part !== 'string') return part;
    const regex = /\*\*([^*]+)\*\*/g;
    const pieces = part.split(regex);
    return pieces.map((piece, i) => {
      if (i % 2 === 1) {
        return <strong key={`bold-${idx}-${i}`} className="font-semibold text-foreground">{piece}</strong>;
      }
      return piece;
    });
  });

  // 3. Process italic: *italic* or _italic_
  parts = parts.flatMap((part, idx) => {
    if (typeof part !== 'string') return part;
    const regex = /\*([^*]+)\*/g;
    const pieces = part.split(regex);
    return pieces.map((piece, i) => {
      if (i % 2 === 1) {
        return <em key={`italic-${idx}-${i}`} className="italic text-foreground/90">{piece}</em>;
      }
      return piece;
    });
  });

  parts = parts.flatMap((part, idx) => {
    if (typeof part !== 'string') return part;
    const regex = /_([^_]+)_/g;
    const pieces = part.split(regex);
    return pieces.map((piece, i) => {
      if (i % 2 === 1) {
        return <em key={`italic-u-${idx}-${i}`} className="italic text-foreground/90">{piece}</em>;
      }
      return piece;
    });
  });

  return <>{parts}</>;
}

// Complete Markdown Block Parser (Headers, Lists, Tables, Paragraphs)
export function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockLines: string[] = [];
  
  let inList = false;
  let listItems: string[] = [];
  let isNumberedList = false;
  
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  
  const flushList = (key: string | number) => {
    if (listItems.length === 0) return;
    const ListTag = isNumberedList ? 'ol' : 'ul';
    elements.push(
      <ListTag 
        key={`list-${key}`} 
        className={isNumberedList ? "list-decimal pl-5 my-2 space-y-1.5 text-foreground/90" : "list-disc pl-5 my-2 space-y-1.5 text-foreground/90"}
      >
        {listItems.map((item, idx) => (
          <li key={idx} className="text-sm">
            {parseInlineMarkdown(item)}
          </li>
        ))}
      </ListTag>
    );
    listItems = [];
    inList = false;
  };

  const flushTable = (key: string | number) => {
    if (tableRows.length === 0 && tableHeaders.length === 0) return;
    elements.push(
      <div key={`table-wrapper-${key}`} className="overflow-x-auto my-3 rounded-xl border border-border/40 w-full">
        <table className="min-w-full divide-y divide-border/30 text-xs">
          {tableHeaders.length > 0 && (
            <thead className="bg-muted/60 text-muted-foreground font-semibold">
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-semibold">
                    {parseInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-border/20 bg-card/10">
            {tableRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-muted/5" : ""}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-foreground/80 whitespace-normal">
                    {parseInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code block check
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeContent = codeBlockLines.join('\n');
        elements.push(
          <CodeBlock 
            key={`code-${i}`} 
            code={codeContent} 
            language={codeBlockLanguage} 
          />
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Flush any other structures first
        flushList(i);
        flushTable(i);
        
        inCodeBlock = true;
        codeBlockLanguage = line.trim().substring(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }
    
    // Table check
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isTableRow) {
      flushList(i);
      
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      
      // Check if it is a separator line like `|---|---|`
      const isSeparator = cells.every(c => c.match(/^:?-+:?$/));
      if (isSeparator) {
        continue;
      }
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      if (inTable) {
        flushTable(i);
      }
    }
    
    // List check
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)/);
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
    
    if (bulletMatch) {
      if (inList && isNumberedList) {
        flushList(i);
      }
      inList = true;
      isNumberedList = false;
      listItems.push(bulletMatch[3]);
      continue;
    } else if (numberMatch) {
      if (inList && !isNumberedList) {
        flushList(i);
      }
      inList = true;
      isNumberedList = true;
      listItems.push(numberMatch[3]);
      continue;
    } else {
      if (inList) {
        flushList(i);
      }
    }
    
    // Empty line check
    if (line.trim() === '') {
      continue;
    }
    
    // Heading check
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const titleText = headingMatch[2];
      
      if (level === 1) {
        elements.push(<h1 key={`h1-${i}`} className="text-base font-bold text-foreground mt-4 mb-2 border-b border-border/20 pb-1">{parseInlineMarkdown(titleText)}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={`h2-${i}`} className="text-sm font-bold text-foreground mt-3 mb-1.5">{parseInlineMarkdown(titleText)}</h2>);
      } else {
        elements.push(<h3 key={`h3-${i}`} className="text-xs font-bold text-foreground/90 mt-2.5 mb-1">{parseInlineMarkdown(titleText)}</h3>);
      }
      continue;
    }
    
    // Default Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/80 mb-2">
        {parseInlineMarkdown(line)}
      </p>
    );
  }
  
  // Flush any remaining active structures
  flushList('end');
  flushTable('end');
  
  return elements;
}

// ─── Markdown → TipTap HTML Converter ─────────────────────────────
// Converts raw AI markdown into semantic HTML that TipTap's ProseMirror
// schema renders using the editor's native premium styling (globals.css)
export function markdownToTiptapHTML(markdown: string): string {
  try {
    const lines = markdown.split('\n');
    const out: string[] = [];

    let inCode = false, codeLang = '', codeBuf: string[] = [];
    let listBuf: { txt: string; checked?: boolean }[] = [];
    let listKind: 'ul' | 'ol' | 'task' = 'ul';
    let tblHead: string[] = [], tblRows: string[][] = [], inTbl = false;
    let bqBuf: string[] = [];

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const inl = (t: string): string => {
      let r = t;
      // Code inline
      r = r.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Bold
      r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic (using word boundaries to avoid lookbehinds)
      r = r.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');
      r = r.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$1<em>$2</em>');
      return r;
    };

    const flushList = () => {
      if (!listBuf.length) return;
      if (listKind === 'task') {
        out.push('<ul data-type="taskList">');
        listBuf.forEach(it => {
          out.push(`<li data-type="taskItem" data-checked="${it.checked ? 'true' : 'false'}"><p>${inl(it.txt)}</p></li>`);
        });
        out.push('</ul>');
      } else {
        out.push(`<${listKind}>`);
        listBuf.forEach(it => out.push(`<li><p>${inl(it.txt)}</p></li>`));
        out.push(`</${listKind}>`);
      }
      listBuf = [];
    };

    const flushTable = () => {
      if (!tblHead.length && !tblRows.length) return;
      out.push('<table>');
      if (tblHead.length) {
        out.push('<tr>');
        tblHead.forEach(h => out.push(`<th><p>${inl(h)}</p></th>`));
        out.push('</tr>');
      }
      tblRows.forEach(row => {
        out.push('<tr>');
        row.forEach(c => out.push(`<td><p>${inl(c)}</p></td>`));
        out.push('</tr>');
      });
      out.push('</table>');
      tblHead = []; tblRows = []; inTbl = false;
    };

    const flushBq = () => {
      if (!bqBuf.length) return;
      out.push('<blockquote>');
      bqBuf.forEach(l => out.push(`<p>${inl(l)}</p>`));
      out.push('</blockquote>');
      bqBuf = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];

      // Code fence toggle
      if (ln.trim().startsWith('```')) {
        if (inCode) {
          out.push(`<pre><code${codeLang ? ` class="language-${codeLang}"` : ''}>${esc(codeBuf.join('\n'))}</code></pre>`);
          codeBuf = []; inCode = false;
        } else {
          flushList(); flushTable(); flushBq();
          inCode = true; codeLang = ln.trim().slice(3).trim();
        }
        continue;
      }
      if (inCode) { codeBuf.push(ln); continue; }

      // Table row
      const isTR = ln.trim().startsWith('|') && ln.trim().endsWith('|');
      if (isTR) {
        flushList(); flushBq();
        const cells = ln.split('|').map(c => c.trim()).slice(1, -1);
        if (cells.every(c => /^:?-+:?$/.test(c))) continue; // separator
        if (!inTbl) { inTbl = true; tblHead = cells; } else { tblRows.push(cells); }
        continue;
      } else if (inTbl) { flushTable(); }

      // Blockquote
      const bqM = ln.match(/^>\s?(.*)/);
      if (bqM) { flushList(); flushTable(); bqBuf.push(bqM[1]); continue; }
      else if (bqBuf.length) { flushBq(); }

      // Task list
      const tkM = ln.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.*)/);
      if (tkM) {
        if (listBuf.length && listKind !== 'task') flushList();
        listKind = 'task';
        listBuf.push({ txt: tkM[2], checked: tkM[1].toLowerCase() === 'x' });
        continue;
      }
      // Bullet list
      const blM = ln.match(/^\s*[-*+]\s+(.*)/);
      if (blM) {
        if (listBuf.length && listKind !== 'ul') flushList();
        listKind = 'ul'; listBuf.push({ txt: blM[1] }); continue;
      }
      // Numbered list
      const nlM = ln.match(/^\s*\d+\.\s+(.*)/);
      if (nlM) {
        if (listBuf.length && listKind !== 'ol') flushList();
        listKind = 'ol'; listBuf.push({ txt: nlM[1] }); continue;
      }
      if (listBuf.length) flushList();

      if (ln.trim() === '') {
        // Add a small spacing for empty lines if not handled by paragraphs
        continue;
      }
      
      if (/^(---+|\*\*\*+|___+)\s*$/.test(ln.trim())) { out.push('<hr>'); continue; }

      const hM = ln.match(/^(#{1,6})\s+(.*)/);
      if (hM) { 
        out.push(`<h${hM[1].length}>${inl(hM[2])}</h${hM[1].length}>`); 
        continue; 
      }

      // Preserve raw HTML (block level) without wrapping in <p>
      // The AI is instructed to generate valid HTML for premium components
      if (/^\s*<[/a-zA-Z][^>]*>/.test(ln)) {
        out.push(ln);
        continue;
      }

      out.push(`<p>${inl(ln)}</p>`);
    }

    flushList(); flushTable(); flushBq();
    if (inCode && codeBuf.length) {
      out.push(`<pre><code${codeLang ? ` class="language-${codeLang}"` : ''}>${esc(codeBuf.join('\n'))}</code></pre>`);
    }

    // Wrap the entire output to ensure TipTap digests it as a block of nodes
    return `<div>${out.join('')}</div>`;
  } catch (err) {
    console.error("Markdown parse error", err);
    // Ultimate fallback: Just wrap everything in paragraphs so it's not totally broken
    return markdown.split('\n').map(l => `<p>${l}</p>`).join('');
  }
}
