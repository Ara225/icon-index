const dynamodb = require('@aws-cdk/aws-dynamodb');
const cdk = require('@aws-cdk/core');
const apigateway = require('@aws-cdk/aws-apigateway');
const lambda = require('@aws-cdk/aws-lambda');
const s3 = require('@aws-cdk/aws-s3');
const s3Deployment = require('@aws-cdk/aws-s3-deployment');

class InfrastructureStack extends cdk.Stack {
    /**
     * @param {cdk.App} scope
     * @param {string} id
     * @param {cdk.StackProps} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);
        var api = new apigateway.RestApi(this, 'iconsIndex', {
            restApiName: 'iconsIndex',
            defaultCorsPreflightOptions: {
                allowOrigins: ["*"],
                allowMethods: ["GET", "POST", "OPTIONS"]
            }
        })
        var getIconsResource = api.root.addResource('icons')
        const getIcons = new lambda.Function(this, "getIcons", {
            timeout: cdk.Duration.seconds(10),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: "app.handler",
            code: lambda.Code.fromAsset('../backend/lambdas/getIcons/'),
        });
        var getIconsIntegration = new apigateway.LambdaIntegration(getIcons, { proxy: true })
        getIconsResource.addMethod('GET', getIconsIntegration)
        var iconIndexSiteBucket = new s3.Bucket(this, "iconIndexSiteBucket", {
            bucketName: "icon-index-site-bucket",
            publicReadAccess: true,
            websiteIndexDocument: "index.html",
            accessControl: s3.BucketAccessControl.PUBLIC_READ
        })
        iconIndexSiteBucket.addCorsRule({
            allowedHeaders: ["*"], allowedMethods: [s3.HttpMethods.GET],
            allowedOrigins: ["*"], exposedHeaders: ["ETag"]
        })
        // ******* Code to automatically deploy the frontend code to the website bucket
        new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
            sources: [s3Deployment.Source.asset("../frontend")],
            destinationBucket: iconIndexSiteBucket
        }
        )
    }
}

module.exports = { InfrastructureStack }
