import React, {useState} from 'react';
import {Button, Flex, Input, Text, Link} from '@chakra-ui/react';
import {setCookie} from "@/store/CacheStore";
import {loginApi, registerApi, sendCodeApi} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import {useDelayToggle} from "@/store/Hook";

const LoginPage = ({background}) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('mafiadev');
  const [password, setPassword] = useState('');
  const [inRegister, setInRegister] = useState(false);
  const {toggle, onToggle} = useDelayToggle();

  const handleLogin = async () => {
    let body = await loginApi({username, password});
    if (body?.status === 200) {
      let data = await body.json();
      setCookie('token', data?.token);
      window.location.assign('/');
    } else {
      setCookie('token', '');
      alert('Password is incorrect!');
    }
  };

  const handleRegister = async () => {
    let body = await registerApi({email, username, password, code});
    if (body?.status === 200) {
      setInRegister(false);
    } else {
      let res = await body.json();
      alert('Failed to register! ' + res?.detail);
    }
  };

  const handleSendCode = async () => {
    let body = await sendCodeApi({email, username, password});
    if (body?.status === 200) {
      onToggle();
    } else {
      let res = await body.json();
      alert('Failed to send code! ' + res?.detail);
    }
  };

  return (
    <Flex h="100vh" w="100vw" pt={16} justify="flex-start" align="center" direction="column">
      <Flex zIndex={0}>
        {background}
      </Flex>
      <TipsHeader title={'Send validation code successfully!'} hidden={toggle}/>
      <Text fontSize="xl" fontWeight="bold" mb={28} zIndex={1}>Mafia AI</Text>
      <Flex p={8} bgColor={'purple.subtle'} borderRadius="xl" direction="column" zIndex={1} opacity={0.9}>
        <Flex mb={8} justify="space-between" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Username</Text>
          <Input w={'20vw'} value={username} borderColor={'purple.muted'}
                 onChange={(e) => setUsername(e.target.value)}/>
        </Flex>
        <Flex justify="space-between" align="center" direction="row">
          <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Password</Text>
          <Input w={'20vw'} value={password} borderColor={'purple.muted'}
                 onChange={(e) => setPassword(e.target.value)}>
          </Input>
        </Flex>
        {inRegister && <>
          <Flex mt={8} justify="space-between" align="center" direction="row">
            <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Email</Text>
            <Input w={'20vw'} value={email} borderColor={'purple.muted'}
                   onChange={(e) => setEmail(e.target.value)}/>
          </Flex>
          <Flex mt={8} justify="space-between" align="center" direction="row">
            <Text fontSize="md" fontWeight="500" mr={4} w={'80px'}>Varify</Text>
            <Flex w={'20vw'} justify="space-between" align="center" direction="row">
              <Input mr={2} value={code} borderColor={'purple.muted'}
                     onChange={(e) => setCode(e.target.value)}/>
              <Button onClick={handleSendCode}>Send</Button>
            </Flex>
          </Flex>
        </>}
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