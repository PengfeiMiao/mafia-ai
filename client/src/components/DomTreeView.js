import React, {useEffect, useState} from 'react';
import {Box} from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {a11yLight, atelierCaveLight} from "react-syntax-highlighter/src/styles/hljs";

const HtmlSyntaxHighlighter = ({html}) => {
  return (
    <SyntaxHighlighter language="xml" style={atelierCaveLight}>
      {html}
    </SyntaxHighlighter>
  );
};

const TreeNode = ({node}) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(!expanded);

  if (!node?.tag || ['script', 'style', 'head'].includes(node.tag)) {
    return <></>;
  }

  if (!node?.children || !node.children.length) {
    return <div onClick={toggle}>
      <HtmlSyntaxHighlighter html={node.props.outerHTML}/>
    </div>;
  }

  return (
    <div>
      <div onClick={toggle}>
        <HtmlSyntaxHighlighter html={
          `${expanded ? '-' : '+'} `
          + `<`
          + `${node.tag}`
          + `${node.props.id ? (' id="' + node.props.id + '"') : ''}`
          + `${node.props.className ? (' class="' + node.props.className + '"') : ''}`
          + `>`
        }/>
      </div>
      {expanded && (
        <div style={{paddingLeft: '16px'}}>
          {node.children.map((childNode, index) => (
            <TreeNode key={index} node={childNode}/>
          ))}
        </div>
      )}
    </div>
  );
};

const DomTreeView = ({html, outerStyle}) => {
  const [treeData, setTreeData] = useState(null);

  const rootStyle = {
    maxHeight: "100%",
    ...outerStyle
  };

  const formatHtml = (html) => {
    let result = html.replace(/>\s+</g, '> <').trim();
    result = result.replace(/(>)([\s\S]*?)(<)/g, function (match, p1, p2, p3) {
      return p1 + p2.replace(/\s+/g, ' ').trim() + p3;
    });
    return result;
  };

  const generateTreeData = (node) => {
    const children = Array.from(node.children).map(child => generateTreeData(child));
    return {
      tag: String(node.tagName).toLowerCase(),
      props: {
        outerHTML: formatHtml(node.outerHTML),
        className: String(node.className).replace(/\s+/g, ' ').trim(),
        id: node.id
      },
      children
    };
  };

  const parseHtml = (htmlStr) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    return generateTreeData(doc.documentElement);
  };

  useEffect(() => {
    let tree = parseHtml(html);
    console.log('tree', tree);
    setTreeData(tree);
  }, [html]);

  return (
    <Box style={rootStyle} p="16px" overflowY="auto">
      <TreeNode node={treeData}/>
    </Box>
  );
};

export default DomTreeView;