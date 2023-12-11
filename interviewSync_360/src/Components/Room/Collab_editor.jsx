// // CollabEditor.jsx
import React, { useEffect, useState, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";

const CollabEditor = ({ socket, remoteSocketId }) => {
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current) {
      const codeMirror = CodeMirror(document.getElementById("code-editor"), {
        mode: "javascript",
        lineNumbers: true,
      });

      setEditor(codeMirror);
      editorRef.current = codeMirror;

      const handleRemoteChange = (data) => {
        console.log("data.sender: ", data.sender);
        console.log("socket.id: ", socket.id);
        if (data.sender === socket.id) {
          console.log("remote change", data.code, data.sender);
          isRemoteChange.current = true;
          editorRef.current.setValue(data.code);
        }
      };

      socket.on("remoteChange", handleRemoteChange);

      codeMirror.on("change", handleLocalChange);

      return () => {
        socket.off("remoteChange", handleRemoteChange);
        codeMirror.off("change", handleLocalChange);
        codeMirror.toTextArea();
      };
    }
  }, [socket, remoteSocketId]);

  const handleLocalChange = (instance, changeObj) => {
    console.log("local change", instance.getValue(), socket.id);
    const newCode = instance.getValue();
    if (!isRemoteChange.current) {
      socket.emit("localChange", { code: newCode, sender: remoteSocketId });
    } else {
      isRemoteChange.current = false;
    }
  };

  return (
    <div>
      <div
        id="code-editor"
        className="shadow-xl shadow-black border-spacing-2 border-black w-full rounded-lg m-3 p-4"
      />
    </div>
  );
};

export default CollabEditor;
