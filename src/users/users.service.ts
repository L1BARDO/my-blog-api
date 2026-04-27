import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';
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
    const users = await this.usersRepository.find({
      relations: ['profile'],
    });
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
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
    try {
      const userFound = await this.findOne(id);
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
    } catch {
      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: number) {
    try {
      const userFound = await this.findOne(id);
      await this.usersRepository.remove(userFound);
      return { message: 'User deleted successfully' };
    } catch {
      throw new BadRequestException('Error deleting user');
    }
  }

  async getProfileByUserId(userId: number) {
    const userFound = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!userFound) {
      throw new NotFoundException('User not found');
    }
    return userFound.profile;
  }
}
