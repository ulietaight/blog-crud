import { useEffect, useState } from 'react'
import { Box, Button, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react'
import { createRound, getRounds } from '../api'
import type { RoundInfo } from '../api'
import { useAuth } from '../store'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

export function Rounds() {
  const [rounds, setRounds] = useState<RoundInfo[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuth((s) => s.user)!
  const navigate = useNavigate()

  useEffect(() => {
    getRounds()
      .then(setRounds)
      .finally(() => setLoading(false))
  }, [])

  const create = async () => {
    const round = await createRound()
    navigate(`/rounds/${round.id}`)
  }

  return (
    <Box maxW="3xl" mx="auto" mt={10}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="lg">Список раундов</Heading>
        <Text>{user.username}</Text>
      </Stack>
      {user.role === 'admin' && (
        <Button mb={4} onClick={create}>
          Создать раунд
        </Button>
      )}
      {loading ? (
        <Spinner />
      ) : (
        <Stack spacing={4}>
          {rounds.map((r) => (
            <Box key={r.id} p={4} borderWidth="1px" borderRadius="md">
              <Link as={RouterLink} to={`/rounds/${r.id}`} fontWeight="bold">
                Round ID: {r.id}
              </Link>
              <Text>Start: {new Date(r.start).toLocaleString()}</Text>
              <Text>End: {new Date(r.end).toLocaleString()}</Text>
              <Text mt={2}>Статус: {r.status}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
