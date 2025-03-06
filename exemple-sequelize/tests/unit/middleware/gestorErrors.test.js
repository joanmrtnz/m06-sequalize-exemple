// tests/unit/middleware/gestorErrors.test.js
const gestorErrors = require('../../../src/middleware/gestorErrors');
const { createExpressMocks } = require('../../mocks/mockFactory');

describe('Gestor d\'errors', () => {
  let { req, res, next } = createExpressMocks();
  
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      path: '/api/test',
      method: 'GET',
      body: { test: 'data' },
      ip: '127.0.0.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock per NODE_ENV
    process.env.NODE_ENV = 'development';
  });
  
  it('hauria de gestionar errors de validació de Sequelize', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: [
        {
          path: 'titol',
          message: 'El títol és obligatori'
        }
      ]
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ERROR_VALIDACIO',
      missatge: 'Les dades proporcionades no compleixen els requisits',
      detalls: [
        {
          camp: 'titol',
          error: 'El títol és obligatori'
        }
      ]
    });
  });
  
  it('hauria de gestionar errors d\'unicitat de Sequelize', () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [
        {
          path: 'email',
          message: 'L\'email ja existeix'
        }
      ]
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ERROR_DUPLICAT',
      missatge: 'Ja existeix un registre amb aquests valors',
      detalls: [
        {
          camp: 'email',
          error: 'El valor ha de ser únic'
        }
      ]
    });
  });
  
  it('hauria de gestionar errors de claus foranes de Sequelize', () => {
    const error = {
      name: 'SequelizeForeignKeyConstraintError',
      table: 'videos',
      parent: {
        detail: 'Key (youtuber_id)=(999) is not present in table "youtubers".'
      }
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ERROR_CLAU_FORANA',
      missatge: 'La referència a un altre registre no és vàlida',
      detalls: 'Key (youtuber_id)=(999) is not present in table "youtubers".'
    });
  });
  
  it('hauria de gestionar errors de base de dades generals de Sequelize', () => {
    const error = {
      name: 'SequelizeDatabaseError',
      parent: {
        code: 'SQLITE_ERROR',
        sqlMessage: 'no such table: invalid_table'
      }
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ERROR_BASE_DADES',
      missatge: 'S\'ha produït un error en la base de dades'
    });
  });
  
  it('hauria de gestionar errors de validació generals', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        email: { message: 'Email invàlid' },
        password: { message: 'Contrasenya massa curta' }
      }
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ERROR_VALIDACIO',
      missatge: 'Les dades proporcionades no compleixen els requisits',
      detalls: [
        { camp: 'email', error: 'Email invàlid' },
        { camp: 'password', error: 'Contrasenya massa curta' }
      ]
    });
  });
  
  it('hauria de gestionar errors de no autoritzat', () => {
    const error = {
      name: 'UnauthorizedError',
      message: 'Token invàlid'
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'NO_AUTORITZAT',
      missatge: 'No tens permisos per accedir a aquest recurs'
    });
  });
  
  it('hauria de gestionar errors d\'accés prohibit', () => {
    const error = {
      name: 'ForbiddenError',
      message: 'No tens permisos per a aquesta acció'
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'ACCES_PROHIBIT',
      missatge: 'No tens autorització per realitzar aquesta acció'
    });
  });
  
  it('hauria de gestionar errors de recurs no trobat', () => {
    const error = {
      name: 'NotFoundError',
      message: 'Recurs no trobat'
    };
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      codi: 'RECURS_NO_TROBAT',
      missatge: 'El recurs sol·licitat no existeix'
    });
  });
  
  it('hauria de gestionar errors no controlats en desenvolupament amb detalls', () => {
    const error = new Error('Error no controlat');
    error.stack = 'Error stack trace';
    
    process.env.NODE_ENV = 'development';
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    
    const response = res.json.mock.calls[0][0];
    expect(response.codi).toBe('ERROR_INTERN');
    expect(response.missatge).toBe('Error intern del servidor');
    expect(response.detalls).toBeDefined();
    expect(response.detalls.missatge).toBe('Error no controlat');
    expect(response.detalls.pila).toBe('Error stack trace');
  });
  
  it('hauria de gestionar errors no controlats en producció sense detalls', () => {
    const error = new Error('Error no controlat');
    
    process.env.NODE_ENV = 'production';
    
    gestorErrors(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    
    const response = res.json.mock.calls[0][0];
    expect(response.codi).toBe('ERROR_INTERN');
    expect(response.missatge).toBe('S\'ha produït un error intern del servidor');
    expect(response.detalls).toBeUndefined();
  });
});
