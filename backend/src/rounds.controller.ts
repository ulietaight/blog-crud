import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { AuthedRequest } from './auth.middleware';
import { Role } from '@prisma/client';

const ROUND_DURATION = parseInt(process.env.ROUND_DURATION || '60', 10);
const COOLDOWN_DURATION = parseInt(process.env.COOLDOWN_DURATION || '30', 10);

@Controller('rounds')
export class RoundsController {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  @Get()
  async list() {
    const rounds = await this.prisma.round.findMany({ orderBy: { createdAt: 'desc' } });
    const now = new Date();
    return rounds.map((r) => ({
      id: r.id,
      start: r.start,
      end: r.end,
      status: now < r.start ? 'cooldown' : now > r.end ? 'finished' : 'active',
    }));
  }

  @Post()
  async create(@Req() req: AuthedRequest, @Res() res: Response) {
    if (!req.user || req.user.role !== Role.admin) {
      return res.status(403).json({ message: 'forbidden' });
    }
    const createdAt = new Date();
    const start = new Date(createdAt.getTime() + COOLDOWN_DURATION * 1000);
    const end = new Date(start.getTime() + ROUND_DURATION * 1000);
    const round = await this.prisma.round.create({ data: { start, end, total: 0 } });
    return res.json(round);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: AuthedRequest, @Res() res: Response) {
    const round = await this.prisma.round.findUnique({ where: { id }, include: { scores: true } });
    if (!round) {
      return res.status(404).json({ message: 'not found' });
    }
    const now = new Date();
    const status = now < round.start ? 'cooldown' : now > round.end ? 'finished' : 'active';
    const myScore = req.user ? round.scores.find((s) => s.userId === req.user!.id) : undefined;
    let winner: any = undefined;
    if (status === 'finished' && round.scores.length > 0) {
      const top = round.scores.reduce((a, b) => (a.points > b.points ? a : b));
      const user = await this.prisma.user.findUnique({ where: { id: top.userId } });
      winner = { username: user?.username, points: top.points };
    }
    return res.json({
      id: round.id,
      start: round.start,
      end: round.end,
      status,
      total: round.total,
      myPoints: myScore?.points || 0,
      winner,
    });
  }

  @Post(':id/tap')
  async tap(@Param('id') id: string, @Req() req: AuthedRequest, @Res() res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    const round = await this.prisma.round.findUnique({ where: { id } });
    const now = new Date();
    if (!round || now < round.start || now > round.end) {
      return res.status(400).json({ message: 'round not active' });
    }
    if (req.user.role === Role.nikita) {
      return res.json({ points: 0 });
    }

    const key = `round:${id}:user:${req.user.id}`;
    const totalKey = `round:${id}:total`;
    const lua = `local taps = redis.call('HINCRBY', KEYS[1], 'taps', 1)
local add = 1
if taps % 11 == 0 then add = add + 10 end
local points = redis.call('HINCRBY', KEYS[1], 'points', add)
redis.call('INCRBY', KEYS[2], add)
return {taps, points, add}`;
    const [taps, points, add] = (await this.redis.redis.eval(lua, 2, key, totalKey)) as [
      number,
      number,
      number,
    ];
    await this.prisma.roundScore.upsert({
      where: { roundId_userId: { roundId: id, userId: req.user.id } },
      update: { taps, points },
      create: { roundId: id, userId: req.user.id, taps, points },
    });
    await this.prisma.round.update({ where: { id }, data: { total: { increment: add } } });
    return res.json({ points });
  }
}

