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

  if (!node?.tag || node?.ignored) {
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

const DomTreeView = ({html, outerStyle, ignoredTags, onLoad}) => {
  const [treeData, setTreeData] = useState(null);
  let tags = new Set();

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
    const tagName = String(node.tagName).toLowerCase();
    tags.add(tagName);
    return {
      tag: tagName,
      props: {
        outerHTML: formatHtml(node.outerHTML),
        className: String(node.className).replace(/\s+/g, ' ').trim(),
        id: node.id
      },
      ignored: ignoredTags?.includes(tagName) ?? false,
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
    if (onLoad) onLoad(tags);
  }, [html]);

  useEffect(() => {
    let tree = parseHtml(html);
    setTreeData(tree);
  }, [ignoredTags]);

  return (
    <Box style={rootStyle} p="16px" overflowY="auto">
      <TreeNode node={treeData} ignoredTags={ignoredTags}/>
    </Box>
  );
};

export default DomTreeView;