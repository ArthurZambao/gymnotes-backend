import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutLogController } from './workout-log.controller';
import { WorkoutLogService } from './workout-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

const mockWorkoutLogService = {
  createOrUpdate: jest.fn(),
  findByMonth: jest.fn(),
  deleteById: jest.fn(),
};

describe('WorkoutLogController', () => {
  let controller: WorkoutLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutLogController],
      providers: [{ provide: WorkoutLogService, useValue: mockWorkoutLogService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkoutLogController>(WorkoutLogController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findByMonth() deve chamar o service com userId e month', async () => {
    mockWorkoutLogService.findByMonth.mockResolvedValue([]);
    const req = { user: { sub: 'user-id' } };
    await controller.findByMonth('2026-05', req);
    expect(mockWorkoutLogService.findByMonth).toHaveBeenCalledWith('user-id', '2026-05');
  });
});