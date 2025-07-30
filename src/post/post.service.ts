import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import Redis from 'ioredis';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async findAll(page = 1, step = 10): Promise<Post[]> {
    const cacheKey = `posts:page=${page}:step=${step}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
        console.log('FROM CACHE');
        return JSON.parse(cached);
    }

    const posts = await this.postRepo.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * step,
      take: step,
    });
    await this.redis.set(cacheKey, JSON.stringify(posts), 'EX', 60);
    return posts;
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create(dto);
    const saved = await this.postRepo.save(post);
    await this.redis.flushall();
    return saved;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepo.findOneBy({ id });
    if (!post) throw new NotFoundException();
    Object.assign(post, dto);
    const updated = await this.postRepo.save(post);
    await this.redis.flushall();
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.postRepo.delete(id);
    await this.redis.flushall();
  }
}