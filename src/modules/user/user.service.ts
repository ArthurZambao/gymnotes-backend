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
    const existing = await this.model.findOne({ email: data.email });
    if (existing) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const created = await this.model.create({
      ...data,
      password: hashedPassword,
      emailVerified: data.emailVerified ?? false,
    });

    const { password: _pw, ...userWithoutPassword } = created.toObject();
    return userWithoutPassword;
  }

  async findById(id: string) {
    const user = await this.model.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  async update(userId: string, data: UpdateUserDto) {
    const existing = await this.model.findById(userId);
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    const allowedFields = {
      name: data.name,
      weight: data.weight,
      height: data.height,
      avatar: data.avatar,
      biotype: data.biotype,
    };

    return this.model
      .findByIdAndUpdate(userId, { $set: allowedFields }, { returnDocument: 'after' })
      .select('-password');
  }

  async setVerificationToken(userId: string, token: string, expires: Date) {
    return this.model.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });
  }

  async verifyEmail(token: string) {
    const user = await this.model.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) return null;

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return user;
  }
}