import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      displayName: createUserDto.displayName || createUserDto.username,
    });

    return createdUser.save();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async validateUser(username: string, password: string): Promise<UserDocument | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getOrCreateDefaultUsers(): Promise<void> {
    const adminExists = await this.findByUsername('admin');
    if (!adminExists) {
      await this.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        displayName: '管理员',
      });
    }

    const memberExists = await this.findByUsername('member');
    if (!memberExists) {
      await this.create({
        username: 'member',
        email: 'member@example.com',
        password: 'member123',
        displayName: '普通成员',
      });
    }
  }
}
