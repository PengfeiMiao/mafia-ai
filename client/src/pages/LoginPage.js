import React, {useState} from 'react';
import {Button, Flex, Input, Text, Link} from '@chakra-ui/react';
import {setCookie} from "@/store/CacheStore";
import {loginApi, registerApi} from "@/api/api";

const LoginPage = ({background}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('mafiadev');
  const [password, setPassword] = useState('');
  const [inRegister, setInRegister] = useState(false);

  const handleLogin = async () => {
    let body = await loginApi({username, password});
    if (body?.status === 200) {
      setCookie('token', btoa(`${username}&${password}`));
      window.location.assign('/');
    } else {
      setCookie('token', '');
      alert('Password is incorrect!');
    }
  };

  const handleRegister = async () => {
    let body = await registerApi({email, username, password});
    if (body?.status === 200) {
      setInRegister(false);
    } else {
      alert('Failed to register!');
    }
  };
  return (
    <Flex h="100vh" w="100vw" pt={16} justify="flex-start" align="center" direction="column">
      <Flex zIndex={0}>
        {background}
      </Flex>
      <Text fontSize="xl" fontWeight="bold" mb={28} zIndex={1}>Mafia AI</Text>
      <Flex p={8} bgColor={'purple.subtle'} borderRadius="xl" direction="column" zIndex={1} opacity={0.9}>
        {inRegister &&
          <Flex mb={8} justify="center" align="center" direction="row">
            <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Email</Text>
            <Input w={'20vw'} mr={2} value={email}
                   onChange={(e) => setEmail(e.target.value)}/>
          </Flex>
        }
        <Flex mb={8} justify="center" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Username</Text>
          <Input w={'20vw'} mr={2} value={username}
                 onChange={(e) => setUsername(e.target.value)}/>
        </Flex>
        <Flex justify="center" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Password</Text>
          <Input w={'20vw'} mr={2} value={password}
                 onChange={(e) => setPassword(e.target.value)}>
          </Input>
        </Flex>
      </Flex>
      <Flex mt={4} w="100%" h="40px" justify="center" align="bottom" zIndex={1}>
        <Button minW="96px" onClick={inRegister ? handleRegister : handleLogin}>
          {inRegister ? 'Register' : 'Login'}
        </Button>
        <Link
          h="24px"
          margin="auto 0 4px 12px"
          fontSize="sm"
          onClick={() => setInRegister(!inRegister)}
        > {inRegister ? 'Cancel' : 'Sign up'}</Link>
      </Flex>
    </Flex>
  );
}

export default LoginPage;