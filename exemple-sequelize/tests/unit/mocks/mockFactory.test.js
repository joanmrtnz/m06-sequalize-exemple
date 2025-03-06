// tests/unit/mocks/mockFactory.test.js
const { 
  createMockYoutuber, 
  createMockPerfil, 
  createMockVideo, 
  createMockCategoria, 
  createMockList, 
  createExpressMocks 
} = require('../../mocks/mockFactory');

describe('mockFactory', () => {
  describe('createMockYoutuber', () => {
    it('hauria de crear un youtuber amb valors per defecte', () => {
      const youtuber = createMockYoutuber();
      expect(youtuber.id).toBe(1);
      expect(youtuber.nom_canal).toBe('Canal Test');
    });

    it('hauria de sobreescriure els valors per defecte', () => {
      const youtuber = createMockYoutuber({ id: 2, nom_canal: 'Altre Canal' });
      expect(youtuber.id).toBe(2);
      expect(youtuber.nom_canal).toBe('Altre Canal');
    });
  });

  describe('createMockPerfil', () => {
    it('hauria de crear un perfil amb valors per defecte', () => {
      const perfil = createMockPerfil();
      expect(perfil.id).toBe(1);
      expect(perfil.youtuber_id).toBe(1);
    });

    it('hauria de sobreescriure els valors per defecte', () => {
      const perfil = createMockPerfil({ id: 2, youtuber_id: 2 });
      expect(perfil.id).toBe(2);
      expect(perfil.youtuber_id).toBe(2);
    });
  });

  describe('createMockVideo', () => {
    it('hauria de crear un vídeo amb valors per defecte', () => {
      const video = createMockVideo();
      expect(video.id).toBe(1);
      expect(video.titol).toBe('Vídeo Test');
    });

    it('hauria de sobreescriure els valors per defecte', () => {
      const video = createMockVideo({ id: 2, titol: 'Altre Vídeo' });
      expect(video.id).toBe(2);
      expect(video.titol).toBe('Altre Vídeo');
    });
  });

  describe('createMockCategoria', () => {
    it('hauria de crear una categoria amb valors per defecte', () => {
      const categoria = createMockCategoria();
      expect(categoria.id).toBe(1);
      expect(categoria.titol).toBe('Categoria Test');
    });

    it('hauria de sobreescriure els valors per defecte', () => {
      const categoria = createMockCategoria({ id: 2, titol: 'Altra Categoria' });
      expect(categoria.id).toBe(2);
      expect(categoria.titol).toBe('Altra Categoria');
    });
  });

  describe('createMockList', () => {
    it('hauria de crear una llista d\'objectes', () => {
      const llista = createMockList(createMockYoutuber, 2);
      expect(llista).toHaveLength(2);
      expect(llista[0].id).toBe(1);
      expect(llista[1].id).toBe(2);
    });

    it('hauria de personalitzar cada objecte', () => {
      const llista = createMockList(createMockYoutuber, 2, (item, index) => ({
        ...item,
        id: index * 10,
        nom_canal: `Canal ${index}`
      }));
      expect(llista).toHaveLength(2);
      expect(llista[0].id).toBe(0);
      expect(llista[0].nom_canal).toBe('Canal 0');
      expect(llista[1].id).toBe(10);
      expect(llista[1].nom_canal).toBe('Canal 1');
    });
  });

  describe('createExpressMocks', () => {
    it('hauria de crear mocks per Express', () => {
      const { req, res, next } = createExpressMocks();
      
      // Provar req.get
      expect(req.get('user-agent')).toBe('Jest Test Agent');
      
      // Provar res.status i res.json
      const jsonResult = res.status(200).json({ test: 'data' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ test: 'data' });
      expect(jsonResult).toBe(res);
      
      // Provar next
      next();
      expect(next).toHaveBeenCalled();
    });

    it('hauria de retornar null per a capçaleres diferents a user-agent', () => {
      const { req } = createExpressMocks();
      const result = req.get('content-type');
      expect(result).toBeNull();
    });
  });
});