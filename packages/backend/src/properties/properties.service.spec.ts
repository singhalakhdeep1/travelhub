import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property', async () => {
      const propertyData = {
        title: 'Test Property',
        location: 'Test Location',
        pricePerNight: 200,
      };

      mockPrismaService.property.create.mockResolvedValue({ id: '1', ...propertyData });

      const result = await service.create(propertyData);

      expect(prismaService.property.create).toHaveBeenCalledWith({
        data: propertyData,
      });
      expect(result).toEqual({ id: '1', ...propertyData });
    });
  });

  describe('findAll', () => {
    it('should return an array of properties', async () => {
      const properties = [{ id: '1', title: 'Property 1' }];
      mockPrismaService.property.findMany.mockResolvedValue(properties);

      const result = await service.findAll({});

      expect(result).toEqual(properties);
    });
  });
});
