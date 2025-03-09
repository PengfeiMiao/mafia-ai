import React, {useState} from 'react';
import {Button, Flex, Input, Text} from '@chakra-ui/react';
import {setCookie} from "@/store/CacheStore";
import {loginApi} from "@/api/api";
import BackgroundMask from "@/components/BackgroundMask";

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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin().then();
    }
  };

  return (
    <Flex h="100vh" w="100vw" pt={16} justify="flex-start" align="center" direction="column">
      <Flex zIndex={0}>
        <BackgroundMask/>
      </Flex>
      <Text fontSize="xl" fontWeight="bold" mb={28} zIndex={1}>Mafia AI</Text>
      <Flex p={8} bgColor={'purple.subtle'} borderRadius="xl" direction="column" zIndex={1} opacity={0.9}>
        <Flex mb={8} justify="center" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4}>Username</Text>
          <Input w={'20vw'} mr={2} value={'mafiadev'} disabled>
          </Input>
        </Flex>
        <Flex justify="center" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4}>Password</Text>
          <Input w={'20vw'} mr={2} value={password}
                 onChange={(e) => {
                   e.preventDefault();
                   setPassword(e.target.value)
                 }}
                 onKeyDown={handleKeyDown}>
          </Input>
        </Flex>
      </Flex>
      <Flex>
        <Button w={'12vw'} mt={4} mr={4} onClick={handleLogin}>Login</Button>
        <Button w={'12vw'} mt={4} ml={4} onClick={handleLogin}>Sign up with email</Button>
      </Flex>
    </Flex>
  );
}

export default LoginPage;