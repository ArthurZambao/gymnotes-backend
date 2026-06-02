import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

const mockWorkoutService = {
  create: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('WorkoutController', () => {
  let controller: WorkoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutController],
      providers: [{ provide: WorkoutService, useValue: mockWorkoutService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkoutController>(WorkoutController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() deve chamar o service com userId do token', async () => {
    mockWorkoutService.create.mockResolvedValue({ name: 'Treino A' });
    const req = { user: { sub: 'user-id' } };
    const body = { name: 'Treino A', days: [], startDate: '2026-01-01' } as any;
    const result = await controller.create(req, body);
    expect(mockWorkoutService.create).toHaveBeenCalledWith({ ...body, userId: 'user-id' });
    expect(result.name).toBe('Treino A');
  });
});