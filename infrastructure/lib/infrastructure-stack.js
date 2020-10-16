const dynamodb = require('@aws-cdk/aws-dynamodb');
const cdk = require('@aws-cdk/core');
const apigateway = require('@aws-cdk/aws-apigateway');
const lambda = require('@aws-cdk/aws-lambda');
const fs = require('fs');

class InfrastructureStack extends cdk.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
       fs.copyFileSync("../Utilities/icons.json", '../backend/lambdas/getIcons/icons.json')
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
     }
}

module.exports = { InfrastructureStack }
