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
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .populate('days.exercises.exerciseId');
  }

  async update(id: string, requestingUserId: string, data: any) {
    const workout = await this.model.findById(id);

    if (!workout) throw new NotFoundException('Workout não encontrado');

    if (workout.userId.toString() !== requestingUserId) {
      throw new ForbiddenException('Você não tem permissão para editar este workout');
    }

    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string, requestingUserId: string) {
    const workout = await this.model.findById(id);

    if (!workout) throw new NotFoundException('Workout não encontrado');

    if (workout.userId.toString() !== requestingUserId) {
      throw new ForbiddenException('Você não tem permissão para deletar este workout');
    }

    return this.model.findByIdAndDelete(id);
  }
}