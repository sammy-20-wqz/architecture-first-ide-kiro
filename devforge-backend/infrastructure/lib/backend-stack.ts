import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

interface BackendProps extends cdk.StackProps {
    neptuneEndpoint: string;
    table: any;
}

export class BackendStack extends cdk.Stack {
    public readonly analyzeFunc: lambda.Function;

    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id, props);

        this.analyzeFunc = new lambda.Function(this, 'AnalyzeCodeFunc', {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'analyze_code.handler.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
            environment: {
                NEPTUNE_ENDPOINT: props.neptuneEndpoint
            }
        });

        // Add other functions similarly...
    }
}
