# API de YouTubers de Programació (Exemple Sequelize)

Aquesta API proporciona accés a informació sobre youtubers que creen contingut relacionat amb programació, els seus perfils, vídeos i categories.

## Descripció del Projecte

Aquest projecte és una API RESTful desenvolupada amb Node.js, Express i Sequelize (ORM) que gestiona informació sobre youtubers especialitzats en contingut de programació. L'aplicació utilitza una base de dades SQLite i ofereix diferents endpoints per consultar i gestionar la informació.

## Característiques

- **CRUD complet** per a youtubers, perfils, vídeos i categories
- **Swagger UI** per a documentació interactiva de l'API
- **Validació de dades** amb sistema automàtic de verificació de CSVs
- **Logging extensiu** amb Winston per a desenvolupament i depuració
- **Gestió centralitzada d'errors** per a respostes consistents
- **Sistema de càrrega de dades** des d'arxius CSV

## Requisits

- Node.js >= 14.x
- npm >= 6.x

## Instal·lació

1. Clona el repositori:
```bash
git clone <url-del-repositori>
cd exemple-sequelize
```

2. Instal·la les dependències:
```bash
npm install
```

3. Configura les variables d'entorn creant un arxiu `.env` a l'arrel del projecte:
```
NODE_ENV=development
PORT=3000
DB_PATH=../../data/youtuber_db.sqlite
DATA_DIR_PATH=../data
LOG_FILE_PATH=../data/logs
LOG_LEVEL=info
```

## Ús

### Iniciar el servidor

```bash
# Mode producció
npm start

# Mode desenvolupament amb recàrrega automàtica
npm run dev

# Mode debug
npm run debug
```

### Carregar dades inicials

```bash
npm run load-data
```

### Validar dades CSV

```bash
npm run validate-csv
```

### Executar tests

```bash
# Executar tots els tests
npm test

# Executar només tests unitaris
npm run test:unit

# Executar només tests d'integració
npm run test:integration

# Executar tests end-to-end
npm run test:e2e

# Executar tests en mode watch
npm run test:watch

# Generar informe de cobertura de codi
npm run test:coverage
```

## Estructura de la Base de Dades

L'aplicació utilitza els següents models:

- **Youtuber**: Informació bàsica sobre el youtuber (nom, canal, descripció, URL del canal)
- **PerfilYoutuber**: Informació de perfil (xarxes socials, web personal, contacte)
- **Video**: Vídeos publicats pels youtubers (títol, descripció, URL, visualitzacions, likes)
- **Categoria**: Categories de programació (JavaScript, Python, React, etc.)
- **VideosCategories**: Relació molts a molts entre vídeos i categories

## Endpoints de l'API

Els principals endpoints disponibles són:

### Youtubers
- `GET /api/youtubers`: Obté tots els youtubers
- `GET /api/youtubers/:id`: Obté un youtuber específic
- `GET /api/youtubers/:id/perfil`: Obté el perfil d'un youtuber
- `GET /api/youtubers/:id/videos`: Obté els vídeos d'un youtuber

### Vídeos
- `GET /api/videos`: Obté tots els vídeos
- `GET /api/videos/:id`: Obté un vídeo específic
- `GET /api/videos/:id/categories`: Obté les categories d'un vídeo
- `POST /api/videos`: Crea un nou vídeo

### Categories
- `GET /api/categories`: Obté totes les categories

## Documentació

La documentació completa de l'API està disponible a través de Swagger UI:

```
http://localhost:3000/api-docs
```

## Estructura del Projecte

```
.
├── data/
│   ├── logs/                   # Arxius de log
│   └── youtubers_programacio/  # Dades CSV
├── exemple-sequelize/
│   ├── coverage/               # Informes de cobertura de tests
│   ├── jest.config.js          # Configuració de Jest
│   ├── loadData.js             # Script per carregar dades des de CSV
│   ├── package.json            # Dependències i scripts
│   ├── server.js               # Punt d'entrada principal
│   ├── src/
│   │   ├── config/             # Configuració (BD, logger, Swagger)
│   │   ├── controllers/        # Controladors per a cada entitat
│   │   ├── middleware/         # Middleware (gestió d'errors)
│   │   ├── models/             # Models Sequelize
│   │   ├── routes/             # Definició de rutes
│   │   └── utils/              # Utilitats (validació CSV)
│   └── tests/                  # Tests
│       ├── e2e/                # Tests end-to-end
│       ├── fixtures/           # Dades fixes per a tests
│       ├── integration/        # Tests d'integració
│       ├── mocks/              # Factories per a mocks de test
│       ├── setup.js            # Configuració dels tests
│       └── unit/               # Tests unitaris
└── .env                        # Variables d'entorn (no inclòs al repo)
```

## Desenvolupament

### Dependències Principals

- **express**: Framework web per construir l'API
- **sequelize**: ORM per a la base de dades
- **sqlite3**: Driver de base de dades SQLite
- **winston**: Sistema avançat de logging
- **winston-daily-rotate-file**: Rotació d'arxius de log
- **papaparse**: Parsing d'arxius CSV
- **swagger-jsdoc/swagger-ui-express**: Documentació de l'API
- **cors**: Middleware per gestionar CORS
- **dotenv**: Gestió de variables d'entorn

### Dependències de Desenvolupament

- **jest**: Framework de testing
- **supertest**: Testing d'API HTTP
- **nodemon**: Recàrrega automàtica en desenvolupament
- **cross-env**: Variables d'entorn multiplataforma

## Gestió d'Errors

El sistema inclou una gestió centralitzada d'errors que proporciona respostes consistents per a:

- Errors de validació de dades
- Errors d'integritat referencial
- Errors d'unicitat (duplicats)
- Errors d'autorització i autenticació
- Errors generals de base de dades
- Errors no controlats

## Validació de Dades CSV

El sistema inclou un mòdul de validació per verificar:

- Estructura correcta dels arxius CSV
- Integritat referencial entre taules
- Detecció de duplicats
- Detecció de dades obligatòries faltants
- Validació de valors (dates futures, mètriques negatives)

## Logging

El sistema de logging està configurat per:

- Registrar detalladament les operacions de l'API
- Generar arxius de log diaris amb rotació automàtica
- Separar logs segons nivells d'importància (info, warn, error)
- Capturar errors de promeses no controlades

## Tests

El projecte inclou una suite de tests:

- **Tests unitaris**: Per a components individuals
- **Tests d'integració**: Per a interaccions entre components
- **Tests end-to-end**: Per a fluxos complets de l'API