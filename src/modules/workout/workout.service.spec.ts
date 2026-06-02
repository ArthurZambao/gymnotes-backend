import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { WorkoutService } from './workout.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const WorkoutSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  days: Array,
  startDate: Date,
  expirationDate: Date,
});

describe('WorkoutService', () => {
  let service: WorkoutService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let workoutModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoConnection = (await connect(mongod.getUri())).connection;
    workoutModel = mongoConnection.model('Workout', WorkoutSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: getModelToken('Workout'), useValue: workoutModel },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
  });

  afterEach(async () => {
    await workoutModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  const userId = new Types.ObjectId().toString();

  const baseWorkout = () => ({
    userId,
    name: 'Treino A',
    days: [],
    startDate: new Date(),
  });

  describe('create()', () => {
    it('deve criar um treino', async () => {
      const result = await service.create(baseWorkout());
      expect(result.name).toBe('Treino A');
    });
  });

  describe('findByUser()', () => {
    it('deve retornar os treinos do usuário', async () => {
      await workoutModel.create(baseWorkout());
      const result = await service.findByUser(userId);
      expect(result.length).toBe(1);
    });

    it('deve lançar NotFoundException se userId for inválido', () => {
      expect(() => service.findByUser('id-invalido')).toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('deve atualizar o treino se o usuário for o dono', async () => {
      const created = await workoutModel.create(baseWorkout());
      const result = await service.update(created._id.toString(), userId, { name: 'Treino B' });
      expect(result!.name).toBe('Treino B');
    });

    it('deve lançar NotFoundException se treino não existir', async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(service.update(fakeId, userId, {})).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se usuário não for o dono', async () => {
      const created = await workoutModel.create(baseWorkout());
      const outroUserId = new Types.ObjectId().toString();
      await expect(
        service.update(created._id.toString(), outroUserId, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete()', () => {
    it('deve deletar o treino se o usuário for o dono', async () => {
      const created = await workoutModel.create(baseWorkout());
      await service.delete(created._id.toString(), userId);
      const found = await workoutModel.findById(created._id);
      expect(found).toBeNull();
    });

    it('deve lançar NotFoundException se treino não existir', async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(service.delete(fakeId, userId)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se usuário não for o dono', async () => {
      const created = await workoutModel.create(baseWorkout());
      const outroUserId = new Types.ObjectId().toString();
      await expect(
        service.delete(created._id.toString(), outroUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});