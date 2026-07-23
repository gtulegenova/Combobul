type EnvConfig = {
  baseUrl: string;
  qaUserEmail: string;
  qaUserPassword: string;
};

function optionalValue(name: string): string {
  return (process.env[name] ?? "").trim();
}

function requiredValue(name: string): string {
  const value = optionalValue(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnvConfig(requireBaseUrl: boolean = true): EnvConfig {
  return {
    baseUrl: requireBaseUrl ? requiredValue("BASE_URL") : optionalValue("BASE_URL"),
    qaUserEmail: optionalValue("QA_USER_EMAIL"),
    qaUserPassword: optionalValue("QA_USER_PASSWORD"),
  };
}
