'use client';

import { MenuBar } from '@/libs/components/rich-editor/menu-bar';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FC } from 'react';

interface RichEditorProps {
  content?: string;
  onUpdate: (content: string) => void;
}

const RichEditor: FC<RichEditorProps> = ({ content = '', onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: content ? JSON.parse(content) : '<p>Hello World! 🌎️</p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none'
      }
    },
    onUpdate: ({ editor }) => {
      onUpdate(JSON.stringify(editor.getJSON()));
    },
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false
  });

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichEditor;
