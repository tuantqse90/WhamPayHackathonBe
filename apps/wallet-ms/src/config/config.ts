import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    baseUrl: process.env.BASE_URL_APIS || '',
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
    nodeEnv: process.env.NODE_ENV || 'development',  };
});

export type AppConfig = ConfigType<typeof appConfig>;
export const InjectAppConfig = () => Inject(appConfig.KEY);
