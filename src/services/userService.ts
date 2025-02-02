import { IUserRepository } from "../interface/IUserRepository";
import { User } from "../models/schemas/user";
import { UserRepository } from "../repository/userRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: Partial<User>): Promise<User> {
    console.log(userData, "userData in service");
    return await this.userRepository.create(userData);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async updateUserById(
    id: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    return await this.userRepository.updateById(id, updateData);
  }
}
