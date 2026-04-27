<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# My Blog API

Proyecto de estudio para aprender a construir una API REST con **NestJS**, **TypeORM** y **PostgreSQL**, aplicando buenas prácticas desde el inicio.

---

## Tecnologías principales

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | v11 | Framework principal |
| TypeORM | v0.3 | ORM para acceso a datos |
| PostgreSQL | - | Base de datos relacional |
| class-validator | v0.15 | Validación de DTOs |
| class-transformer | v0.5 | Transformación de payloads |
| bcrypt | v6 | Hash de contraseñas |
| @nestjs/config | v4 | Variables de entorno tipadas |

---

## Estructura del proyecto

```
src/
├── app.module.ts          # Módulo raíz (ConfigModule + TypeOrmModule)
├── env.model.ts           # Interface tipada del entorno
├── main.ts                # Bootstrap + ValidationPipe global
└── users/
    ├── entities/          # Entidades TypeORM (fuente de verdad del esquema)
    ├── dtos/              # DTOs de validación de entrada
    ├── models/            # Interfaces TypeScript (contratos de dominio)
    ├── users.module.ts
    ├── users.controller.ts
    └── users.service.ts
```

---

## Buenas prácticas aplicadas

### 1. Variables de entorno tipadas

Se define una interface `Env` en `src/env.model.ts` y se inyecta con `ConfigService<Env>`, lo que permite autocompletado y detección de errores en tiempo de compilación.

```typescript
// src/env.model.ts
export interface Env {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

// Uso con inferencia de tipo
configService.get('DB_PORT', { infer: true }) // retorna number, no string
```

---

### 2. ValidationPipe global con whitelist estricto

El pipe se configura una sola vez en `main.ts` y aplica a todos los endpoints:

```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,          // convierte tipos automáticamente (ej. string → number en params)
  whitelist: true,          // elimina propiedades no declaradas en el DTO
  forbidNonWhitelisted: true // lanza error si el cliente envía campos extras
}));
```

Esto previene que datos no esperados lleguen a la capa de servicio.

---

### 3. DTOs con class-validator y herencia inteligente

Se separan los DTOs de creación y actualización, reutilizando lógica con `PartialType` y `OmitType` de `@nestjs/mapped-types`:

```typescript
// Creación: todos los campos requeridos
export class CreateUserDto {
  @IsNotEmpty() @IsString() @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

// Actualización: todos los campos opcionales, profile usa su propio UpdateDto
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['profile'])) {
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}
```

`@ValidateNested()` + `@Type(() => Clase)` permite validar objetos anidados recursivamente.

---

### 4. Entidades TypeORM bien definidas

Cada columna especifica tipo, longitud, y restricciones explícitamente, sin depender de inferencias de TypeORM:

```typescript
@Column({ type: 'varchar', length: 255, nullable: false, unique: true })
email: string;

@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
createdAt: Date;
```

Convenciones aplicadas:
- Nombres de columnas en `snake_case` en BD (`name: 'created_at'`), propiedades en `camelCase` en código.
- `timestamptz` en lugar de `timestamp` para almacenar zona horaria.
- Restricciones (`nullable`, `unique`) declaradas en la entidad, no solo en migraciones.

---

### 5. Relación OneToOne con cascade y FK explícita

```typescript
// User (dueño de la FK)
@OneToOne(() => Profile, { nullable: true, cascade: true })
@JoinColumn({ name: 'profile_id' })
profile: Profile;

// Profile (lado inverso)
@OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
user: User;
```

- `cascade: true` en `User` → crear/actualizar un `User` con `profile` anidado persiste el `Profile` automáticamente.
- `onDelete: 'CASCADE'` en `Profile` → si el `User` se elimina, el `Profile` se elimina en cascada desde la BD.
- `@JoinColumn` se declara **solo en el lado dueño** (quien tiene la FK física).

---

### 6. autoLoadEntities: true en TypeOrmModule

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService) => ({
    // ...
    autoLoadEntities: true, // no hace falta listar entidades en el módulo raíz
  }),
})
```

Cada módulo registra sus propias entidades con `TypeOrmModule.forFeature([User, Profile])`. El módulo raíz las recoge automáticamente. Esto evita tener que mantener un array centralizado de entidades.

---

### 7. Hash de contraseñas con bcrypt

Las contraseñas nunca se almacenan en texto plano. El hash se realiza en la capa de servicio antes de persistir:

```typescript
const hashedPassword = await bcrypt.hash(user.password, 10); // 10 salt rounds
user.password = hashedPassword;
```

---

### 8. Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| **Controller** | Recibir HTTP, parsear params/body, delegar al servicio |
| **Service** | Lógica de negocio, acceso al repositorio, manejo de errores de dominio |
| **Entity** | Esquema de BD, relaciones, tipos de columna |
| **DTO** | Contrato de entrada y validación |
| **Model** | Interface de dominio (contrato TypeScript puro) |

---

## Configuración local

1. Crear archivo `.env` en la raíz:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=my_blog_db
```

2. Instalar dependencias:

```bash
npm install
```

3. Correr en modo desarrollo:

```bash
npm run start:dev
```

> `synchronize: true` está activo — TypeORM sincroniza el esquema automáticamente desde las entidades. Solo para desarrollo.

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| GET | `/users/:id/profile` | Obtener perfil de un usuario |
| POST | `/users` | Crear usuario (con perfil anidado) |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

---

## Resources

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
