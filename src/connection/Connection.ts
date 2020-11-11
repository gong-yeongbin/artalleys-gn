import {
  ConnectionOptions,
  Connection,
  getConnectionManager,
  DefaultNamingStrategy,
  DatabaseType,
} from "typeorm";
import { User } from "../entity/User";
import { Post } from "../entity/Post";
import { PostLocation } from "../entity/PostLocation";
import { PostImage } from "../entity/PostImage";

const {
  DB_TYPE,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_SYNCHRONIZE,
} = process.env;
const entity = [User, Post, PostLocation, PostImage];

const CONNECTION_OPTIONS: ConnectionOptions = {
  type: DB_TYPE as DatabaseType,
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: Boolean(DB_SYNCHRONIZE),
  entities: entity,
};

/**
 * Establishes and returns a connection to the database server. If an existing
 * connection is found, the connection is reused.
 *
 * @see https://github.com/typeorm/typeorm/issues/2598#issue-345445322
 * @export
 * @returns {Promise<Connection>}
 */
export async function getDatabaseConnection(): Promise<Connection> {
  try {
    console.log("Establishing connection...");
    const connectionManager = getConnectionManager();
    let connection: Connection;

    if (connectionManager.has("default")) {
      console.log("Reusing existion connection...");
      connection = injectConnectionOptions(
        connectionManager.get(),
        CONNECTION_OPTIONS
      );
    } else {
      connection = connectionManager.create(CONNECTION_OPTIONS);
      await connection.connect();
    }

    console.log("Connection established");
    return connection;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * Injects missing / outdated connection options into an existing database
 * connection.
 *
 * @see https://github.com/typeorm/typeorm/issues/2598#issue-345445322
 * @param {Connection} connection
 * @param {ConnectionOptions} CONNECTION_OPTIONS
 * @returns {Connection}
 */
function injectConnectionOptions(
  connection: Connection,
  CONNECTION_OPTIONS: ConnectionOptions
): Connection {
  // @ts-ignore
  connection.options = CONNECTION_OPTIONS;
  // @ts-ignore
  connection.manager = connection.createEntityManager();
  // @ts-ignore
  connection.namingStrategy =
    connection.options.namingStrategy || new DefaultNamingStrategy();
  // @ts-ignore
  connection.relationLoader = new RelationLoader(connection);
  // @ts-ignore
  connection.relationIdLoader = new RelationIdLoader(connection);
  // @ts-ignore
  connection.buildMetadatas();

  return connection;
}
