import { Test, TestingModule } from '@nestjs/testing';
import { StreamProcessingService } from './stream-processing.service';

describe('StreamProcessingService', () => {
  let service: StreamProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamProcessingService],
    }).compile();

    service = module.get<StreamProcessingService>(StreamProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
