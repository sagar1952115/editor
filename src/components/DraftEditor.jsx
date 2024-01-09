import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
} from "draft-js";
import { useRef, useState } from "react";

import { useEffect } from "react";

const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  RED: {
    color: "rgb(255, 0, 0)",
  },
};

function getModifiedText(newState, offset = 1) {
  const currentContent = newState.getCurrentContent();
  const currentSelection = newState.getSelection();
  const endOffset = currentSelection.getEndOffset();

  const newContent = Modifier.replaceText(
    currentContent,
    currentSelection.merge({
      anchorOffset: endOffset - offset,
      focusOffset: endOffset,
    }),
    ""
  );

  return EditorState.push(newState, newContent, "remove-range");
}

function DraftEditor() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const editorRef = useRef();

  function handleFocus() {
    editorRef.current.focus();
  }

  function handleEditorValue(newEditorState) {
    setEditorState(newEditorState);
  }

  useEffect(() => {
    const savedData = localStorage.getItem("editorData");
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  function handleKeyCommand(command, newEditorState) {
    let newState = RichUtils.handleKeyCommand(newEditorState, command);

    if (command === "h1") {
      newState = getModifiedText(newEditorState);
      newState = RichUtils.toggleBlockType(newState, "header-one");
    }

    if (command === "boldText") {
      newState = getModifiedText(newEditorState);
      newState = RichUtils.toggleInlineStyle(newState, "BOLD");
    }

    if (command === "redText") {
      newState = getModifiedText(newEditorState, 2);
      newState = RichUtils.toggleInlineStyle(newState, "RED");
    }

    if (command === "underline") {
      newState = getModifiedText(newEditorState, 3);
      newState = RichUtils.toggleInlineStyle(newState, "UNDERLINE");
    }

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }

  function handleKeyBinding(e) {
    const content = editorState.getCurrentContent();
    const plainText = content.getPlainText();
    const selection = editorState.getSelection();

    if (e.keyCode === 32) {
      if (plainText.endsWith("#") && selection.getStartOffset() === 1) {
        return "h1";
      }
      if (plainText.endsWith("*") && selection.getStartOffset() === 1) {
        return "boldText";
      }
      if (plainText.endsWith("**") && selection.getStartOffset() === 2) {
        return "redText";
      }
      if (plainText.endsWith("***") && selection.getStartOffset() === 3) {
        return "redText";
      }
    }
    return getDefaultKeyBinding(e);
  }

  function handleSave() {
    const raw = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem("editorData", JSON.stringify(raw));
    alert("Data successfully saved!!!");
  }

  let className = "text-editor";
  const contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== "unstyled") {
      className += " RichEditor-hidePlaceholder";
    }
  }

  return (
    <div>
      <div className="header">
        <div className="title">
          <h3>
            Draft.js Demo by <span>Sagar Kumar</span>
          </h3>
        </div>
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="text-editor-container">
        <div className={className} onClick={handleFocus}>
          <Editor
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={handleKeyBinding}
            onChange={handleEditorValue}
            placeholder="Write Something..."
            ref={editorRef}
            spellCheck={true}
          />
        </div>
      </div>
    </div>
  );
}

export default DraftEditor;
