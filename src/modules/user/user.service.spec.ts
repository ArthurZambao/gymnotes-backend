import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { UserService } from './user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as mongoose from 'mongoose';

// Schema simples para os testes
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  weight: Number,
  height: Number,
  avatar: String,
});

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<any>;

  // Sobe o banco em memória antes de todos os testes
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model('User', UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // Limpa a coleção após cada teste para não acumular dados
  afterEach(async () => {
    await userModel.deleteMany({});
  });

  // Derruba o banco após todos os testes
  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve criar um usuário e retornar sem a senha', async () => {
      const result = await service.create({
        name: 'João',
        email: 'joao@email.com',
        password: '123456',
      });

      expect(result.email).toBe('joao@email.com');
      expect(result.name).toBe('João');
      expect(result.password).toBeUndefined(); // senha não pode vazar
    });

    it('deve lançar ConflictException se email já existir', async () => {
      await service.create({
        name: 'João',
        email: 'joao@email.com',
        password: '123456',
      });

      await expect(
        service.create({
          name: 'João 2',
          email: 'joao@email.com',
          password: 'outrasenha',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findById ──────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('deve retornar o usuário pelo id', async () => {
      const created = await userModel.create({
        name: 'Maria',
        email: 'maria@email.com',
        password: 'hash',
      });

      const result = await service.findById(created._id.toString());
      expect(result.email).toBe('maria@email.com');
    });

    it('deve lançar NotFoundException se id não existir', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(service.findById(fakeId)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByEmail ───────────────────────────────────────────────────────────

  describe('findByEmail()', () => {
    it('deve retornar o usuário pelo email', async () => {
      await userModel.create({
        name: 'Carlos',
        email: 'carlos@email.com',
        password: 'hash',
      });

      const result = await service.findByEmail('carlos@email.com');
      expect(result.name).toBe('Carlos');
    });

    it('deve lançar NotFoundException se email não existir', async () => {
      await expect(
        service.findByEmail('naoexiste@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('deve atualizar os dados do usuário', async () => {
      const created = await userModel.create({
        name: 'Ana',
        email: 'ana@email.com',
        password: 'hash',
      });

      const result = await service.update(created._id.toString(), {
        name: 'Ana Paula',
        weight: 60,
        height: 165,
        avatar: 'url-da-foto',
      });

      expect(result.name).toBe('Ana Paula');
      expect(result.weight).toBe(60);
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        service.update(fakeId, { name: 'Ninguém' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});