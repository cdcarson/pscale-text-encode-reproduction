import 'dotenv/config';
import {connect, type Connection} from '@planetscale/database'
export const getConnection = (): Connection => {
  return connect({url: process.env.DATABASE_URL})
}