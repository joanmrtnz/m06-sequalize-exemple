// tests/integration/controllers/CategoriaController.test.js
const { sequelize, Categoria } = require('../../setup');
const CategoriaController = require('../../../src/controllers/CategoriaController');

describe('Tests d\'Integració CategoriaController', () => {
  let req, res, next;
  let createdCategories;
  
  beforeAll(async () => {
    // Sincronitzar la base de dades
    await sequelize.sync({ force: true });
    
    // Crear dades de prova
    createdCategories = await Categoria.bulkCreate([
      {
        titol: 'JavaScript Test',
        descripcio: 'Categoria JS per a tests'
      },
      {
        titol: 'Python Test',
        descripcio: 'Categoria Python per a tests'
      },
      {
        titol: 'HTML Test',
        descripcio: 'Categoria HTML per a tests'
      }
    ]);
  });
  
  beforeEach(() => {
    // Preparar mocks per cada test
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  describe('obtenirTotes', () => {
    it('hauria de retornar totes les categories', async () => {
      req = {};
      
      await CategoriaController.obtenirTotes(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(true);
      expect(responseData.missatge).toContain('Categories obtingudes amb èxit');
      expect(responseData.resultat.length).toBe(3);
      expect(responseData.resultat[0].titol).toBe('JavaScript Test');
      expect(responseData.resultat[1].titol).toBe('Python Test');
      expect(responseData.resultat[2].titol).toBe('HTML Test');
    });
    
    it('hauria de gestionar errors', async () => {
      req = {};
      
      // Crear un error simulat
      const mockError = new Error('Error de test');
      
      // Espiar el mètode findAll i fer que llanci un error
      const findAllSpy = jest.spyOn(Categoria, 'findAll');
      findAllSpy.mockRejectedValue(mockError);
      
      await CategoriaController.obtenirTotes(req, res, next);
      
      // Verificar que s'ha cridat next amb l'error
      expect(next).toHaveBeenCalledWith(mockError);
      
      // Restaurar l'spy
      findAllSpy.mockRestore();
    });
  });
  
  // Si el controller té més mètodes, afegeix més tests aquí
  
  afterAll(async () => {
    // Netejar la base de dades i tancar la connexió
    await sequelize.sync({ force: true });
  });
});