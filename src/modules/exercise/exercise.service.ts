import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel('Exercise') private model: Model<any>,
  ) { }

  async create(data) {
    const existing = await this.model.findOne({ name: data.name });
    if (existing) {
      throw new ConflictException('Exercício já cadastrado');
    }

    return this.model.create(data);

  }

  findAll() {
    return this.model.find();
  }

  findByMuscle(muscles: string[]) {
    return this.model.find({
      "muscleGroups.name": { $in: muscles },
    });
  }
}