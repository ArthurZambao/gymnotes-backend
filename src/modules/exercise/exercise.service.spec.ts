import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ExerciseService } from './exercise.service';
import { ConflictException } from '@nestjs/common';

const ExerciseSchema = new mongoose.Schema({
  name: String,
  muscleGroups: Array,
});

describe('ExerciseService', () => {
  let service: ExerciseService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let exerciseModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoConnection = (await connect(mongod.getUri())).connection;
    exerciseModel = mongoConnection.model('Exercise', ExerciseSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        { provide: getModelToken('Exercise'), useValue: exerciseModel },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
  });

  afterEach(async () => {
    await exerciseModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('create()', () => {
    it('deve criar um exercício', async () => {
      const result = await service.create({ name: 'Supino', muscleGroups: [] });
      expect(result.name).toBe('Supino');
    });

    it('deve lançar ConflictException se exercício já existir', async () => {
      await service.create({ name: 'Supino', muscleGroups: [] });
      await expect(
        service.create({ name: 'Supino', muscleGroups: [] }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('deve retornar todos os exercícios', async () => {
      await exerciseModel.create({ name: 'Agachamento', muscleGroups: [] });
      await exerciseModel.create({ name: 'Deadlift', muscleGroups: [] });
      const result = await service.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByMuscle()', () => {
    it('deve retornar exercícios filtrados por músculo', async () => {
      await exerciseModel.create({
        name: 'Rosca Direta',
        muscleGroups: [{ name: 'biceps' }],
      });
      await exerciseModel.create({
        name: 'Tríceps Testa',
        muscleGroups: [{ name: 'triceps' }],
      });

      const result = await service.findByMuscle(['biceps']);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Rosca Direta');
    });
  });
});