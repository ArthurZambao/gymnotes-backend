import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import cookieParser from 'cookie-parser';
import { MailService } from './../src/modules/mail/mail.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const mockMailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
};

describe('E2E — Gym Backend', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.use(cookieParser());

    await app.init();

    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });



  async function createAndLoginUser(data = {
    name: 'João Teste',
    email: 'joao@teste.com',
    password: 'Senha123!',
  }) {

    await request(app.getHttpServer())
      .post('/users')
      .send(data)
      .expect(201);


    await mongoConnection.collection('users').updateOne(
      { email: data.email },
      { $set: { emailVerified: true } },
    );


    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: data.email, password: data.password })
      .expect(201);


    const cookies = res.headers['set-cookie'] as unknown as string[];
    const tokenCookie = cookies.find((c) => c.startsWith('token='));

    return {
      accessToken: res.body.accessToken,
      tokenCookie: tokenCookie ?? '',
      user: res.body.user,
    };
  }



  describe('POST /users', () => {
    it('deve criar um usuário e retornar mensagem de verificação', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Maria', email: 'maria@teste.com', password: 'Senha123!' })
        .expect(201);

      expect(res.body.message).toContain('Verifique seu email');
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 409 se email já existir', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Maria', email: 'maria@teste.com', password: 'Senha123!' });

      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Maria 2', email: 'maria@teste.com', password: 'Senha123!' })
        .expect(409);
    });

    it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'semNome@teste.com' })
        .expect(400);
    });
  });

  describe('GET /users/me', () => {
    it('deve retornar os dados do usuário autenticado', async () => {
      const { tokenCookie } = await createAndLoginUser();

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', tokenCookie)
        .expect(200);

      expect(res.body.email).toBe('joao@teste.com');
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('deve atualizar os dados do usuário', async () => {
      const { tokenCookie } = await createAndLoginUser();

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Cookie', tokenCookie)
        .send({ name: 'João Atualizado', weight: 80, height: 175 })
        .expect(200);

      expect(res.body.name).toBe('João Atualizado');
      expect(res.body.weight).toBe(80);
    });
  });



  describe('POST /auth/login', () => {
    it('deve retornar tokens e setar cookies', async () => {
      await createAndLoginUser();

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'joao@teste.com', password: 'Senha123!' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe('joao@teste.com');

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
    });

    it('deve retornar 401 com senha errada', async () => {
      await createAndLoginUser();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'joao@teste.com', password: 'senhaErrada' })
        .expect(401);
    });

    it('deve retornar 401 se email não verificado', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Não Verificado', email: 'nao@verificado.com', password: 'Senha123!' });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nao@verificado.com', password: 'Senha123!' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('deve limpar os cookies e retornar mensagem', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      expect(res.body.message).toBe('Logged out successfully');
    });
  });



  describe('POST /exercises', () => {
    it('deve criar um exercício', async () => {
      const res = await request(app.getHttpServer())
        .post('/exercises')
        .send({
          name: 'Supino',
          weightUnit: 'kg',
          muscleGroups: [{ name: 'peito', type: 'primary' }],
        })
        .expect(201);

      expect(res.body.name).toBe('Supino');
    });

    it('deve retornar 409 se exercício já existir', async () => {
      await request(app.getHttpServer())
        .post('/exercises')
        .send({ name: 'Supino', weightUnit: 'kg', muscleGroups: [{ name: 'peito', type: 'primary' }] });

      await request(app.getHttpServer())
        .post('/exercises')
        .send({ name: 'Supino', weightUnit: 'kg', muscleGroups: [{ name: 'peito', type: 'primary' }] })
        .expect(409);
    });
  });

  describe('GET /exercises', () => {
    it('deve listar todos os exercícios', async () => {
      await request(app.getHttpServer())
        .post('/exercises')
        .send({ name: 'Agachamento', weightUnit: 'kg', muscleGroups: [{ name: 'pernas', type: 'primary' }] });

      const res = await request(app.getHttpServer())
        .get('/exercises')
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar por músculo', async () => {
      await request(app.getHttpServer())
        .post('/exercises')
        .send({ name: 'Rosca Direta', weightUnit: 'kg', muscleGroups: [{ name: 'biceps', type: 'primary' }] });

      const res = await request(app.getHttpServer())
        .get('/exercises?muscle=biceps')
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });



  describe('POST /workouts', () => {
    it('deve criar um treino para o usuário autenticado', async () => {
      const { tokenCookie } = await createAndLoginUser();

      const res = await request(app.getHttpServer())
        .post('/workouts')
        .set('Cookie', tokenCookie)
        .send({ name: 'Treino A', days: [], startDate: '2026-01-01' })
        .expect(201);

      expect(res.body.name).toBe('Treino A');
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer())
        .post('/workouts')
        .send({ name: 'Treino A', days: [], startDate: '2026-01-01' })
        .expect(401);
    });
  });

  describe('GET /workouts/me', () => {
    it('deve retornar os treinos do usuário', async () => {
      const { tokenCookie } = await createAndLoginUser();

      await request(app.getHttpServer())
        .post('/workouts')
        .set('Cookie', tokenCookie)
        .send({ name: 'Treino B', days: [], startDate: '2026-01-01' });

      const res = await request(app.getHttpServer())
        .get('/workouts/me')
        .set('Cookie', tokenCookie)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Treino B');
    });
  });



  describe('POST /workout-logs', () => {
    it('deve criar um log de treino', async () => {
      const { tokenCookie } = await createAndLoginUser();

      const res = await request(app.getHttpServer())
        .post('/workout-logs')
        .set('Cookie', tokenCookie)
        .send({ workoutId: '664f1a2b3c4d5e6f7a8b9c0d', dayName: 'Treino A', date: '2026-05-01T00:00:00.000Z', exercises: [] })
        .expect(201);

      expect(res.body.date).toBeDefined();
    });

    it('deve atualizar o log se já existir para o mesmo dia', async () => {
      const { tokenCookie } = await createAndLoginUser();

      await request(app.getHttpServer())
        .post('/workout-logs')
        .set('Cookie', tokenCookie)
        .send({ workoutId: '664f1a2b3c4d5e6f7a8b9c0d', dayName: 'Treino A', date: '2026-05-01T00:00:00.000Z', exercises: [] });

      const res = await request(app.getHttpServer())
        .post('/workout-logs')
        .set('Cookie', tokenCookie)
        .send({ workoutId: '664f1a2b3c4d5e6f7a8b9c0d', dayName: 'Treino A', date: '2026-05-01T00:00:00.000Z', exercises: [] })
        .expect(201);

      expect(res.body.date).toBeDefined();
    });
  });

  describe('GET /workout-logs', () => {
    it('deve retornar os logs do mês', async () => {
      const { tokenCookie } = await createAndLoginUser();

      await request(app.getHttpServer())
        .post('/workout-logs')
        .set('Cookie', tokenCookie)
        .send({ workoutId: '664f1a2b3c4d5e6f7a8b9c0d', dayName: 'Treino A', date: '2026-05-15T00:00:00.000Z', exercises: [] });

      const res = await request(app.getHttpServer())
        .get('/workout-logs?month=2026-05')
        .set('Cookie', tokenCookie)
        .expect(200);

      expect(res.body.length).toBe(1);
    });
  });
});