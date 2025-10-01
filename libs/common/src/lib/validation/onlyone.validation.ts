/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'OnlyOneDefined', async: false })
export class OnlyOneDefinedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const properties = args.constraints as string[];
    const definedFields = properties.filter(prop => object[prop] !== undefined && object[prop] !== null);
    return definedFields.length === 1;
  }

  defaultMessage(args: ValidationArguments) {
    const props = args.constraints.join(', ');
    return `Only one of the following fields must be defined: ${props}`;
  }
}

export function OnlyOneDefined(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'OnlyOneDefined',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: properties,
      validator: OnlyOneDefinedConstraint,
    });
  };
}
