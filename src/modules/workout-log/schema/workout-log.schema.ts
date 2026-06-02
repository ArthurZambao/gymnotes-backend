import { Schema, Types } from 'mongoose';

export const WorkoutLogSchema = new Schema({
  userId: { type: Types.ObjectId, required: true },
  workoutId: { type: Types.ObjectId, ref: 'Workout', required: true },

  dayName: { type: String },

  date: { type: Date, required: true },

  exercises: [
    {
      exerciseId: { type: Types.ObjectId, ref: 'Exercise' },
      sets: { type: Number, required: true },
      reps: { type: [Number], required: true },
      weight: { type: Number },
    },
  ],
});