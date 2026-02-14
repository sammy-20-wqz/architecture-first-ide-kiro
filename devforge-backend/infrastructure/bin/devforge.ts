#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { ApiStack } from '../lib/api-stack';
import { DataStack } from '../lib/data-stack';

const app = new cdk.App();
const dataStack = new DataStack(app, 'DevForgeDataStack');
const backendStack = new BackendStack(app, 'DevForgeBackendStack', {
    neptuneEndpoint: dataStack.neptuneEndpoint,
    table: dataStack.table
});
new ApiStack(app, 'DevForgeApiStack', {
    analyzeLambda: backendStack.analyzeFunc
});
