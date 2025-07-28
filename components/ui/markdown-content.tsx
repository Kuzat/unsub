import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:text-foreground prose-p:text-muted-foreground",
        "prose-strong:text-foreground prose-code:text-foreground",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        "prose-blockquote:border-l-border prose-blockquote:text-muted-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-li:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      components={{
        // Custom components for better styling integration
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-foreground mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium text-foreground mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-muted-foreground">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
            {children}
          </blockquote>
        ),
        code: ({ inline, children }) => 
          inline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
              {children}
            </code>
          ) : (
            <code className="block bg-muted p-3 rounded text-sm font-mono text-foreground border border-border overflow-x-auto">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="bg-muted p-3 rounded border border-border overflow-x-auto mb-4">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-primary hover:text-primary/80 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
        >
          {content}
      </ReactMarkdown>
    </div>
  )
}