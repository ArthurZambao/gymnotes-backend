import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private model: Model<any>,
  ) { }

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existing = await this.model.findOne({ email: data.email });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const created = await this.model.create({
      ...data,
      password: hashedPassword,
    });

    const { password: _pw, ...userWithoutPassword } = created.toObject();
    console.log(userWithoutPassword);
    return userWithoutPassword;
  }

  async findById(id: string) {

    const userId = await this.model.findById(id);
    if (!userId) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return userId;
  }

  async findByEmail(email: string) {

    const userEmail = await this.model.findOne({ email });
    if (!userEmail) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return userEmail;
  }

  async update(userId: string, data: UpdateUserDto) {

    const existing = await this.model.findById(userId);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const allowedFields = {
      name: data.name,
      weight: data.weight,
      height: data.height,
      avatar: data.avatar,
    };

    return this.model
      .findByIdAndUpdate(userId, { $set: allowedFields }, { new: true })
      .select('-password');
  }
}