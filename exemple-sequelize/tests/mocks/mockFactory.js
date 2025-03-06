// tests/mocks/mockFactory.js
/**
 * Factoria per crear mocks reutilitzables en els tests
 * Facilita la creació d'objectes de prova amb valors predeterminats
 */

/**
 * Crea un objecte youtuber per tests
 * @param {Object} overrides - Propietats per sobreescriure els valors per defecte
 * @returns {Object} - Objecte youtuber per tests
 */
const createMockYoutuber = (overrides = {}) => {
    return {
      id: 1,
      nom_canal: 'Canal Test',
      nom_youtuber: 'Youtuber Test',
      descripcio: 'Canal de proves per tests',
      url_canal: 'https://youtube.com/test',
      ...overrides
    };
  };
  
  /**
   * Crea un objecte perfil de youtuber per tests
   * @param {Object} overrides - Propietats per sobreescriure els valors per defecte
   * @returns {Object} - Objecte perfil per tests
   */
  const createMockPerfil = (overrides = {}) => {
    return {
      id: 1,
      youtuber_id: 1,
      url_twitter: 'https://twitter.com/test',
      url_instagram: 'https://instagram.com/test',
      url_web: 'https://test.com',
      informacio_contacte: 'test@example.com',
      ...overrides
    };
  };
  
  /**
   * Crea un objecte vídeo per tests
   * @param {Object} overrides - Propietats per sobreescriure els valors per defecte
   * @returns {Object} - Objecte vídeo per tests
   */
  const createMockVideo = (overrides = {}) => {
    return {
      id: 1,
      youtuber_id: 1,
      titol: 'Vídeo Test',
      descripcio: 'Vídeo de prova per tests',
      url_video: 'https://youtube.com/watch?v=test123',
      data_publicacio: new Date('2023-01-01'),
      visualitzacions: 1000,
      likes: 100,
      ...overrides
    };
  };
  
  /**
   * Crea un objecte categoria per tests
   * @param {Object} overrides - Propietats per sobreescriure els valors per defecte
   * @returns {Object} - Objecte categoria per tests
   */
  const createMockCategoria = (overrides = {}) => {
    return {
      id: 1,
      titol: 'Categoria Test',
      descripcio: 'Categoria de prova per tests',
      ...overrides
    };
  };
  
  /**
   * Crea una llista d'objectes per tests
   * @param {Function} factory - Funció factory per crear el tipus d'objecte
   * @param {number} count - Quantitat d'objectes a crear
   * @param {Function} customizer - Funció per personalitzar cada objecte basat en el seu índex
   * @returns {Array} - Llista d'objectes per tests
   */
  const createMockList = (factory, count = 3, customizer = (item, index) => ({...item, id: index + 1})) => {
    return Array.from({ length: count }, (_, index) => {
      const item = factory();
      return customizer(item, index);
    });
  };
  
  /**
   * Crea mocks per Express req, res, next
   * @returns {Object} - Objecte amb req, res i next
   */
  const createExpressMocks = () => {
    const req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      cookies: {},
      session: {},
      ip: '127.0.0.1',
      get: jest.fn().mockImplementation((name) => {
        if (name === 'user-agent') return 'Jest Test Agent';
        return null;
      })
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      locals: {},
      getHeader: jest.fn(),
      setHeader: jest.fn()
    };
    
    const next = jest.fn();
    
    return { req, res, next };
  };
  
  // Exportar totes les funcions de la factoria
  module.exports = {
    createMockYoutuber,
    createMockPerfil,
    createMockVideo,
    createMockCategoria,
    createMockList,
    createExpressMocks
  };
  