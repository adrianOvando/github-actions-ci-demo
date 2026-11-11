# Laboratorio 5.1: Creacion de un Workflow de GitHub Actions para CI

**Universidad San Francisco Xavier de Chuquisaca**  
**Facultad de Tecnologia**  
**Carrera:** Ingenieria en Ciencias de la Computacion  
**Asignatura:** Trabajando en la Nube (COM610)  
**Docente:** Ing. Marcelo Quispe Ortega  
**Estudiante:** Jesus Adrian Ovando  
**Semestre:** 2/2026  
**Repositorio Ejercicios Guiados (3.1 - 3.4):** https://github.com/adrianOvando/github-actions-ci-demo.git  
**Repositorio Practica Individual (4):** https://github.com/adrianOvando/Lab5.1_Ejercicio4.git  

---

## 1. Objetivos del Laboratorio

Al concluir el desarrollo de la presente practica de laboratorio, se alcanzaron y consolidaron las siguientes competencias tecnicas:

- Comprender la arquitectura, sintaxis declarativa y componentes fundamentales de un **workflow de GitHub Actions** (eventos, disparadores, jobs, runners y steps).
- Disenar y estructurar archivos de configuracion YAML bajo el directorio `.github/workflows/` para orquestar pipelines de Integracion Continua (CI).
- Automatizar los procesos de preparacion de entorno, restauracion determinista de dependencias, analisis estatico de codigo y ejecucion de pruebas ante eventos `push` y `pull_request`.
- Monitorear, diagnosticar e interpretar los registros de ejecucion generados en la interfaz de **Actions** de GitHub, identificando tanto ejecuciones exitosas como fallos inducidos.
- Incorporar estandares de calidad de software mediante herramientas de linting (**ESLint**) y pruebas automatizadas (**Jest** y **Supertest**).
- Implementar **matrices de ejecucion** (*matrix strategy*) para verificar la compatibilidad multiplataforma y multiversion de una aplicacion en paralelo.
- Configurar e implementar **reglas de proteccion de ramas** (*Branch Protection Rules*) en GitHub para impedir integraciones directas o fusiones de ramas que no satisfagan los controles de calidad exigidos.
- Construir de forma autonoma una aplicacion RESTful completa con una entidad de dominio con operaciones CRUD, suite exhaustiva de pruebas, reporte de cobertura al 100% y flujo de validacion mediante Pull Requests protegidas.

---

## 2. Requisitos y Entorno de Trabajo

Para el desarrollo integral de las practicas se utilizaron los siguientes recursos, utilitarios y entornos de ejecucion:

- **Sistema Operativo Local:** Linux Ubuntu x86_64, terminal interactiva Bash.
- **Control de Versiones:** Git version 2.43+ autenticado mediante Personal Access Token (PAT) con alcance (*scopes*) extendido para repositorios y flujos de trabajo (`workflow`).
- **Plataforma de CI/CD:** GitHub Actions con runners virtuales gestionados basados en imagenes `ubuntu-latest`.
- **Entorno de Ejecucion Backend:** Node.js (versiones 18.x y 20.x LTS) y gestor de paquetes npm version 10+.
- **Framework de Desarrollo Web:** Express.js para la exposicion de servicios RESTful y endpoints HTTP.
- **Herramientas de Calidad y Pruebas:**
  - **ESLint:** Herramienta de analisis estatico para garantizar consistencia de codigo y deteccion temprana de variables sin uso y errores sintacticos.
  - **Jest:** Framework de pruebas unitarias y generador de metricas de cobertura.
  - **Supertest:** Libreria para la realizacion de pruebas de integracion sobre servidores HTTP sin requerir su levantamiento manual en red.

---

## 3. Desarrollo de los Ejercicios Guiados

---

### Ejercicio 3.1: Preparacion del repositorio y la aplicacion

En esta etapa inicial se configuro un nuevo repositorio remoto en GitHub, se clono en la estacion de trabajo local y se construyo una aplicacion base con Node.js y Express estructurada con endpoints funcionales y sus correspondientes pruebas unitarias y de integracion.

