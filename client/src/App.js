import '@/App.css';
import React from 'react';
import {Box} from '@chakra-ui/react';
import {Provider} from "@/components/ui/provider"
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from "@/pages/LoginPage";
import GlobalProvider from "@/store/GlobalProvider";
import {MessagesProvider} from "@/store/MessageProvider";
import HomePage from "@/pages/HomePage";

function App() {
  return (
    <GlobalProvider>
      <MessagesProvider>
        <Provider>
          <Router>
            <Box background={'#F9F9F9'}>
              <Routes>
                <Route exact path='/' element={<Navigate to="/homePage"/>}/>
                <Route exact path="/homePage" element={<HomePage/>}/>
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