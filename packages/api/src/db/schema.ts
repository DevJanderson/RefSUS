import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const doencas = sqliteTable(
  'doencas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    codigo: text('codigo').notNull().unique(),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    capitulo: text('capitulo'),
    categoria: text('categoria'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('idx_doencas_codigo').on(table.codigo)],
)

export const notificacaoCompulsoria = sqliteTable(
  'notificacao_compulsoria',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    agravo: text('agravo').notNull(),
    tipoNotificacao: text('tipo_notificacao').notNull(), // imediata | semanal
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('idx_nc_agravo').on(table.agravo)],
)

export const notificacaoCid = sqliteTable(
  'notificacao_cid',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    notificacaoId: integer('notificacao_id')
      .notNull()
      .references(() => notificacaoCompulsoria.id),
    codigoCid: text('codigo_cid').notNull(),
  },
  (table) => [
    index('idx_nc_cid_codigo').on(table.codigoCid),
    index('idx_nc_cid_notificacao').on(table.notificacaoId),
  ],
)

export const sintomas = sqliteTable(
  'sintomas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    codigo: text('codigo').notNull().unique(),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('idx_sintomas_codigo').on(table.codigo)],
)

export const regioes = sqliteTable(
  'regioes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    codigoIbge: text('codigo_ibge').notNull().unique(),
    nome: text('nome').notNull(),
    tipo: text('tipo').notNull(),
    uf: text('uf'),
    estado: text('estado'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index('idx_regioes_codigo_ibge').on(table.codigoIbge),
    index('idx_regioes_uf').on(table.uf),
  ],
)
