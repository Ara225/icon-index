const dynamodb = require('@aws-cdk/aws-dynamodb');
const cdk = require('@aws-cdk/core');
const apigateway = require('@aws-cdk/aws-apigateway');
const lambda = require('@aws-cdk/aws-lambda');

class InfrastructureStack extends cdk.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create a dynamodb table for the resource
    let iconsTable = new dynamodb.Table(
      this, "iconsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      readCapacity: 2,
      writeCapacity: 2,
      billingMode: dynamodb.BillingMode.PROVISIONED
    })
       var api = new apigateway.RestApi(this, 'APIAllSorts', {
         restApiName: 'APIAllSorts',
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
