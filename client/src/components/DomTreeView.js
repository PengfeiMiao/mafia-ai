import React, {useEffect, useState} from 'react';
import {Box} from "@chakra-ui/react";
// import SyntaxHighlighter from "react-syntax-highlighter";

const TreeNode = ({node}) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(!expanded);

  if (!node?.children || !node.children.length) {
    return <div onClick={toggle}>{node?.tag}</div>;
  }

  return (
    <div>
      <div onClick={toggle}>
        {expanded ? '-' : '+'} {node.tag}
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

  const generateTreeData = (node) => {
    const children = Array.from(node.children).map(child => generateTreeData(child));
    return {tag: String(node.tagName).toLowerCase(), props: {}, children};
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