// tests/fixtures/youtubers.js - Dades de prova pels tests
const youtuberFixtures = [
    {
      id: 1,
      nom_canal: 'Canal Test',
      nom_youtuber: 'Youtuber Test',
      descripcio: 'Canal de prova',
      url_canal: 'https://youtube.com/test'
    },
    {
      id: 2,
      nom_canal: 'Un Altre Test',
      nom_youtuber: 'Un Altre Youtuber',
      descripcio: 'Un altre canal de prova',
      url_canal: 'https://youtube.com/another'
    }
  ];
  
  const perfilFixtures = [
    {
      id: 1,
      youtuber_id: 1,
      url_twitter: 'https://twitter.com/test',
      url_instagram: 'https://instagram.com/test',
      url_web: 'https://test.com',
      informacio_contacte: 'test@example.com'
    }
  ];
  
  const videoFixtures = [
    {
      id: 1,
      youtuber_id: 1,
      titol: 'Vídeo Test',
      descripcio: 'Vídeo de prova',
      url_video: 'https://youtube.com/watch?v=test123',
      data_publicacio: new Date(),
      visualitzacions: 1000,
      likes: 100
    }
  ];
  
  const categoriaFixtures = [
    {
      id: 1,
      titol: 'JavaScript',
      descripcio: 'Vídeos sobre JavaScript'
    },
    {
      id: 2,
      titol: 'Desenvolupament Web',
      descripcio: 'Vídeos sobre desenvolupament web'
    }
  ];
  
  module.exports = {
    youtuberFixtures,
    perfilFixtures,
    videoFixtures,
    categoriaFixtures
  };
   
