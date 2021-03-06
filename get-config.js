const fs = require('fs');
const path = require('path');
const {
  mapObjIndexed, pipe, values, merge,
} = require('ramda');

const objectToArrayWithNameProp = pipe(
  mapObjIndexed((item, key) => merge({ name: key }, item)),
  values,
);

module.exports = (config, provider, servicePath) => {
  if (
    !(
      config.authenticationType === 'API_KEY' ||
      config.authenticationType === 'AWS_IAM' ||
      config.authenticationType === 'AMAZON_COGNITO_USER_POOLS' ||
      config.authenticationType === 'OPENID_CONNECT'
    )
  ) {
    throw new Error('appSync property `authenticationType` is missing or invalid.');
  }
  if (!config.serviceRole) {
    throw new Error('appSync property `serviceRole` is required.');
  }
  if (config.authenticationType === 'AMAZON_COGNITO_USER_POOLS' && !config.userPoolConfig) {
    throw new Error('appSync property `userPoolConfig` is required when authenticationType `AMAZON_COGNITO_USER_POOLS` is chosen.');
  }
  if (config.authenticationType === 'OPENID_CONNECT' && !config.openIdConnectConfig) {
    throw new Error('appSync property `openIdConnectConfig` is required when authenticationType `OPENID_CONNECT` is chosenXXX.');
  }
  if (config.logConfig && !config.logConfig.loggingRoleArn) {
    throw new Error('logConfig property `loggingRoleArn` is required when logConfig exists.');
  }
  if (config.logConfig && !config.logConfig.level) {
    throw new Error('logConfig property `level` must be NONE, ERROR, or ALL when logConfig exists.');
  }

  const mappingTemplatesLocation = config.mappingTemplatesLocation || 'mapping-templates';
  const mappingTemplates = config.mappingTemplates || [];

  const schemaPath = path.join(
    servicePath,
    '../serverless-appsync-plugin/example/',
    config.schema || 'schema.graphql',
  );

  const schemaContent = fs.readFileSync(schemaPath, {
    encoding: 'utf8',
  });

  const dataSources = objectToArrayWithNameProp(config.dataSources);

  return {
    name: config.name || 'api',
    apiId: config.apiId,
    apiKey: config.apiKey,
    region: provider.region,
    authenticationType: config.authenticationType,
    schema: schemaContent,
    userPoolConfig: config.userPoolConfig,
    openIdConnectConfig: config.openIdConnectConfig,
    serviceRoleArn: config.serviceRole,
    // TODO verify dataSources structure
    dataSources,
    mappingTemplatesLocation,
    mappingTemplates,
    logConfig: config.logConfig,
  };
};
