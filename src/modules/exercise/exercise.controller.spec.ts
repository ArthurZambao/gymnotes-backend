import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

const mockExerciseService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByMuscle: jest.fn(),
};

describe('ExerciseController', () => {
  let controller: ExerciseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [{ provide: ExerciseService, useValue: mockExerciseService }],
    }).compile();

    controller = module.get<ExerciseController>(ExerciseController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findAll() sem filtro deve chamar findAll()', async () => {
    mockExerciseService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(mockExerciseService.findAll).toHaveBeenCalled();
  });

  it('findAll() com filtro deve chamar findByMuscle()', async () => {
    mockExerciseService.findByMuscle.mockResolvedValue([]);
    await controller.findAll('biceps');
    expect(mockExerciseService.findByMuscle).toHaveBeenCalledWith(['biceps']);
  });
});