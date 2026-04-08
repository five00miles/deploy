import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLoggerService } from '../logger/app-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(
      {
        action: 'create_user_attempt',
        email: createUserDto.email,
      },
      'UsersService',
    );

    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      this.logger.log(
        {
          action: 'create_user_success',
          userId: user.id,
          email: user.email,
        },
        'UsersService',
      );

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          {
            action: 'create_user_conflict',
            email: createUserDto.email,
            code: error.code,
          },
          'UsersService',
        );

        throw new ConflictException('Email already exists');
      }

      this.logger.error(
        'Failed to create user',
        error instanceof Error ? error.stack : undefined,
        {
          action: 'create_user_error',
          email: createUserDto.email,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : String(error),
        },
        'UsersService',
      );

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    this.logger.debug(
      {
        action: 'list_users',
        count: users.length,
      },
      'UsersService',
    );

    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    this.logger.debug(
      {
        action: 'find_user',
        userId: id,
        found: Boolean(user),
      },
      'UsersService',
    );

    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      this.logger.warn(
        {
          action: 'delete_user_missing',
          userId: id,
        },
        'UsersService',
      );

      return null;
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(
      {
        action: 'delete_user_success',
        userId: id,
        email: user.email,
      },
      'UsersService',
    );

    return user;
  }
}
