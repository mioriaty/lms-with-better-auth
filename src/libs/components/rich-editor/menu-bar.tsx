'use client';

import { Button } from '@/libs/components/ui/button';
import { Separator } from '@/libs/components/ui/separator';
import { Toggle } from '@/libs/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/libs/components/ui/tooltip';
import { cn } from '@/libs/utils/string';
import { ListBulletIcon } from '@radix-ui/react-icons';
import { type Editor } from '@tiptap/react';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListOrderedIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon
} from 'lucide-react';
import { FC, useEffect, useState } from 'react';

interface MenuBarProps {
  editor: Editor | null;
}

export const MenuBar: FC<MenuBarProps> = ({ editor }) => {
  const [, setRenderKey] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => setRenderKey((prev) => prev + 1);

    editor.on('transaction', update);
    editor.on('selectionUpdate', update);

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="p-2 bg-card flex flex-wrap items-center gap-1 border-b border-input rounded-t-lg">
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && 'bg-muted text-muted-foreground')}
              >
                <BoldIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && 'bg-muted text-muted-foreground')}
              >
                <ItalicIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className={cn(editor.isActive('strike') && 'bg-muted text-muted-foreground')}
              >
                <StrikethroughIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strike</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted text-muted-foreground')}
              >
                <Heading1Icon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted text-muted-foreground')}
              >
                <Heading2Icon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted text-muted-foreground')}
              >
                <Heading3Icon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && 'bg-muted text-muted-foreground')}
              >
                <ListBulletIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && 'bg-muted text-muted-foreground')}
              >
                <ListOrderedIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted text-muted-foreground')}
              >
                <AlignLeftIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted text-muted-foreground')}
              >
                <AlignCenterIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size={'sm'}
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted text-muted-foreground')}
              >
                <AlignRightIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={'ghost'}
                type="button"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
              >
                <UndoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={'ghost'}
                type="button"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
              >
                <RedoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
