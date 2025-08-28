import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { redis } from './redis';
import { Role } from '@prisma/client';

dotenv.config();

const ROUND_DURATION = parseInt(process.env.ROUND_DURATION || '60', 10); // seconds
const COOLDOWN_DURATION = parseInt(process.env.COOLDOWN_DURATION || '30', 10); // seconds

const app = Fastify();
app.register(cookie);
app.register(formbody);

// augment request type
declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: number; role: Role; username: string };
  }
}

app.addHook('preHandler', async (req) => {
  const uid = (req.cookies as any).uid;
  if (uid) {
    const user = await prisma.user.findUnique({ where: { id: Number(uid) } });
    if (user) {
      req.user = { id: user.id, role: user.role, username: user.username };
    }
  }
});

app.post('/login', async (req, reply) => {
  const { username, password } = req.body as any;
  if (!username || !password) {
    return reply.status(400).send({ message: 'username and password required' });
  }
  let user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    const role = username === 'admin' ? Role.admin : username === 'Никита' || username === 'Nikita' ? Role.nikita : Role.survivor;
    user = await prisma.user.create({ data: { username, password, role } });
  } else if (user.password !== password) {
    return reply.status(401).send({ message: 'invalid password' });
  }
  reply.setCookie('uid', String(user.id), { path: '/' });
  return { id: user.id, username: user.username, role: user.role };
});

app.get('/rounds', async () => {
  const rounds = await prisma.round.findMany({ orderBy: { createdAt: 'desc' } });
  const now = new Date();
  return rounds.map((r) => ({
    id: r.id,
    start: r.start,
    end: r.end,
    status: now < r.start ? 'cooldown' : now > r.end ? 'finished' : 'active',
  }));
});

app.post('/rounds', async (req, reply) => {
  if (!req.user || req.user.role !== Role.admin) {
    return reply.status(403).send({ message: 'forbidden' });
  }
  const createdAt = new Date();
  const start = new Date(createdAt.getTime() + COOLDOWN_DURATION * 1000);
  const end = new Date(start.getTime() + ROUND_DURATION * 1000);
  const round = await prisma.round.create({ data: { start, end, total: 0 } });
  return round;
});

app.get('/rounds/:id', async (req, reply) => {
  const { id } = req.params as any;
  const round = await prisma.round.findUnique({ where: { id }, include: { scores: true } });
  if (!round) return reply.status(404).send({ message: 'not found' });
  const now = new Date();
  const status = now < round.start ? 'cooldown' : now > round.end ? 'finished' : 'active';
  const myScore = req.user ? round.scores.find((s) => s.userId === req.user!.id) : undefined;
  let winner: any = undefined;
  if (status === 'finished' && round.scores.length > 0) {
    const top = round.scores.reduce((a, b) => (a.points > b.points ? a : b));
    const user = await prisma.user.findUnique({ where: { id: top.userId } });
    winner = { username: user?.username, points: top.points };
  }
  return {
    id: round.id,
    start: round.start,
    end: round.end,
    status,
    total: round.total,
    myPoints: myScore?.points || 0,
    winner,
  };
});

app.post('/rounds/:id/tap', async (req, reply) => {
  if (!req.user) return reply.status(401).send({ message: 'unauthorized' });
  const { id } = req.params as any;
  const round = await prisma.round.findUnique({ where: { id } });
  const now = new Date();
  if (!round || now < round.start || now > round.end) {
    return reply.status(400).send({ message: 'round not active' });
  }
  if (req.user.role === Role.nikita) {
    return { points: 0 };
  }
  // use redis transaction for taps
  const key = `round:${id}:user:${req.user.id}`;
  const totalKey = `round:${id}:total`;
  const lua = `local taps = redis.call('HINCRBY', KEYS[1], 'taps', 1)
local add = 1
if taps % 11 == 0 then add = add + 10 end
local points = redis.call('HINCRBY', KEYS[1], 'points', add)
redis.call('INCRBY', KEYS[2], add)
return {taps, points, add}`;
  const [taps, points, add] = (await redis.eval(lua, 2, key, totalKey)) as [number, number, number];
  await prisma.roundScore.upsert({
    where: { roundId_userId: { roundId: id, userId: req.user.id } },
    update: { taps, points },
    create: { roundId: id, userId: req.user.id, taps, points },
  });
  await prisma.round.update({ where: { id }, data: { total: { increment: add } } });
  return { points };
});

app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' }).then(() => {
  console.log('Server running');
});
