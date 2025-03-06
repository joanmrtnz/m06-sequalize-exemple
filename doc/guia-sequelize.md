# Guia d'Estudi: Sequelize i Arquitectura de l'Aplicació

## Índex
1. [Introducció al Projecte](#introducció-al-projecte)
2. [Estructura del Projecte](#estructura-del-projecte)
3. [Arquitectura MVC](#arquitectura-mvc)
4. [Sequelize: Conceptes Bàsics](#sequelize-conceptes-bàsics)
5. [Models i Relacions](#models-i-relacions)
6. [Operacions amb Sequelize](#operacions-amb-sequelize)
7. [Gestió d'Errors](#gestió-derrors)
8. [Testing](#testing)
9. [Punts Clau a Recordar](#punts-clau-a-recordar)
10. [Exercicis Pràctics](#exercicis-pràctics)

## Introducció al Projecte

Aquest projecte és una aplicació Node.js que utilitza Express.js com a framework web i Sequelize com a ORM (Object-Relational Mapping) per interactuar amb una base de dades SQLite. L'aplicació gestiona informació de YouTubers especialitzats en programació, els seus perfils, vídeos i categories.

**Funcionalitats principals:**
- Gestió de YouTubers i els seus perfils
- Gestió de vídeos publicats pels YouTubers
- Categorització dels vídeos per temes (JavaScript, Python, etc.)
- API RESTful per accedir a aquesta informació

## Estructura del Projecte

```
exemple-sequelize/
│
├── src/
│   ├── config/          # Configuració (base de dades, logger, swagger)
│   ├── controllers/     # Controladors (lògica de negoci)
│   ├── middleware/      # Middleware (gestió d'errors, etc.)
│   ├── models/          # Models de dades (definicions Sequelize)
│   ├── routes/          # Rutes API
│   └── utils/           # Utilitats (validació de dades, etc.)
│
├── tests/               # Tests (unitaris, integració, e2e)
│
├── server.js            # Punt d'entrada de l'aplicació
└── loadData.js          # Script per carregar dades a la BD
```

## Arquitectura MVC

El projecte segueix el patró Model-Vista-Controlador (MVC):

- **Models**: Defineixen l'estructura de les dades i interactuen amb la base de dades (Sequelize)
- **Vistes**: No hi ha vistes tradicionals ja que és una API, però les respostes JSON actuen com a "vistes"
- **Controladors**: Gestionen les peticions, processen dades i retornen respostes

## Sequelize: Conceptes Bàsics

### Què és Sequelize?

Sequelize és un ORM (Object-Relational Mapping) per Node.js que suporta PostgreSQL, MySQL, SQLite i altres bases de dades. Permet:

- Definir models i relacions en JavaScript
- Executar consultes complexes amb una API intuïtiva
- Gestionar migracions i validacions
- Treballar amb promeses i async/await

### Configuració de Sequelize

La configuració es troba a `src/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');
const { logger } = require('./logger');
const path = require('path');

// Construïm la ruta absoluta al fitxer SQLite
const dbPath = path.join(__dirname, process.env.DB_PATH);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: msg => logger.debug(msg),
    // Opcions addicionals de SQLite
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
```

## Models i Relacions

### Definició de Models

Els models defineixen l'estructura de les taules de la base de dades. Exemple del model `Youtuber`:

```javascript
const Youtuber = sequelize.define('Youtuber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom_canal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nom_youtuber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcio: {
        type: DataTypes.TEXT
    },
    url_canal: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'youtubers'
});
```

### Relacions entre Models

Les relacions es defineixen a `src/models/index.js`:

```javascript
// Relació 1:1 entre Youtuber i PerfilYoutuber
Youtuber.hasOne(PerfilYoutuber, { foreignKey: 'youtuber_id' });
PerfilYoutuber.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació 1:N entre Youtuber i Video
Youtuber.hasMany(Video, { foreignKey: 'youtuber_id' });
Video.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació N:M entre Video i Categoria
Video.belongsToMany(Categoria, { through: 'videos_categories', foreignKey: 'video_id' });
Categoria.belongsToMany(Video, { through: 'videos_categories', foreignKey: 'categoria_id' });
```

### Tipus de Relacions:

1. **One-to-One (1:1)**: `hasOne` i `belongsTo`
   - Un YouTuber té un perfil, un perfil pertany a un YouTuber

2. **One-to-Many (1:N)**: `hasMany` i `belongsTo`
   - Un YouTuber té molts vídeos, un vídeo pertany a un YouTuber

3. **Many-to-Many (N:M)**: `belongsToMany`
   - Un vídeo pot tenir moltes categories, una categoria pot tenir molts vídeos
   - Requereix una taula d'unió (videos_categories)

## Operacions amb Sequelize

### Crear Registres

```javascript
// Crear un nou vídeo
const video = await Video.create({
  titol: 'Nou Vídeo',
  descripcio: 'Descripció del vídeo',
  url_video: 'https://youtube.com/nou-video',
  youtuber_id: 1,
  visualitzacions: 0,
  likes: 0
});
```

### Consultar Registres

```javascript
// Obtenir tots els YouTubers
const youtubers = await Youtuber.findAll();

// Obtenir un YouTuber per ID
const youtuber = await Youtuber.findByPk(1);

// Consulta amb condicions
const videos = await Video.findAll({
  where: { youtuber_id: 1 }
});

// Consulta amb includes (eager loading)
const videoAmbYoutuber = await Video.findByPk(1, {
  include: [{ model: Youtuber }]
});
```

### Actualitzar Registres

```javascript
// Actualitzar un registre
await Video.update(
  { titol: 'Nou Títol', visualitzacions: 1000 },
  { where: { id: 1 } }
);
```

### Eliminar Registres

```javascript
// Eliminar un registre
await Video.destroy({ where: { id: 1 } });
```

### Transaccions

```javascript
// Utilitzar transaccions per operacions atòmiques
const t = await sequelize.transaction();

try {
  const video = await Video.create({
    titol: 'Nou Vídeo',
    youtuber_id: 1
  }, { transaction: t });
  
  await video.setCategories([1, 2], { transaction: t });
  
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

## Gestió d'Errors

El projecte té un middleware centralitzat per gestionar errors (`src/middleware/gestorErrors.js`) que captura i processa diferents tipus d'errors, incloent errors específics de Sequelize:

```javascript
switch (err.name) {
  case 'SequelizeValidationError':
    // Errors de validació (camps obligatoris, restriccions)
    return res.status(400).json({
      codi: 'ERROR_VALIDACIO',
      missatge: 'Les dades proporcionades no compleixen els requisits',
      detalls: err.errors.map(e => ({
        camp: e.path,
        error: e.message
      }))
    });
  
  case 'SequelizeUniqueConstraintError':
    // Errors d'unicitat (duplicats)
    return res.status(409).json({
      codi: 'ERROR_DUPLICAT',
      missatge: 'Ja existeix un registre amb aquests valors',
      detalls: err.errors.map(e => ({
        camp: e.path,
        error: 'El valor ha de ser únic'
      }))
    });
  
  // Altres casos...
}
```

## Testing

El projecte utilitza Jest per testejar l'aplicació en diferents nivells:

1. **Tests Unitaris**: Proven components individuals (models, utils)
2. **Tests d'Integració**: Proven la interacció entre components (controllers amb models)
3. **Tests End-to-End**: Proven el sistema complet (rutes API)

Exemple de test d'integració:

```javascript
describe('Tests d\'Integració VideoController', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Crear dades de prova
    createdYoutuber = await Youtuber.create({
      nom_canal: 'Canal Test Integració',
      nom_youtuber: 'Tester Integració',
      descripcio: 'Canal per a proves d\'integració',
      url_canal: 'https://youtube.com/integration-test'
    });
    
    // ...
  });
  
  describe('obtenirTots', () => {
    it('hauria de retornar tots els vídeos', async () => {
      // ...
      await VideoController.obtenirTots(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      // ...
    });
  });
});
```

## Punts Clau a Recordar

1. **Sequelize Bàsic**:
   - Un model representa una taula a la base de dades
   - Els atributs del model defineixen les columnes
   - Les opcions (`tableName`, etc.) configuren el comportament

2. **Relacions**:
   - `hasOne` / `belongsTo`: relacions 1:1
   - `hasMany` / `belongsTo`: relacions 1:N
   - `belongsToMany`: relacions N:M (amb taula d'unió)

3. **Consultes**:
   - `findAll()`: obtenir múltiples registres
   - `findByPk()`: obtenir per clau primària
   - `findOne()`: obtenir un registre amb condicions
   - `include`: càrrega eager de relacions

4. **Operacions**:
   - `create()`: crear nou registre
   - `update()`: actualitzar registres
   - `destroy()`: eliminar registres

5. **Transaccions**:
   - Utilitzar `sequelize.transaction()` per operacions atòmiques
   - `commit()` i `rollback()` per finalitzar o cancel·lar

## Exercicis Pràctics

1. **Exercici Model**: Afegeix un nou model `Comentari` que tingui relació amb `Video` (un vídeo pot tenir molts comentaris).

2. **Exercici Consulta**: Escriu una consulta per obtenir tots els vídeos d'una categoria específica, ordenats per visualitzacions.

3. **Exercici Relacions**: Crea una nova relació entre `Youtuber` i `Categoria` per representar les categories favorites d'un YouTuber.

4. **Exercici Controlador**: Implementa un controlador per crear, llegir, actualitzar i eliminar comentaris.

5. **Exercici Test**: Escriu un test unitari per al nou model `Comentari` i un test d'integració per al controlador.

---

## Recursos Addicionals

- [Documentació oficial de Sequelize](https://sequelize.org/master/)
- [Guia Express.js](https://expressjs.com/en/guide/routing.html)
- [Testing amb Jest](https://jestjs.io/docs/getting-started)
