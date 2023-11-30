import React, { useEffect, useState } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";

const Collab_editor = ({ socket, remoteSocketId }) => {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    // Initialize CodeMirror
    
    const codeMirror = CodeMirror(document.getElementById("code-editor"), {
      mode: "javascript", // Set the language mode
      lineNumbers: true, // Show line numbers
    });


    // Set the editor in the state
    setEditor(codeMirror);

    // Event handler for receiving code changes from the server
    // Set the value of the editor

    const handleCodeChange = (data) => {
      if (editor) editor.setValue(data.code);
      console.log(data.code);
    };

    // Attach the event listener for code changes
    // Detach the event listener when the component unmounts
    // Clean up CodeMirror instance

    socket.on("codeChange", handleCodeChange);
    return () => {
      socket.off("codeChange", handleCodeChange);
      codeMirror.off("changes"); // Remove changes event listener
      codeMirror.setValue(""); // Clear the editor content
    };

  }, [socket, remoteSocketId]); // Fixed dependency array

  return (
    <div>
      <div
        id="code-editor"
        className="shadow-xl shadow-black border-spacing-2 border-black w-full rounded-lg m-3 p-4"
      />
    </div>
  );
};

export default Collab_editor;
