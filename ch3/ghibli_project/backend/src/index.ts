import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import app from './app';
import { FilmResolver } from './resolver/Film';

async function bootStrap() {
  const schema = await buildSchema({
    resolvers: [FilmResolver],
  });
  const server = new ApolloServer({
    schema,
  });

  try {
    await server.start();

    app.use('/graphql', expressMiddleware(server));
    app.listen(app.get('PORT'), () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
          server started on => http://localhost:${app.get('PORT')} 
          graphql playground => http://localhost:${app.get('PORT')}/graphql
        `);
      } else {
        console.log(`
          Production server Started... 
        `);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

bootStrap();
