import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {RolMenu} from '../models';
import {RolMenuRepository} from '../repositories';

export class PermisosController {
  constructor(
    @repository(RolMenuRepository)
    public rolMenuRepository : RolMenuRepository,
  ) {}

  @post('/permiso')
  @response(200, {
    description: 'RolMenu model instance',
    content: {'application/json': {schema: getModelSchemaRef(RolMenu)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolMenu, {
            title: 'NewRolMenu',
            exclude: ['_id'],
          }),
        },
      },
    })
    rolMenu: Omit<RolMenu, '_id'>,
  ): Promise<RolMenu> {
    return this.rolMenuRepository.create(rolMenu);
  }

  @get('/permiso/count')
  @response(200, {
    description: 'RolMenu model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(RolMenu) where?: Where<RolMenu>,
  ): Promise<Count> {
    return this.rolMenuRepository.count(where);
  }

  @get('/permiso')
  @response(200, {
    description: 'Array of RolMenu model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(RolMenu, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(RolMenu) filter?: Filter<RolMenu>,
  ): Promise<RolMenu[]> {
    return this.rolMenuRepository.find(filter);
  }

  @patch('/permiso')
  @response(200, {
    description: 'RolMenu PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolMenu, {partial: true}),
        },
      },
    })
    rolMenu: RolMenu,
    @param.where(RolMenu) where?: Where<RolMenu>,
  ): Promise<Count> {
    return this.rolMenuRepository.updateAll(rolMenu, where);
  }

  @get('/permiso/{id}')
  @response(200, {
    description: 'RolMenu model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(RolMenu, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(RolMenu, {exclude: 'where'}) filter?: FilterExcludingWhere<RolMenu>
  ): Promise<RolMenu> {
    return this.rolMenuRepository.findById(id, filter);
  }

  @patch('/permiso/{id}')
  @response(204, {
    description: 'RolMenu PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolMenu, {partial: true}),
        },
      },
    })
    rolMenu: RolMenu,
  ): Promise<void> {
    await this.rolMenuRepository.updateById(id, rolMenu);
  }

  @put('/permiso/{id}')
  @response(204, {
    description: 'RolMenu PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rolMenu: RolMenu,
  ): Promise<void> {
    await this.rolMenuRepository.replaceById(id, rolMenu);
  }

  @del('/permiso/{id}')
  @response(204, {
    description: 'RolMenu DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.rolMenuRepository.deleteById(id);
  }
}
