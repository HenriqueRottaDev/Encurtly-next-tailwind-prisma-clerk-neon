export const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  link: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  click: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
}