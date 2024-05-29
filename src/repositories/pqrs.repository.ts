import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Pqrs, PqrsRelations} from '../models';

export class PqrsRepository extends DefaultCrudRepository<
  Pqrs,
  typeof Pqrs.prototype.id_Pqrs,
  PqrsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Pqrs, dataSource);
  }
}
