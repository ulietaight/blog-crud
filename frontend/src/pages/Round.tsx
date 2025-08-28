import { useCallback, useEffect, useState } from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { getRound, tap } from '../api'
import type { RoundDetails } from '../api'
import { useAuth } from '../store'
import { useParams } from 'react-router-dom'

function format(diff: number) {
  const m = String(Math.floor(diff / 60)).padStart(2, '0')
  const s = String(diff % 60).padStart(2, '0')
  return `${m}:${s}`
}

export function Round() {
  const { id } = useParams<{ id: string }>()
  const user = useAuth((s) => s.user)!
  const [round, setRound] = useState<RoundDetails>()
  const [remaining, setRemaining] = useState('')

  const refresh = useCallback(async () => {
    const data = await getRound(id!)
    setRound(data)
    const target = data.status === 'cooldown' ? new Date(data.start) : new Date(data.end)
    const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000))
    setRemaining(format(diff))
  }, [id])

  useEffect(() => {
    refresh()
    const timer = setInterval(() => {
      if (round) {
        const target = round.status === 'cooldown' ? new Date(round.start) : new Date(round.end)
        const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000))
        setRemaining(format(diff))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [refresh, round])

  const tapGoose = async () => {
    const res = await tap(id!)
    setRound((r) => (r ? { ...r, myPoints: res.points, total: r.total + res.points - r.myPoints } : r))
  }

  if (!round) return <Box p={4}>Загрузка...</Box>

  return (
    <Box maxW="md" mx="auto" mt={10} textAlign="center">
      <Heading mb={4}>{round.status === 'finished' ? 'Раунд завершен' : round.status === 'active' ? 'Раунд' : 'Cooldown'}</Heading>
      <Text mb={2}>{user.username}</Text>
      <Box fontSize="6xl" cursor={round.status === 'active' ? 'pointer' : 'default'} onClick={round.status === 'active' ? tapGoose : undefined}>
        🪿
      </Box>
      {round.status === 'active' && (
        <>
          <Text>Раунд активен!</Text>
          <Text>До конца осталось: {remaining}</Text>
          <Text>Мои очки - {round.myPoints}</Text>
        </>
      )}
      {round.status === 'cooldown' && (
        <>
          <Text>Cooldown</Text>
          <Text>до начала раунда {remaining}</Text>
        </>
      )}
      {round.status === 'finished' && (
        <Box mt={4} pt={4} borderTopWidth="1px">
          <Text>Всего {round.total}</Text>
          {round.winner && <Text>Победитель - {round.winner.username} {round.winner.points}</Text>}
          <Text>Мои очки {round.myPoints}</Text>
        </Box>
      )}
    </Box>
  )
}
