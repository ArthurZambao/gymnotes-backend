import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class WorkoutLogService {
  constructor(
    @InjectModel('WorkoutLog') private model: Model<any>,
  ) { }

  async createOrUpdate(data) {
    const targetDate = new Date(data.date);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await this.model.findOne({
      userId: data.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingLog) {
      return this.model.findByIdAndUpdate(existingLog._id, data, { new: true });
    }

    return this.model.create(data);
  }

  async findByMonth(userId: string, month: string) {

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return this.model.find({
      userId,
      date: { $gte: start, $lt: end },
    }).populate('exercises.exerciseId', 'name');
  }

  async deleteById(id: string, userId: string) {
    return this.model.findOneAndDelete({ _id: id, userId });
  }
}