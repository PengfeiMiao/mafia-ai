import {useEffect, useState} from "react";
import {getProxyPage} from "@/api/api";
import {Box, Button, Flex, Icon, Input, Text} from "@chakra-ui/react";
import {FaArrowAltCircleLeft, FaArrowAltCircleRight} from "react-icons/fa";
import SlideBox from "@/components/SlideBox";

let windowUrl = "";

const WebPreview = ({parseOpen, children}) => {
  const [innerDoc, setInnerDoc] = useState("<div />");
  const [webUrl, setWebUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [currIndex, setCurrIndex] = useState(0);

  useEffect(() => {
    windowUrl = "";
  }, []);

  const handleProxyPage = (uri) => {
    getProxyPage(uri, "GET")
      .then(r => {
        const script = `<script type="text/javascript">
          (function() {
            document.addEventListener('click', function(event) {
              const anchorTag = event.target?.closest('a');
              if (anchorTag) {
                if (!/^https?:\\/\\//i.test(anchorTag.href)) return;
                event.preventDefault();
                const targetUrl = anchorTag.href;
                window.parent.postMessage({type: 'navigate', url: targetUrl}, '*');
              }
            }, true);
          })();
        </script>`;
        let content = r?.content.replace('</head>', `${script}</head>`);
        setInnerDoc(content);
      });
  }

  const handleMessage = async (event) => {
    if (event.data && event.data.type === 'navigate') {
      const targetUrl = event.data.url;
      if (windowUrl !== targetUrl) {
        console.log('Intercepted navigation to:', targetUrl);
        windowUrl = targetUrl;
        setWebUrl(targetUrl);
        handleNewUrl(targetUrl);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  const handleEnter = () => {
    handleNewUrl(webUrl);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNewUrl(webUrl);
    }
  };

  const handleRollBackHistories = (targetIndex) => {
    let length = history.length;
    if (length > 0 && targetIndex >= 0 && targetIndex < length) {
      let uri = history[targetIndex];
      handleProxyPage(uri);
      setWebUrl(uri);
      setCurrIndex(targetIndex);
    }
  };

  const handleAddHistories = (uri) => {
    setHistory(prev => {
      setCurrIndex(prev.length);
      return [...prev, uri];
    });
  };

  const handleFinalUri = (url) => {
    let uri = url.trim();
    if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
      uri = `http://${url}`;
    }
    return uri;
  };

  const handleNewUrl = (url) => {
    let uri = handleFinalUri(url);
    handleProxyPage(uri);
    handleAddHistories(uri);
  }

  return (
    <Box h="100%" w="100%">
      <Flex align="center" mb="4px">
        <Icon boxSize="28px" onClick={() => handleRollBackHistories(currIndex - 1)}>
          <FaArrowAltCircleLeft/>
        </Icon>
        <Icon ml="4px" mr="8px" boxSize="28px" onClick={() => handleRollBackHistories(currIndex + 1)}>
          <FaArrowAltCircleRight/>
        </Icon>
        <Input value={webUrl} onChange={(e) => setWebUrl(e.target.value)} onKeyDown={handleKeyDown}/>
        <Button ml="8px" onClick={handleEnter}>Enter</Button>
        {children}
      </Flex>
      <iframe srcDoc={innerDoc} width="100%" height="100%" title="external"/>
      <Flex position="relative" h="50vh" bottom="50vh">
        <SlideBox open={parseOpen} align="bottom" outerStyle={{backgroundColor: "gray", borderTopRadius: "8px", opacity: 0.8}}>
          <Text>placeholder</Text>
        </SlideBox>
      </Flex>
    </Box>
  );
};

export default WebPreview;