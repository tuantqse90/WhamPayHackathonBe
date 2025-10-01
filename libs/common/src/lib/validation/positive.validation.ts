import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class SomePositiveConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, any>;
    const fields = args.constraints as string[];

    return fields.some((field) => {
      const value = obj[field];
      return typeof value === 'number' && value > 0;
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const fields = args.constraints.join(', ');
    return `[${fields}] must be greater than 0`;
  }
}

export function SomePositive(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'SomePositive',
      target: object.constructor,
      propertyName,
      constraints: fields,
      options: validationOptions,
      validator: SomePositiveConstraint,
    });
  };
}
