import { Test, TestingModule } from '@nestjs/testing';
import { StreamProcessingController } from './stream-processing.controller';

describe('StreamProcessingController', () => {
  let controller: StreamProcessingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamProcessingController],
    }).compile();

    controller = module.get<StreamProcessingController>(
      StreamProcessingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
