import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiProps extends cdk.StackProps {
    analyzeLambda: lambda.Function;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id, props);

        const api = new apigateway.RestApi(this, 'DevForgeApi', {
            restApiName: 'DevForge Service',
            description: 'Architecture Validation API'
        });

        const analyzeIntegration = new apigateway.LambdaIntegration(props.analyzeLambda);
        api.root.addResource('analyze').addMethod('POST', analyzeIntegration);
    }
}
