import remarkGfm from "remark-gfm";
import rehypeReact from "rehype-react";
import ReactMarkdown from "react-markdown";
import React from "react";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";

export const MarkdownView = ({markdown}) => {
  const renderList = ({children}) => {
    return (
      <ul style={{paddingLeft: '16px', listStyleType: 'disc'}}>
        {children}
      </ul>
    );
  };

  const renderCodeBlock = (children) => {
    try {
      const match = children.props?.className?.match(/language-(\w+)/);
      const language = match ? match[1] : "raw";

      return (
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          showLineNumbers
          wrapLongLines
          children={String(children.props.children).replace(/\n$/, '')}
        />
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeReact]}
      components={{
        ul: renderList,
        pre: ({children}) =>
          children.type === "code" ? renderCodeBlock(children) : null
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};