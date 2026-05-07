import { Schema } from 'mongoose';

export const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  weightUnit: {
    type: String,
    enum: ['kg', 'placas'],
    default: 'kg'
  },
  muscleGroups: [
    {
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ["primary", "secondary", "tertiary"],
        required: true,
      },
    },
  ],
});
