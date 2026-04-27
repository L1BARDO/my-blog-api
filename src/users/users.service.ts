import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find();
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(user: CreateUserDto) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;

      const userSaved = await this.usersRepository.save(user);
      return userSaved;
    } catch {
      throw new BadRequestException('Error creating user');
    }
  }

  async update(id: number, user: UpdateUserDto) {
    const userFound = await this.usersRepository.findOneBy({ id });
    if (!userFound) {
      throw new NotFoundException('User not found');
    }

    if (user.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;
    }
    const userUpdate = this.usersRepository.merge(userFound, user);
    const userSaved = await this.usersRepository.save(userUpdate);
    return userSaved;
  }

  async remove(id: number) {
    const userFound = await this.usersRepository.findOneBy({ id });
    if (!userFound) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.remove(userFound);
    return { message: 'User deleted successfully' };
  }
}
