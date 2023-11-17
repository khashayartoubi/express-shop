import express from 'express';
import mongoose from 'mongoose';
import config from './config/index.js';
import { typeDefs } from '../api/schema.js';
import { resolvers } from '../api/resolvers.js';
import { ApolloServer } from 'apollo-server-express';
import User from './models/users.js';
import bodyParser from 'body-parser';
const app = express();

export const Application = class {
  constructor() {
    this.serverConfig();
    this.databaseConfig();
    app.use(bodyParser.json());
    // app.use("*",bodyParser.text({ type: 'application/json' }))

  }

  async databaseConfig() {
    mongoose.Promise = global.Promise;
    await mongoose.connect(config.database.url);
  }
  route() {
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        rootValue: resolver,
        graphiql: true,
      })
    )

    // app.use('/graphql', handler);
  }

  async serverConfig() {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        try {
          const token = await User.CheckToken(req, config.secret.jwt);
          if (token) {
            let isAdmin = await User.findById(token.id)
            return {
              isAdmin: isAdmin.level,
              token
            }
          }
        } catch (error) {
          throw new Error(error)
        }
      }
    });
    await server.start();
    server.applyMiddleware({ app });
    app.listen(config.port, () => {
      console.log(`server run on port ${config.port}`);
    });
  }
};
