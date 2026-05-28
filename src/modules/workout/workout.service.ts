import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';

export interface Workout extends Document {
  userId: Types.ObjectId;
  name: string;
  days: {
    name: string;
    exercises: {
      exerciseId: Types.ObjectId;
      sets: number;
      reps: number[];
      order: number;
    }[];
  }[];
  startDate: Date;
  expirationDate?: Date;
}

@Injectable()
export class WorkoutService {
  constructor(
    @InjectModel('Workout') private model: Model<Workout>,
  ) { }

  create(data: any) {
    return this.model.create(data);
  }

  findByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .populate('days.exercises.exerciseId');
  }

  async update(id: string, requestingUserId: string, data: any) {
    const workout = await this.model.findById(id);

    if (!workout) throw new NotFoundException('Ficha de Treino não encontrada');

    if (workout.userId.toString() !== requestingUserId) {
      throw new ForbiddenException('Você não tem permissão para editar esta Ficha de Treino');
    }

    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string, requestingUserId: string) {
    const workout = await this.model.findById(id);

    if (!workout) throw new NotFoundException('Ficha de Treino não encontrada');

    if (workout.userId.toString() !== requestingUserId) {
      throw new ForbiddenException('Você não tem permissão para deletar esta Ficha de Treino');
    }

    return this.model.findByIdAndDelete(id);
  }
}