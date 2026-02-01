import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { GripHorizontal, X } from 'lucide-react';

const ResizableImageComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = imgRef.current?.offsetWidth || 0;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode();
  };

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(200, Math.min(startWidthRef.current + diff, 800));
      if (imgRef.current) {
        imgRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (imgRef.current) {
        updateAttributes({
          width: imgRef.current.offsetWidth,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  return (
    <NodeViewWrapper 
      className="my-4 block" 
      data-drag-handle
    >
      <div
        ref={containerRef}
        className={`relative inline-block transition-all ${
          isSelected ? 'ring-2 ring-primary/50 rounded-2xl' : ''
        }`}
        onClick={handleImageClick}
        contentEditable={false}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={{
            width: node.attrs.width ? `${node.attrs.width}px` : '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
          className="rounded-2xl cursor-pointer transition-all"
          draggable="false"
        />
        
        {/* Controls - only show when selected */}
        {isSelected && (
          <>
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all z-10"
              title="Delete image"
              contentEditable={false}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Resize handle - right side */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-14 bg-primary hover:bg-primary/90 rounded-full cursor-ew-resize flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
              title="Drag to resize"
              contentEditable={false}
            >
              <GripHorizontal className="w-3 h-3 text-primary-foreground" />
            </div>

            {/* Size indicator */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg backdrop-blur-sm font-medium">
              {imgRef.current?.offsetWidth || node.attrs.width || 'auto'}px
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'resizableImage',

  group: 'block',

  draggable: true,
  
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setResizableImage: (options: { src: string; alt?: string; title?: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});