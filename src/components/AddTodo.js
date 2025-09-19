import React, { useState, useCallback } from 'react';
import { $getRoot, $getSelection } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

const theme = {
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    code: 'editor-text-code',
  }
};

function onError(error) {
  console.error(error);
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = useCallback((format) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        selection.formatText(format);
      }
    });
  }, [editor]);

  return (
    <div className="toolbar">
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="toolbar-btn"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="toolbar-btn"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="toolbar-btn"
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => formatText('strikethrough')}
        className="toolbar-btn"
        title="Strikethrough"
      >
        <s>S</s>
      </button>
    </div>
  );
}

function ClearPlugin({ clearTrigger }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (clearTrigger) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
      });
    }
  }, [editor, clearTrigger]);

  return null;
}

const AddTodo = ({ onAddTodo }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [clearTrigger, setClearTrigger] = useState(0);

  const initialConfig = {
    namespace: 'TodoEditor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode],
  };

  const onChange = useCallback((editorState) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editorState, null);
      setHtmlContent(htmlString);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (textContent) {
      onAddTodo(htmlContent);
      // Clear the editor
      setHtmlContent('');
      setClearTrigger(prev => prev + 1);
    }
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <div className="rich-text-container">
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="editor-container">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="add-todo-input rich-text-input"
                  placeholder="Add a new todo..."
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={onChange} />
            <HistoryPlugin />
            <ClearPlugin clearTrigger={clearTrigger} />
          </div>
        </LexicalComposer>
      </div>
      <button type="submit" className="add-todo-btn">
        Add
      </button>
    </form>
  );
};

export default AddTodo;