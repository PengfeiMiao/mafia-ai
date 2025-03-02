import SyntaxHighlighter from "react-syntax-highlighter";
import {atelierCaveLight} from "react-syntax-highlighter/src/styles/hljs";
import React from "react";

const CommonSyntaxHighlighter = ({lang, style, content}) => {
  return (
    <SyntaxHighlighter language={lang ?? "xml"} style={style ?? atelierCaveLight}>
      {content}
    </SyntaxHighlighter>
  );
};

export default CommonSyntaxHighlighter;