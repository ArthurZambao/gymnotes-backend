import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token-fake'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('deve retornar tokens e dados do usuário com credenciais corretas', async () => {
      const hash = await bcrypt.hash('senha123', 10);

      mockUserService.findByEmail.mockResolvedValue({
        _id: 'id-fake',
        email: 'joao@email.com',
        name: 'João',
        password: hash,
        weight: null,
        height: null,
        avatar: null,
      });

      const result = await service.login('joao@email.com', 'senha123');

      expect(result.accessToken).toBe('token-fake');
      expect(result.refreshToken).toBe('token-fake');
      expect(result.user.email).toBe('joao@email.com');
    });

    it('deve lançar UnauthorizedException com senha errada', async () => {
      const hash = await bcrypt.hash('senha123', 10);

      mockUserService.findByEmail.mockResolvedValue({
        _id: 'id-fake',
        email: 'joao@email.com',
        password: hash,
      });

      await expect(
        service.login('joao@email.com', 'senhaerrada'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se usuário não existir', async () => {
      // O findByEmail lança NotFoundException, mas o AuthService
      // deve capturar e relançar como UnauthorizedException
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('naoexiste@email.com', 'qualquer'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── generateTokens ────────────────────────────────────────────────────────

  describe('generateTokens()', () => {
    it('deve gerar accessToken e refreshToken', async () => {
      const result = await service.generateTokens({
        _id: 'id-fake',
        email: 'joao@email.com',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});