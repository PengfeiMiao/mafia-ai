import '@/App.css';
import React from 'react';
import {Box} from '@chakra-ui/react';
import {Provider} from "@/components/ui/provider"
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from "@/pages/LoginPage";
import GlobalProvider from "@/store/GlobalProvider";
import {MessagesProvider} from "@/store/MessagesProvider";
import DialogPage from "@/pages/DialogPage";
import RagPage from "@/pages/RagPage";
import DemoPage from "@/pages/DemoPage";

function App() {
  return (
    <GlobalProvider>
      <MessagesProvider>
        <Provider>
          <Router>
            <Box bgColor={'gray.100'}>
              <Routes>
                <Route exact path='/' element={<Navigate to="/dialog"/>}/>
                <Route exact path="/dialog" element={<DialogPage/>}/>
                <Route exact path="/rag" element={<RagPage/>}/>
                <Route exact path="/demo" element={<DemoPage/>}/>
                <Route exact path='/login' element={<LoginPage/>}/>
              </Routes>
            </Box>
          </Router>
        </Provider>
      </MessagesProvider>
    </GlobalProvider>
  );
}

export default App;