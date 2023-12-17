// // CollabEditor.jsx
import React, { useEffect, useState, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";

const CollabEditor = ({ socket, remoteSocketId }) => {
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const [output, setOutput] = useState("");

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

  function handleRun() {
    const code = editorRef.current.getValue();
    try {
      const result = eval(code);
      setOutput(result);
      console.log(result);
    } catch (err) {
      console.log("error in handle run \n", err);
    }
  }

  return (
    <div>
      <button
        onClick={handleRun}
        className="bg-blue-500 text-white py-2 px-4 rounded-full mb-4"
      >
        RUN
      </button>

      <div
        id="code-editor"
        className="shadow-xl shadow-black border-spacing-2 border-black w-full rounded-lg m-3 p-4 overflow-auto"
      />

      <div
        id="code_result"
        className="bg-black text-white w-full rounded-lg m-3 p-4"
      >
        {output}
      </div>
    </div>
  );
};

export default CollabEditor;
