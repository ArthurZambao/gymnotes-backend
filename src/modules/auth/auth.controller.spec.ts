import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

const mockAuthService = {
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token-fake'),
  verify: jest.fn().mockReturnValue({ sub: 'id', email: 'a@a.com' }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('login() deve chamar o service e setar cookies', async () => {
    mockAuthService.login.mockResolvedValue({
      accessToken: 'token-fake',
      refreshToken: 'refresh-fake',
      user: { email: 'a@a.com' },
    });

    const res = { cookie: jest.fn() } as any;
    const result = await controller.login({ email: 'a@a.com', password: '123' }, res);

    expect(mockAuthService.login).toHaveBeenCalledWith('a@a.com', '123');
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(result.user.email).toBe('a@a.com');
  });
});