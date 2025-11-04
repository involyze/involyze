# Infrastructure

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Local Development
Required environment variables:
```bash
AWS_ACCOUNT_ID=<account-id>
AWS_ACCESS_KEY_ID=<access-key-id>
AWS_SECRET_ACCESS_KEY=<secret-access-key>
AWS_REGION=eu-central-1
```

## Commands
```bash
# Install
npm install

# Compile typescript to js
npm run build

# Watch for changes and compile
npm run watch

# Perform the jest unit tests
npm run test

# Deploy this stack to your default AWS account/region
npm run cdk deploy

# Destroy
npm run cdk destroy

# Compare deployed stack with current state
npm run cdk diff

# Emits the synthesized CloudFormation template
npm run cdk synth
```

## Deployment Pipeline
GitHub Actions automatically deploys on push to main branch.
Required repository secrets:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
