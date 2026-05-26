import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private model: Model<any>,
  ) { }

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const created = await this.model.create({
      ...data,
      password: hashedPassword,
    });

    const { password: _pw, ...userWithoutPassword } = created.toObject();
    return userWithoutPassword;
  }

  async findById(id: string) {
    return this.model.findById(id).select('-password');
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  async update(userId: string, data: any) {
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