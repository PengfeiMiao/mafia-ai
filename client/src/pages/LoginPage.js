import React, {useState} from 'react';
import {Box, Button, Input, Text} from '@chakra-ui/react';
import {setCookie} from "@/store/CacheStore";
import {loginApi} from "@/api/api";

const LoginPage = () => {
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    let body = await loginApi({password});
    if (body?.status === 200) {
      setCookie('token', password);
      window.location.assign('/');
    } else {
      setCookie('token', '');
      alert('Password is incorrect!');
    }
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" ml={8}>Login Page</Text>
      <Box display="flex" m={8}>
        <Input
          w={'50vw'}
          mr={2}
          value={password}
          onChange={(e) => setPassword(e.target.value)}>
        </Input>
        <Button onClick={handleLogin}>Login</Button>
      </Box>
    </Box>
  );
}

export default LoginPage;