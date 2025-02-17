import '@/App.css';
import React from 'react';
import {Box} from '@chakra-ui/react';
import {Provider} from "@/components/ui/provider"
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from "@/pages/LoginPage";
import GlobalProvider from "@/store/GlobalProvider";
import DialogPage from "@/pages/DialogPage";
import RagPage from "@/pages/RagPage";
import DemoPage from "@/pages/DemoPage";
import WsProvider from "@/store/WsProvider";

function App() {
  return (
    <GlobalProvider>
      <Provider>
        <Router>
          <Box bgColor={'gray.100'}>
            <Routes>
              <Route exact path='/' element={<Navigate to="/dialog"/>}/>
              <Route exact path="/dialog" element={
                <WsProvider uri={"/ws/stream"}>
                  <DialogPage/>
                </WsProvider>
              }/>
              <Route exact path="/rag" element={
                <WsProvider uri={"/ws/files"}>
                  <RagPage/>
                </WsProvider>
              }/>
              <Route exact path="/demo" element={<DemoPage/>}/>
              <Route exact path='/login' element={<LoginPage/>}/>
            </Routes>
          </Box>
        </Router>
      </Provider>
    </GlobalProvider>
  );
}

export default App;