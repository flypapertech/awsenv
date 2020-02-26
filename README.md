# awsenv
Awsenv is a module that loads environment variables from [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). Storing configuration in the environment separate from code is based on [The Twelve-Factor App](http://12factor.net/config) methodology.

Awsenv draws heavily on the concepts from the great package [dotenv](https://www.npmjs.com/package/dotenv). In fact even this readme was created to read similarly :)

[![NPM version](https://img.shields.io/npm/v/@flypapertech/awsenv)](https://www.npmjs.com/package/@flypapertech/awsenv)

## Install

```bash
# with npm
npm install @flypapertech/awsenv

# or with Yarn
yarn add @flypapertech/awsenv
```

## Requirements

Node.js version >= 10.0

## Usage

awsenv can be used anywhere! Lambda functions, EC2 instances, locally, EKS clusters, etc.

If you haven't already, create a secret in AWS Secrets Manager.  A single secret can contain multiple key value pairs.  Take note of the name of the secret.

Wherever you plan to use awsenv you must make sure that the secrets you are trying to load are accessible to the running environment/user.  For more information check out the [AWS Secrets Manager access docs](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_identity-based-policies.html).

### Preload (preferred approach)

You can use the `--require` (`-r`) [command line option](https://nodejs.org/api/cli.html#cli_r_require_module) to preload awsenv. By doing this, you do not need to require and load awsenv in your application code.

In order to use this method you must have the `AWSENV_SECRET_NAME` environment variable set in your environment to tell awsenv which secrets to load.  

```bash
$ AWSENV_SECRET_NAME=someSecretName node -r @flypapertech/awsenv/config your_script.js
```

You can optionally set `AWS_REGION` to tell awsenv where to get the secrets from. If you do not provide `AWS_REGION` awsenv will fall back to the defaults as outlined in the [AWS SDK docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html#setting-region-order-of-precedence)

```bash
$ AWS_REGION=us-east-1 AWSENV_SECRET_NAME=someSecretName node -r @flypapertech/awsenv/config your_script.js
```

### Require

As early as possible in your application, require and configure awsenv.

```javascript
require('@flypapertech/awsenv').config('someSecretName', 'optionalAWSRegion')
```

`process.env` now has the keys and values you defined in your `.env` file.

```javascript
const db = require('db')
db.connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS
})
```


## FAQ

### Should I use this in development or production

awsenv was created to be used in a production environment that has access to your AWS Secrets. There is nothing stopping you from using it in development mode instead of a `.env` file as long as your development environment is set up with an IAM policy that allows access to the secrets.

### How do I use awsenv with `import`?

ES2015 and beyond offers modules that allow you to `export` any top-level `function`, `class`, `var`, `let`, or `const`.

> When you run a module containing an `import` declaration, the modules it imports are loaded first, then each module body is executed in a depth-first traversal of the dependency graph, avoiding cycles by skipping anything already executed.
>
> – [ES6 In Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)

You must run `awsenv.config('someSecretName')` before referencing any environment variables. Here's an example of problematic code:

`errorReporter.js`:

```js
import { Client } from 'best-error-reporting-service'

export const client = new Client(process.env.BEST_API_KEY)
```

`index.js`:

```js
import * as awsenv from '@flypapertech/awsenv/config'
import errorReporter from './errorReporter'

awsenv.config('someSecretName', 'optionalAWSRegion')
errorReporter.client.report(new Error('faq example'))
```

`client` will not be configured correctly because it was constructed before `awsenv.config()` was executed. There are (at least) 3 ways to make this work.

1. Preload awsenv: `AWSENV_SECRET_NAME=someSecretName node -r @flypapertech/awsenv/config index.js` (_Note: you do not need to `import` awsenv with this approach_)
2. Import `@flypapertech/awsenv/config` instead of `@flypapertech/awsenv` (_Note: you do not need to call `awsenv.config()` and must pass options via environment variables with this approach_)
3. Create a separate file that will execute `config` first.

## Contributing Guide

Comming soon!

## Change Log

See [CHANGELOG.md](CHANGELOG.md)