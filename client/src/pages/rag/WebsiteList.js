import {useEffect, useRef, useState} from "react";
import {getProxyPage} from "@/api/api";
import {Box} from "@chakra-ui/react";

const WebsiteList = () => {
  const [innerDoc, setInnerDoc] = useState("<div />");
  const iframeRef = useRef(null);

  const handleProxyPage = (url) => {
    getProxyPage(url, "GET")
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

  useEffect(() => {
    handleProxyPage("http://www.baidu.com");
  }, []);

  const handleMessage = async (event) => {
    if (event.data && event.data.type === 'navigate') {
      const targetUrl = event.data.url;
      console.log('Intercepted navigation to:', targetUrl);
      handleProxyPage(targetUrl);
    }
  };

  window.addEventListener('message', handleMessage);

  return (
    <Box h="100%" w="100%">
      <iframe ref={iframeRef} srcDoc={innerDoc} width="100%" height="100%" title="external"/>
    </Box>
  );
};

export default WebsiteList;