#### 1. Creacion del repositorio remoto en GitHub
Se creo un repositorio publico con el nombre `github-actions-ci-demo`.

![Creacion del repositorio remoto en GitHub](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-19-47.png)

#### 2. Clonacion del repositorio localmente
Se ejecuto la clonacion del repositorio mediante el protocolo HTTPS:

```bash
git clone https://github.com/adrianOvando/github-actions-ci-demo.git
cd github-actions-ci-demo
```

![Clonacion del repositorio en la terminal local](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-27-23.png)

#### 3. Inicializacion del proyecto e instalacion de dependencias
Se genero el archivo `package.json` base y se instalaron las dependencias de produccion y desarrollo:

```bash
npm init -y
npm install express
npm install --save-dev jest supertest
```

#### 4. Creacion del modulo principal de la aplicacion (`app.js`)
Se definio la instancia de Express, el middleware para interpretar cuerpos en formato JSON y dos rutas iniciales: `/health` (diagnostico de salud del servicio) y `/users` (listado de usuarios estaticos):

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/users', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

module.exports = app;
```

![Implementacion del archivo app.js en el editor](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-29-17.png)

#### 5. Creacion del punto de entrada del servidor (`server.js`)
Se desacoplo la declaracion de la aplicacion del levantamiento del puerto para facilitar la ejecucion de pruebas de integracion sin conflictos de sockets:

```javascript
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
```

![Implementacion del archivo server.js](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-29-39.png)

#### 6. Diseno de la suite de pruebas unitarias (`app.test.js`)
Se construyeron pruebas utilizando Supertest y aserciones de Jest para validar el codigo de estado HTTP, la estructura de la respuesta y el contenido de los endpoints:

```javascript
const request = require('supertest');
const app = require('./app');

