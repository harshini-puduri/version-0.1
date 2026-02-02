import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; alt?: string; title?: string; width?: number; align?: string }) => ReturnType;
    };
  }
}

const ResizableImageComponent = ({ node, updateAttributes, deleteNode, selected }: any) => {
  const [isResizing, setIsResizing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = imgRef.current?.offsetWidth || 400;
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNode();
  }, [deleteNode]);

  const handleAlign = useCallback((align: 'left' | 'center' | 'right') => {
    updateAttributes({ align });
  }, [updateAttributes]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(150, Math.min(startWidthRef.current + diff, 800));
      
      if (imgRef.current) {
        imgRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (imgRef.current) {
        updateAttributes({ width: imgRef.current.offsetWidth });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  const alignment = node.attrs.align || 'center';

  const alignmentClass =
    alignment === 'left'
      ? 'justify-start'
      : alignment === 'right'
        ? 'justify-end'
        : 'justify-center';

  return (
    <NodeViewWrapper className="my-4">
      <div className={`flex ${alignmentClass}`}>
        <div
          className={`relative inline-block w-fit max-w-full ${selected ? 'ring-2 ring-primary ring-offset-4 rounded-xl' : ''}`}
          contentEditable={false}
          data-drag-handle=""
        >
          <img
            ref={imgRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            style={{
              width: node.attrs.width ? `${node.attrs.width}px` : '400px',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
            className="rounded-xl"
            draggable="false"
            onError={() => setImageError(true)}
          />
          
          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100/90 rounded-xl">
              <p className="text-red-600 text-sm">Failed to load image</p>
            </div>
          )}
          
          {/* Controls - only show when selected */}
          {selected && !imageError && (
            <>
              {/* Top toolbar */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/95 backdrop-blur rounded-full px-2 py-1.5 shadow-lg border border-border">
                {/* Alignment buttons */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAlign('left'); }}
                  className={`p-1.5 rounded-full transition-colors ${alignment === 'left' ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                  title="Align left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="14" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAlign('center'); }}
                  className={`p-1.5 rounded-full transition-colors ${alignment === 'center' ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                  title="Center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAlign('right'); }}
                  className={`p-1.5 rounded-full transition-colors ${alignment === 'right' ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                  title="Align right"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="10" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
                
                <div className="w-px h-4 bg-border" />
                
                {/* Delete button */}
                <button
                  onClick={handleDelete}
                  className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-muted-foreground"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Right resize handle */}
              <div
                onMouseDown={handleResizeStart}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-primary hover:bg-primary/80 rounded-full cursor-ew-resize flex items-center justify-center shadow-md"
                title="Drag to resize"
              >
                <div className="w-0.5 h-4 bg-primary-foreground/60 rounded-full" />
              </div>
              
              {/* Size indicator */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded-md">
                {imgRef.current?.offsetWidth || node.attrs.width || 400}px
              </div>
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'resizableImage',

  group: 'block',

  draggable: true,
  
  selectable: true,

  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: 400 },
      align: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setResizableImage: (options: { src: string; alt?: string; title?: string; width?: number; align?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: options.src,
            alt: options.alt,
            title: options.title,
            width: options.width || 400,
            align: options.align || 'center',
          },
        });
      },
    };
  },
});
