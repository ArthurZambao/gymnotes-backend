import { Schema, Types } from 'mongoose';

export const WorkoutSchema = new Schema({
  userId: { type: Types.ObjectId, required: true },
  name: { type: String, required: true },

  days: [
    {
      name: String,
      exercises: [
        {
          exerciseId: { type: Types.ObjectId, ref: 'Exercise' },
          sets: Number,
          reps: [Number],
          order: Number,
        },
      ],
    },
  ],
});