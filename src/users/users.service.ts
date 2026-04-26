import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      name: 'Juan',
      email: 'juan@gmail.com',
    },
    {
      id: '2',
      name: 'Maria',
      email: 'maria@gmail.com',
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(user: CreateUserDto): User {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, user: UpdateUserDto): User {
    const userFound = this.users.find((user) => user.id === id);
    if (!userFound) {
      throw new NotFoundException('User not found');
    }
    if (user.name) {
      userFound.name = user.name;
    }
    if (user.email) {
      userFound.email = user.email;
    }
    return userFound;
  }

  remove(id: string) {
    const userFound = this.users.find((user) => user.id === id);
    if (!userFound) {
      throw new NotFoundException('User not found');
    }
    this.users = this.users.filter((user) => user.id !== id);
    return { message: 'User deleted successfully' };
  }
}
