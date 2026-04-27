import { Profile } from '../entities/profile.entity';

export interface User {
  id: number;
  password: string;
  email: string;
  profile: Profile;
  createdAt: Date;
  updateAt: Date;
}
