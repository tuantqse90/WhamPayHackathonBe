import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const commonConfig = registerAs('common', () => ({
  privateKey: process.env.PRIVATE_KEY,
}));

export type CommonConfig = ConfigType<typeof commonConfig>;
export const InjectCommonConfig = () => Inject(commonConfig.KEY);
