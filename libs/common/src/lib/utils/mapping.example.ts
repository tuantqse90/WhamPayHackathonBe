/**
 * Example usage of the mapping utility
 */
import { createMap, mapObject, mapArray, mapProperties } from './mapping.util';

// Source and destination type definitions
interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: string;
  createdAt: Date;
}

interface UserViewModel {
  userId: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
  joinDate: string;
}

// Example 1: Using createMap and mapObject
// Define mapping configuration
createMap<UserDto, UserViewModel>('UserDto', 'UserViewModel')
  .forMember('userId', src => src.id)
  .forMember('fullName', src => `${src.firstName} ${src.lastName}`)
  .forMember('email', src => src.emailAddress)
  .forMember('isAdmin', src => src.role === 'admin')
  .forMember('joinDate', src => src.createdAt.toLocaleDateString());

// Use the mapping
const userDto: UserDto = {
  id: 123,
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john.doe@example.com',
  role: 'admin',
  createdAt: new Date('2023-01-15')
};

// Map a single object
const userViewModel = mapObject<UserDto, UserViewModel>('UserDto', 'UserViewModel', userDto);
console.log('Mapped user:', userViewModel);
// Output: {
//   userId: 123,
//   fullName: 'John Doe',
//   email: 'john.doe@example.com',
//   isAdmin: true,
//   joinDate: '1/15/2023'
// }

// Example 2: Using mapArray
const userDtos: UserDto[] = [
  userDto,
  {
    id: 456,
    firstName: 'Jane',
    lastName: 'Smith',
    emailAddress: 'jane.smith@example.com',
    role: 'user',
    createdAt: new Date('2023-03-20')
  }
];

// Map an array of objects
const userViewModels = mapArray<UserDto, UserViewModel>('UserDto', 'UserViewModel', userDtos);
console.log('Mapped users:', userViewModels);

// Example 3: Using mapProperties (without configuration)
interface SimpleSource {
  id: number;
  name: string;
  value: number;
}

interface SimpleTarget {
  id: number;
  name: string;
  active: boolean;
}

const simpleSource: SimpleSource = {
  id: 1,
  name: 'Test',
  value: 42
};

// Simple mapping with default template
const simpleTarget = mapProperties<SimpleSource, SimpleTarget>(
  simpleSource,
  { id: 0, name: '', active: true }
);
console.log('Simple mapping:', simpleTarget);
// Output: { id: 1, name: 'Test', active: true }

// Example 4: Using mapProperties with property mapping
const propertyMappedTarget = mapProperties<SimpleSource, Record<string, any>>(
  simpleSource,
  undefined,
  { id: 'identifier', name: 'title', value: 'amount' }
);
console.log('Property mapped:', propertyMappedTarget);
// Output: { identifier: 1, title: 'Test', amount: 42 } 