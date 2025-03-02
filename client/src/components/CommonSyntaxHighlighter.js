import SyntaxHighlighter from "react-syntax-highlighter";
import {atelierCaveLight} from "react-syntax-highlighter/src/styles/hljs";
import React from "react";

const CommonSyntaxHighlighter = ({lang, style, content}) => {
  const interval = "100";

  const formatContent = (format, text) => {
    let innerText = text.trim();
    if (!text) {
      return "empty";
    }
    if (format !== "json") {
      return innerText;
    }
    try {
      innerText = JSON.stringify(JSON.parse(innerText.trim()), null, 2);
      return innerText;
    } catch (e) {
      const regex = new RegExp(`(.{${interval}})`, "g");
      return innerText.replace(regex, "$1\n").trim();
    }
  };

  return (
    <SyntaxHighlighter language={lang ?? "xml"} style={style ?? atelierCaveLight}>
      {formatContent(lang, content)}
    </SyntaxHighlighter>
  );
};

export default CommonSyntaxHighlighter;