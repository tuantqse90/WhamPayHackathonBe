/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsGreater', async: false })
export class IsGreaterConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const [maxField, minField] = args.constraints;
    const min = object[minField];
    const max = object[maxField];

    if (typeof min !== 'number' || typeof max !== 'number') {
      return false;
    }

    return max > min || (max == 0 && min == 0);
  }

  defaultMessage(args: ValidationArguments) {
    const [maxField, minField] = args.constraints;
    return `${maxField} must be greater than ${minField}`;
  }
}

export function IsGreater(
  maxField: string,
  minField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsGreater',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxField, minField],
      validator: IsGreaterConstraint,
    });
  };
}
