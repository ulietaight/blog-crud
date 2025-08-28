import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Input, VStack, Text } from '@chakra-ui/react'
import { login } from '../api'
import { useAuth } from '../store'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setUser = useAuth((s) => s.setUser)
  const navigate = useNavigate()

  const submit = async () => {
    try {
      const user = await login(username, password)
      setUser(user)
      navigate('/rounds')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt={20} p={6} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Имя пользователя</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Пароль</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        {error && <Text color="red.500">{error}</Text>}
        <Button onClick={submit} width="full">
          Войти
        </Button>
      </VStack>
    </Box>
  )
}
