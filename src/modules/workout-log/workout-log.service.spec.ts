import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { WorkoutLogService } from './workout-log.service';
import { NotFoundException } from '@nestjs/common';

const WorkoutLogSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  exercises: Array,
});

describe('WorkoutLogService', () => {
  let service: WorkoutLogService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let logModel: Model<any>;

  const userId = new Types.ObjectId().toString();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoConnection = (await connect(mongod.getUri())).connection;
    logModel = mongoConnection.model('WorkoutLog', WorkoutLogSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutLogService,
        { provide: getModelToken('WorkoutLog'), useValue: logModel },
      ],
    }).compile();

    service = module.get<WorkoutLogService>(WorkoutLogService);
  });

  afterEach(async () => {
    await logModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('createOrUpdate()', () => {
    it('deve criar um log se não existir para o dia', async () => {
      const result = await service.createOrUpdate({
        userId,
        date: '2026-05-01',
        exercises: [],
      });
      expect(result.userId).toBe(userId);
    });

    it('deve atualizar o log se já existir para o mesmo dia', async () => {
      await service.createOrUpdate({ userId, date: '2026-05-01', exercises: [] });
      const updated = await service.createOrUpdate({
        userId,
        date: '2026-05-01',
        exercises: [{ exerciseId: new Types.ObjectId(), sets: 3 }],
      });
      expect(updated.exercises.length).toBe(1);

      // Confirma que só existe 1 documento no banco
      const total = await logModel.countDocuments({ userId });
      expect(total).toBe(1);
    });
  });

  describe('findByMonth()', () => {
    it('deve retornar os logs do mês correto', async () => {
      await logModel.create({ userId, date: new Date('2026-05-10'), exercises: [] });
      await logModel.create({ userId, date: new Date('2026-06-01'), exercises: [] });

      const result = await service.findByMonth(userId, '2026-05');
      expect(result.length).toBe(1);
    });
  });

  describe('deleteById()', () => {
    it('deve deletar o log do usuário', async () => {
      const created = await logModel.create({ userId, date: new Date(), exercises: [] });
      await service.deleteById(created._id.toString(), userId);
      const found = await logModel.findById(created._id);
      expect(found).toBeNull();
    });

    it('deve lançar NotFoundException se log não existir', async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(service.deleteById(fakeId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});