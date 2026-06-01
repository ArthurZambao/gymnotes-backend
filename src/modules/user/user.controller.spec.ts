import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

const mockUserService = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getMe() deve chamar findById com o id do token', async () => {
    mockUserService.findById.mockResolvedValue({ name: 'João' });
    const req = { user: { sub: 'user-id' } };
    const result = await controller.getMe(req);
    expect(mockUserService.findById).toHaveBeenCalledWith('user-id');
    expect(result.name).toBe('João');
  });
});