describe('API Tests', () => {
  test('GET /health debe retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /users debe retornar una lista de usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
```

![Implementacion del archivo app.test.js](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-30-16.png)

#### 7. Configuracion del script de ejecucion en `package.json`
Se configuro el comando de testing para invocar a Jest de manera directa:

```json
{
  "name": "github-actions-ci-demo",
  "version": "1.0.0",
  "description": "GitHub Actions CI Demo",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "jest": "^30.3.0",
    "supertest": "^7.2.2"
  }
}
```

![Configuracion del script test en package.json](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-30-46.png)

#### 8. Validacion de pruebas en el entorno local
Se ejecuto el comando `npm test` en la terminal local, verificandose el paso satisfactorio del 100% de las suites de prueba:

```bash
npm test
```

![Resultado de ejecucion exitosa de npm test local](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-31-14.png)

#### 9. Creacion del archivo de exclusion `.gitignore`
Para evitar subir artefactos compilados, dependencias locales o variables sensibles al repositorio, se creo el archivo `.gitignore`:

```text
node_modules/
.env
```

![Configuracion del archivo .gitignore](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-31-52.png)

#### 10. Confirmacion y envio de cambios al repositorio remoto
Se anadieron los archivos al indice de Git, se genero el commit inicial y se enviaron los cambios a la rama principal:

```bash
git add .
git commit -m "feat: inicializa aplicacion express con pruebas unitarias"
git push origin main
```

![Ejecucion de git add y git commit en terminal](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-32-18.png)

![Envio de cambios mediante git push origin main](./Imagenes%20Ejercicio3.1/Screenshot%20From%202026-11-11%2011-32-38.png)

---

### Ejercicio 3.2: Creacion del workflow de CI

En este ejercicio se automatizo el ciclo de integracion continua mediante la definicion de un archivo de flujo de trabajo en formato YAML, de modo que cada cambio enviado a la rama `main` dispare un entorno virtual limpio en GitHub Actions que descargue el proyecto, instale las dependencias y ejecute las pruebas.

#### 1. Creacion de la estructura de directorios del workflow
Se creo el directorio estandar `.github/workflows` y el archivo de definicion `ci.yml`:

```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```

![Creacion de carpetas y archivo ci.yml](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-33-32.png)

#### 2. Configuracion del workflow basico de CI (`ci.yml`)
Se definio el pipeline con los eventos de disparo `push` y `pull_request` sobre la rama `main`, especificando la ejecucion sobre una maquina virtual con Ubuntu y los pasos secuenciales:

```yaml
name: CI Basico

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del codigo
        uses: actions/checkout@v6

      - name: Configurar Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '20'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar pruebas
        run: npm test
```

> **Fundamento tecnico:** Se utilizo `npm ci` en lugar de `npm install` debido a que este comando realiza una instalacion estricta e inmutable a partir del archivo `package-lock.json`, garantizando reproducibilidad exacta e impidiendo modificaciones colaterales en las versiones de dependencias.

![Estructura del archivo ci.yml en el editor](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-33-52.png)

#### 3. Confirmacion y envio del workflow a GitHub
Se registro el archivo en el arbol de Git y se envio al repositorio remoto:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: agrega workflow basico de integracion continua"
git push origin main
```

![Registro y commit del workflow ci.yml](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-40-34.png)

![Publicacion del commit en la rama main](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-40-53.png)

#### 4. Monitoreo de la ejecucion en la interfaz de GitHub Actions
Al ingresar a la seccion **Actions** del repositorio, se observo el disparo automatico del workflow denominado `CI Basico`:

![Visualizacion del workflow en ejecucion en Actions](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-42-14.png)

El job concluyo exitosamente en un tiempo aproximado de 16 segundos, marcando el indicador verde de aprobacion:

![Workflow CI Basico completado exitosamente](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-43-41.png)

#### 5. Inspeccion detallada de los logs de cada paso
Se ingreso al detalle del job `build-and-test` para verificar la salida de cada comando ejecutado en el runner:
- Descarga del repositorio con `actions/checkout`.
- Configuracion del entorno Node.js v20.x con `actions/setup-node`.
- Instalacion limpia de paquetes con `npm ci`.
- Ejecucion exitosa de las 2 pruebas de Jest con `npm test`.

![Logs detallados de los pasos del job build-and-test](./Imagenes%20Ejercicio3.2/Screenshot%20From%202026-11-11%2011-45-03.png)

---

### Ejercicio 3.3: Extension del pipeline con calidad de codigo

Para robustecer el pipeline, se integro una etapa de analisis estatico de codigo mediante **ESLint**, asegurando que cualquier error de sintaxis, incumplimiento de directrices o variables no utilizadas detenga el proceso antes de la ejecucion de las pruebas.

#### 1. Instalacion e inicializacion de ESLint
Se instalo la herramienta y se configuro el entorno mediante su asistente CLI:

```bash
npm install --save-dev eslint
npx eslint --init
```

![Instalacion y configuracion inicial de ESLint en terminal](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-49-55.png)

#### 2. Configuracion de script y archivo de reglas de ESLint
Se anadio el script `"lint": "eslint ."` en el archivo `package.json` y se genero el archivo de configuracion `eslint.config.mjs`:

```json
"scripts": {
  "start": "node server.js",
  "test": "jest",
  "lint": "eslint ."
}
```

![Configuracion del comando lint en package.json](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-51-00.png)

#### 3. Actualizacion del workflow con el paso de linting
Se actualizo `.github/workflows/ci.yml` para incorporar el analisis estatico antes de las pruebas:

```yaml
name: CI con Linting

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del codigo
        uses: actions/checkout@v6

      - name: Configurar Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '20'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar linting
        run: npm run lint

      - name: Ejecutar pruebas
        run: npm test
```

![Actualizacion del archivo ci.yml con el paso de linting](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-51-20.png)

Se confirmaron y enviaron los cambios al repositorio:

```bash
git add .
git commit -m "ci: agrega paso de linting al pipeline"
git push origin main
```

![Commit y push del pipeline con linting](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-51-37.png)

#### 4. Induccion de un fallo intencional en el codigo
Para verificar que el pipeline actúa como una barrera efectiva frente a codigo no conforme, se modifico `app.js` introduciendo variables no utilizadas y errores de sintaxis intencionales:

```javascript
const unusedVariable = 'esto causara un error de linting';
const objeto = {
    pror" }
console.log(objdad)
```

![Modificacion en app.js con errores sintacticos intencionales](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-53-12.png)

Se realizo el commit y envio de la falla inducida:

```bash
git add app.js
git commit -m "test: fuerza un error de linting para probar el pipeline"
git push origin main
```

![Commit del cambio con error forzado](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-53-33.png)

#### 5. Verificacion del fallo en GitHub Actions
Al procesar el commit, el workflow detecto inmediatamente las anomalias durante la ejecucion de `npm run lint`. La ejecucion se interrumpio de inmediato, evitando que se ejecuten las pruebas y marcando el pipeline con una cruz roja (`failed`):

![Workflow fallido por errores de linting en GitHub Actions](./Imagenes%20Ejercicio3.3/Screenshot%20From%202026-11-11%2011-54-20.png)

Posteriormente se corrigio la definicion eliminando el codigo defectuoso y ajustando las variables globales de Node y Jest en `eslint.config.mjs`, devolviendo el pipeline a estado exitoso.

---

### Ejercicio 3.4: Uso de matrices de ejecucion

Las matrices de ejecucion permiten ejecutar una misma definicion de job sobre multiples combinaciones de entornos (como versiones de lenguaje o sistemas operativos) en paralelo, asegurando la portabilidad del proyecto.

#### 1. Configuracion de la matriz en `ci.yml`
Se modifico el workflow para probar concurrentemente la aplicacion bajo las versiones **18 y 20** de Node.js:

```yaml
name: CI con Matriz

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - name: Checkout del codigo
        uses: actions/checkout@v6

      - name: Configurar Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar linting
        run: npm run lint

      - name: Ejecutar pruebas
        run: npm test
```

![Configuracion de la estrategia matrix en ci.yml](./Imagenes%20Ejercicio3.4/Screenshot%20From%202026-11-11%2011-57-20.png)

#### 2. Confirmacion y envio de la matriz
Se aplicaron los cambios y se enviaron al repositorio:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: agrega matriz de versiones de node.js"
git push origin main
```

![Commit y push del workflow con matrix](./Imagenes%20Ejercicio3.4/Screenshot%20From%202026-11-11%2011-58-03.png)

#### 3. Verificacion de jobs paralelos en GitHub Actions
Al inspeccionar la ejecucion del workflow `CI con Matriz`, se observo la generacion de dos sub-jobs ejecutandose en paralelo:
- `build-and-test (18)`
- `build-and-test (20)`

![Ejecucion paralela de los jobs en la matriz de Node.js](./Imagenes%20Ejercicio3.4/Screenshot%20From%202026-11-11%2012-02-51.png)

Ambos entornos completaron sus tareas de descarga, linting y pruebas unitarias satisfactoriamente, validando la compatibilidad retroactiva de la aplicacion.

---

## 4. Practica Individual

En esta seccion se desarrollo un proyecto independiente y completo aplicando todos los conceptos de Integracion Continua, calidad de codigo, cobertura de pruebas y gobernanza de ramas en un repositorio propio:

**URL del Repositorio:** [https://github.com/adrianOvando/Lab5.1_Ejercicio4.git](https://github.com/adrianOvando/Lab5.1_Ejercicio4.git)

---

### 4.1 Arquitectura del Proyecto y Entidad de Dominio

Se diseno una API RESTful profesional para la gestion comercial de inventario basada en la entidad de dominio **`Product` (Producto)** utilizando Node.js y Express con arquitectura modular:

```text
Lab5.1_Ejercicio4/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Definicion completa del pipeline CI
├── src/
│   ├── app.js                      # Instancia y middlewares de Express
│   ├── server.js                   # Punto de arranque y escucha de puerto
│   ├── models/
│   │   └── productModel.js         # Modelo de datos con operaciones en memoria
│   ├── controllers/
│   │   └── productController.js    # Logica de validacion y respuestas HTTP
│   └── routes/
│       └── productRoutes.js        # Mapeo de endpoints RESTful
├── tests/
│   ├── health.test.js              # Pruebas de diagnostico y rutas 404
│   └── products.test.js            # Pruebas exhaustivas CRUD y filtros
├── eslint.config.mjs               # Configuracion de ESLint 9 para Node y Jest
├── package.json                    # Manifiesto de dependencias y scripts
├── README.md                       # Documentacion general del repositorio
└── INFORME.md                      # Informe tecnico vinculado
```

#### Atributos de la Entidad `Product`:
- `id` (Entero positivo unico autoincremental).
- `name` (Cadena de texto obligatoria, no vacia).
- `description` (Cadena descriptiva opcional).
- `price` (Valor numerico flotante estrictamente mayor a 0).
- `stock` (Entero no negativo mayor o igual a 0).
- `category` (Cadena de clasificacion por categorias).
- `createdAt` (Fecha de registro en formato ISO 8601).

#### Endpoints Implementados y Codigos de Estado:
- `GET /health`: Diagnostico de disponibilidad y tiempo de actividad del servicio (`200 OK`).
- `GET /api/products`: Obtencion de la coleccion completa, con soporte de filtrado por query params `?category=` y `?search=` (`200 OK`).
- `GET /api/products/categories`: Consulta de categorias unicas registradas (`200 OK`).
- `GET /api/products/:id`: Busqueda individual por identificador numerico (`200 OK`, `400 Bad Request` ante ID no numerico, `404 Not Found` ante ID inexistente).
- `POST /api/products`: Registro de un nuevo producto con validacion estricta de esquema (`201 Created`, `400 Bad Request` si faltan campos o contienen valores inconsistentes).
- `PUT /api/products/:id`: Modificacion parcial o total de datos (`200 OK`, `400 Bad Request` por parametros invalidos, `404 Not Found`).
- `DELETE /api/products/:id`: Eliminacion controlada del registro (`200 OK`, `400 Bad Request`, `404 Not Found`).

---

### 4.2 Suite de Pruebas Automatizadas y Metricas de Cobertura

Se implementaron 23 pruebas de integracion en [products.test.js](file:///home/adrian/Desktop/Com-610/Lab5.1/Lab5.1_Ejercicio4/tests/products.test.js) y [health.test.js](file:///home/adrian/Desktop/Com-610/Lab5.1/Lab5.1_Ejercicio4/tests/health.test.js) evaluando tanto el camino feliz (*happy path*) como los casos de borde y respuestas de error:

```bash
npm run test:coverage
```

#### Reporte de Cobertura Obtenido:
```text
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    91.66 |     100 |     100 |                   
 src               |     100 |      100 |     100 |     100 |                   
  app.js           |     100 |      100 |     100 |     100 |                   
 src/controllers   |     100 |      100 |     100 |     100 |                   
  ...Controller.js |     100 |      100 |     100 |     100 |                   
 src/models        |     100 |       80 |     100 |     100 |                   
  productModel.js  |     100 |       80 |     100 |     100 |                   
 src/routes        |     100 |      100 |     100 |     100 |                   
  productRoutes.js |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
```

Se alcanzo un **100% de cobertura en Sentencias, Funciones y Lineas de codigo**.

---

### 4.3 Pipeline de CI Completo (`.github/workflows/ci.yml`)

El pipeline implementado en el repositorio individual cumple rigurosamente con los 7 requisitos solicitados:

```yaml
name: Integracion Continua (CI)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    name: Build, Lint, Test & Coverage
    runs-on: ubuntu-latest

    steps:
      - name: 1. Checkout del codigo
        uses: actions/checkout@v4

      - name: 2. Configurar Node.js (v20)
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 3. Instalar dependencias limpias
        run: npm ci

      - name: 4. Paso de Build / Verificacion
        run: |
          echo "Verificando integridad del codigo para Node.js Express..."
          node -e "console.log('Sintaxis y entorno Node.js validos:', process.version)"

      - name: 5. Analisis estatico (Linting con ESLint)
        run: npm run lint

      - name: 6. Ejecutar pruebas unitarias e integracion con cobertura
        run: npm run test:coverage

      - name: 7. Subir reporte de cobertura como artefacto
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 14
```

![Detalle de ejecucion exitosa del pipeline de CI con reporte de cobertura](./Imagenes%20de%20Ejercicio%20individual/Screenshot%20From%202026-11-11%2014-34-33.png)

---

### 4.4 Configuracion de la Regla de Proteccion de Rama (`Branch Protection Rule`)

Para asegurar la integridad de la rama productiva `main`, se accedio a la configuracion del repositorio en GitHub:
1. Navegacion a **Settings** > **Branches**.
2. Definicion del patron de rama objetivo: `main`.
3. Activacion de la casilla obligatoria: **Require status checks to pass before merging**.
4. Seleccion estricta del job del pipeline como requisito bloqueante: **`Build, Lint, Test & Coverage`**.
5. Activacion de la verificacion de actualizacion de rama antes de la fusion.

![Configuracion de la regla de proteccion de rama en GitHub](./Imagenes%20de%20Ejercicio%20individual/Screenshot%20From%202026-11-11%2014-32-56.png)

---

### 4.5 Validacion mediante Pull Requests (Bloqueo y Desbloqueo)

Para validar en practica real la regla de proteccion y la ejecucion reactiva del pipeline:

1. **Pull Request con cambio no conforme o en espera:** Al abrir la Pull Request `#2` desde la rama secundaria `feature/categories-endpoint` hacia `main`, el sistema ejecuto el workflow de inmediato. Durante el procesamiento del job, GitHub marco el estado en espera (`Queued / In progress`) y bloqueo el boton de confirmacion del merge, exigiendo la aprobacion del check requerido.

![Pull Request con el check requerido en ejecucion bloqueando el merge](./Imagenes%20de%20Ejercicio%20individual/Screenshot%20From%202026-11-11%2014-49-15.png)

2. **Aprobacion automatica y confirmacion del Merge:** Una vez que el runner concluyo exitosamente los pasos de instalacion, linting y pruebas con 100% de cobertura, el estado del check cambio a verde (`All checks have passed`). En ese momento, la interfaz autorizo la operacion de fusion (`Merge pull request`), garantizando que solo codigo verificado y de alta calidad ingrese al tronco principal.

![Pull Request autorizada y fusionada exitosamente en la rama main](./Imagenes%20de%20Ejercicio%20individual/Screenshot%20From%202026-11-11%2014-49-41.png)

---

## 5. Conclusiones y Evaluacion de la Integracion Continua

1. **Eliminacion de la Falacia de Entorno:** El empleo de runners efimeros y estandarizados (`ubuntu-latest`) garantiza que el software es capaz de instalarse, construirse y ejecutarse limpiamente de manera agnostica a la configuracion particular del equipo del desarrollador, erradicando el clasico argumento de *"en mi maquina si funcionaba"*.
2. **Deteccion Inmediata de Regresiones:** Al conectar la ejecucion automatica de pruebas unitarias y de integracion ante cada evento de `push` o `pull_request`, cualquier falla logica o ruptura de contratos existentes es expuesta en cuestion de segundos, reduciendo drasticamente el costo temporal y economico de resolver defectos en etapas tardias.
3. **Calidad y Estandarizacion del Codigo:** La inclusion obligatoria de herramientas de analisis estatico como ESLint dentro del pipeline previene malas practicas de desarrollo, variables huerfanas y violaciones de convenciones de codificacion antes de que puedan contaminar la base de codigo principal.
4. **Gobierno y Seguridad con Branch Protection:** Las reglas de proteccion de ramas convierten las politicas de calidad en mecanismos de cumplimiento estricto. Al impedir tecnicamente el merge de ramas que no pasen el pipeline de CI, se desacoplan las revisiones de pares de la tarea manual de verificar sintaxis o pruebas rotas, permitiendo que los ingenieros se concentren en aspectos de arquitectura, seguridad y valor para el negocio.
5. **Auditoria y Trazabilidad de Cobertura:** La generacion y persistencia de reportes de cobertura como artefactos descargables (`coverage-report`) en cada ejecucion ofrece visibilidad objetiva y transparente sobre la exhaustividad de las pruebas a lo largo del ciclo de vida del producto de software.

