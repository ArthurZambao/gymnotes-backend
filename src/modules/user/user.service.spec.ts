import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { UserService } from './user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as mongoose from 'mongoose';


const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  weight: Number,
  height: Number,
  avatar: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
});

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<any>;


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


  afterEach(async () => {
    await userModel.deleteMany({});
  });


  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });



  describe('create()', () => {
    it('deve criar um usuário e retornar sem a senha', async () => {
      const result = await service.create({
        name: 'João',
        email: 'joao@email.com',
        password: '123456',
      });

      expect(result.email).toBe('joao@email.com');
      expect(result.name).toBe('João');
      expect(result.password).toBeUndefined();
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

  describe('setVerificationToken()', () => {
    it('deve salvar o token e a expiração no usuário', async () => {
      const created = await userModel.create({
        name: 'João',
        email: 'joao@email.com',
        password: 'hash',
      });

      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await service.setVerificationToken(created._id.toString(), 'token-abc', expires);

      const updated = await userModel.findById(created._id);
      expect(updated.emailVerificationToken).toBe('token-abc');
      expect(updated.emailVerificationExpires).toEqual(expires);
    });
  });

  describe('verifyEmail()', () => {
    it('deve marcar emailVerified como true com token válido', async () => {
      const expires = new Date(Date.now() + 60_000);
      const created = await userModel.create({
        name: 'Maria',
        email: 'maria@email.com',
        password: 'hash',
        emailVerificationToken: 'token-valido',
        emailVerificationExpires: expires,
      });

      const result = await service.verifyEmail('token-valido');
      expect(result.emailVerified).toBe(true);
      expect(result.emailVerificationToken).toBeNull();
    });

    it('deve retornar null com token expirado', async () => {
      const expired = new Date(Date.now() - 1000);
      await userModel.create({
        name: 'Carlos',
        email: 'carlos@email.com',
        password: 'hash',
        emailVerificationToken: 'token-expirado',
        emailVerificationExpires: expired,
      });

      const result = await service.verifyEmail('token-expirado');
      expect(result).toBeNull();
    });

    it('deve retornar null com token inexistente', async () => {
      const result = await service.verifyEmail('token-que-nao-existe');
      expect(result).toBeNull();
    });
  });
});