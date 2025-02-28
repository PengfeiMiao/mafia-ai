import React, {useEffect, useState} from 'react';
import {Box} from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {atelierCaveLight} from "react-syntax-highlighter/src/styles/hljs";

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

const DomTreeView = ({html, ignoredTags, keyword, onLoad, onRefresh, outerStyle}) => {
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
    let isRelated = true;
    if (keyword) {
      isRelated = node?.innerText?.includes(keyword);
    }
    return {
      tag: tagName,
      props: {
        outerHTML: formatHtml(node.outerHTML),
        className: String(node.className).replace(/\s+/g, ' ').trim(),
        id: node.id
      },
      ignored: !isRelated || (ignoredTags?.includes(tagName) ?? false),
      children
    };
  };

  const parseHtml = (htmlStr) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    return generateTreeData(doc.documentElement);
  };

  const filterTreeData = (node) => {
    if (node.ignored) return null;
    return {
      tag: node.tag,
      props: node.props,
      children: node.children.map(child => filterTreeData(child)).filter(child => child !== null)
    };
  };

  const getXPathSegment = (node) => {
    if (node.props.id) return `/*[@id='${node.props.id}']`;
    if (node.props.className) return `/*[contains(@class, '${node.props.className.split(' ')[0].trim()}')]`;
    const index = node.parent ?
      node.parent.children.filter(sibling => sibling.tag === node.tag).indexOf(node) + 1 : 1;
    return `${node.tag}[${index}]`;
  };

  const getFilteredXPaths = (treeData) => {
    const generateXPaths = (node) => {
      const xpaths = [];

      const traverse = (node, pathSegments) => {
        if (node.children.length === 0) {
          if (node.props.id) {
            xpaths.push(`//*[@id='${node.props.id}']`);
          } else {
            xpaths.push('/' + [...pathSegments, getXPathSegment(node)].join('/'));
          }
        } else {
          node.children.forEach(child => traverse(child, [...pathSegments, getXPathSegment(node)]));
        }
      };

      traverse(node, []);
      return xpaths;
    };

    const filteredTree = filterTreeData(treeData);
    return filteredTree ? generateXPaths(filteredTree) : [];
  }

  useEffect(() => {
    let tree = parseHtml(html);
    console.log('tree', tree);
    setTreeData(tree);
    if (onLoad) onLoad(Array.from(tags));
    if (onRefresh) onRefresh(getFilteredXPaths(tree));
  }, [html]);

  useEffect(() => {
    let tree = parseHtml(html);
    setTreeData(tree);
    if (onRefresh) onRefresh(getFilteredXPaths(tree));
  }, [ignoredTags, keyword]);

  return (
    <Box style={rootStyle} p="16px" overflowY="auto">
      <TreeNode node={treeData}/>
    </Box>
  );
};

export default DomTreeView;