import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service';
import { Role } from '@prisma/client';

export interface RequestUser {
  id: number;
  role: Role;
  username: string;
}

export interface AuthedRequest extends Request {
  user?: RequestUser;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: AuthedRequest, res: Response, next: NextFunction) {
    const uid = (req.cookies as any)?.uid;
    if (uid) {
      const user = await this.prisma.user.findUnique({ where: { id: Number(uid) } });
      if (user) {
        req.user = { id: user.id, role: user.role, username: user.username };
      }
    }
    next();
  }
}

