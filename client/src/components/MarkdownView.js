import remarkGfm from "remark-gfm";
import rehypeReact from "rehype-react";
import ReactMarkdown from "react-markdown";
import React from "react";

export const MarkdownView = ({markdown}) => {

  const renderList = ({ children }) => {
    return (
      <ul style={{ paddingLeft: '16px', listStyleType: 'disc' }}>
        {children}
      </ul>
    );
  };

  return (<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeReact]} components={{
    ul: renderList
  }}>
    {markdown}
  </ReactMarkdown>);
}