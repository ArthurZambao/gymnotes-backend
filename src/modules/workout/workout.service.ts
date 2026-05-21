import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Document, Types } from 'mongoose';

export interface Workout extends Document {
  userId: Types.ObjectId;
  name: string;
  days: {
    name: string;
    exercises: {
      exerciseId: Types.ObjectId;
      sets: number;
      reps: [number];
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
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate("days.exercises.exerciseId")
  }

  update(id: string, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }

}