## Description
A relayer bot to send a transaction on behalf of user.


## Postman Collection:
- [API Endpoint](https://www.getpostman.com/collections/d4a819155dac3b673a82)

## Instructions
- Follow the [ Installation Steps ](#installation)
- Copy the `.env.sample` to `.env`
  - Add the api key from Alchemy dashboard
  - Add Raw private key of your relayer account (Only for Polygon Mainnet(137))
- Run the app [instructions](#instructions)
- Refer to the [Postman Collection](#postman-collection) 

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test [PENDING]

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
