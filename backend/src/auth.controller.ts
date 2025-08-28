import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma.service';
import { Role } from '@prisma/client';

@Controller()
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { username, password } = body;
    if (!username || !password) {
      res.status(400);
      return { message: 'username and password required' };
    }

    let user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      const role =
        username === 'admin'
          ? Role.admin
          : username === 'Никита' || username === 'Nikita'
            ? Role.nikita
            : Role.survivor;
      user = await this.prisma.user.create({ data: { username, password, role } });
    } else if (user.password !== password) {
      res.status(401);
      return { message: 'invalid password' };
    }

    res.cookie('uid', String(user.id), { path: '/' });
    return { id: user.id, username: user.username, role: user.role };
  }
}

