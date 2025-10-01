/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: type === 'query',
    });

    const errors = await validate(object, {
      skipMissingProperties: type === 'query',
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: abstract new (...args: any[]) => any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): any[] {
    return errors.map((error) => {
      const formatted: any = {
        property: error.property,
        messages: error.constraints ? Object.values(error.constraints) : [],
      };

      if (error.children && error.children.length > 0) {
        formatted.children = this.formatErrors(error.children);
      }

      return formatted;
    });
  }
}
