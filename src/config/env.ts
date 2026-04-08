import { config } from 'dotenv';

type SupportedAppEnv = 'staging' | 'prod';

const ENV_FILE_BY_MODE: Record<SupportedAppEnv, string> = {
  staging: '.env.staging',
  prod: '.env.production',
};

let loadedEnvFile: string | null = null;

export function resolveEnvFile() {
  const appEnv = process.env.APP_ENV as SupportedAppEnv | undefined;

  if (appEnv && appEnv in ENV_FILE_BY_MODE) {
    return ENV_FILE_BY_MODE[appEnv];
  }

  return '.env';
}

export function loadEnvFile() {
  if (loadedEnvFile) {
    return loadedEnvFile;
  }

  const envFile = resolveEnvFile();
  const result = config({ path: envFile });

  if (result.error) {
    throw result.error;
  }

  loadedEnvFile = envFile;

  return envFile;
}
