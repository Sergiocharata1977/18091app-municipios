# Tests E2E - Guía de Uso

## Comandos Disponibles

| Comando                    | Entorno                | Descripción                       |
| -------------------------- | ---------------------- | --------------------------------- |
| `npm run test:e2e`         | Local (localhost:3000) | Tests contra dev server local     |
| `npm run test:e2e:ui`      | Local                  | Con interfaz gráfica Playwright   |
| `npm run test:e2e:headed`  | Local                  | Ver navegador mientras corre      |
| `npm run test:e2e:prod`    | **Producción**         | Tests contra www.doncandidoia.com |
| `npm run test:e2e:prod:ui` | Producción             | Con UI gráfica en producción      |

## Testing en Producción

Para testear contra el servidor de producción:

```bash
npm run test:e2e:prod
```

### Requisitos

- Usuario de test válido en Firebase Auth
- Conexión a internet

### Variables de Entorno

Los tests usan estas variables (en `e2e/modules/core-modules.spec.ts`):

- `TEST_EMAIL`: Email del usuario de test (default: `admin@test.com`)
- `TEST_PASSWORD`: Contraseña (default: `Test123456`)

Para usar credenciales diferentes:

```bash
$env:TEST_EMAIL="miusuario@email.com"; $env:TEST_PASSWORD="mipassword"; npm run test:e2e:prod
```

## Testing Local

```bash
# Inicia dev server automáticamente
npm run test:e2e

# Con interfaz gráfica
npm run test:e2e:ui
```

## Estructura de Tests

```
e2e/
├── auth/
│   ├── login.spec.ts       # Login flow
│   └── register.spec.ts    # Registro
├── documents/
│   └── create-document.spec.ts
├── modules/
│   └── core-modules.spec.ts  # Dashboard, RRHH, Procesos, Mi SGC
├── organizations/
│   ├── create-organization.spec.ts
│   └── organization-user-flow.spec.ts
├── users/
│   ├── create-user.spec.ts
│   └── modulos-habilitados.spec.ts
└── ia/
    └── context-isolation.spec.ts
```

## Tips

1. **Correr solo un archivo**:

   ```bash
   npx playwright test e2e/auth/login.spec.ts
   ```

2. **Correr tests en paralelo**:

   ```bash
   npx playwright test --workers=4
   ```

3. **Ver reporte HTML**:
   ```bash
   npx playwright show-report
   ```
