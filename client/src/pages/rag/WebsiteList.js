import {useEffect, useRef, useState} from "react";
import {getProxyPage} from "@/api/api";
import {Box, Button, Flex, Input} from "@chakra-ui/react";

let windowUrl = "";

const WebsiteList = () => {
  const [innerDoc, setInnerDoc] = useState("<div />");
  const [webUrl, setWebUrl] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    windowUrl = "";
  }, []);

  const handleProxyPage = (url) => {
    let uri = url.trim();
    if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
      uri = `http://${url}`;
    }
    getProxyPage(uri, "GET")
      .then(r => setInnerDoc(
        `<!DOCTYPE html>
          <html lang="en">
            <head>
              <title>website</title>
              <script type="text/javascript">
                document.addEventListener('click', function(event) {
                  const anchorTag = event.target?.closest('a');
                  if (anchorTag) {
                    event.preventDefault();
                    const targetUrl = anchorTag.href;
                    window.parent.postMessage({type: 'navigate', url: targetUrl}, '*');
                  }
                }, false);
              </script>
            </head>
            <body>
              ${r?.content}
            </body>
          </html>`
      ));
  }

  const handleMessage = async (event) => {
    if (event.data && event.data.type === 'navigate') {
      const targetUrl = event.data.url;
      if (windowUrl !== targetUrl) {
        console.log('Intercepted navigation to:', targetUrl);
        windowUrl = targetUrl;
        setWebUrl(targetUrl);
        handleProxyPage(targetUrl);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  const handleEnter = () => {
    handleProxyPage(webUrl);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleProxyPage(webUrl);
    }
  };

  return (
    <Box h="100%" w="100%" p="8px">
      <Flex>
        <Input value={webUrl} onChange={(e) => setWebUrl(e.target.value)} onKeyDown={handleKeyDown}/>
        <Button ml="8px" onClick={handleEnter}>Enter</Button>
      </Flex>
      <iframe ref={iframeRef} srcDoc={innerDoc} width="100%" height="100%" title="external"/>
    </Box>
  );
};

export default WebsiteList;