import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {cn} from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

const markdownComponents = {
  // Custom components for better styling integration
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold text-foreground mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold text-foreground mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-medium text-foreground mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-muted-foreground mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-muted-foreground" {...props} />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4" {...props} />
  ),
  code: ({inline, ...props}: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) =>
    inline ? (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />
    ) : (
      <code
        className="block bg-muted p-3 rounded text-sm font-mono text-foreground border border-border overflow-x-auto"
        {...props}
      />
    ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-muted p-3 rounded border border-border overflow-x-auto mb-4" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const {src, alt, className, ...rest} = props;
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt || "Guide image"}
        className={cn("max-w-full h-auto rounded-lg border border-border shadow-sm mx-auto block my-6", className)}
        loading="lazy"
        {...rest}
      />
    );
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-primary hover:text-primary/80 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
}

export function MarkdownContent({content, className}: MarkdownContentProps) {
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
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}