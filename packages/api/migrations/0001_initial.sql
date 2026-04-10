-- Initial schema for RefSUS

CREATE TABLE IF NOT EXISTS `doencas` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `codigo` text NOT NULL,
  `nome` text NOT NULL,
  `descricao` text,
  `capitulo` text,
  `categoria` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `doencas_codigo_unique` ON `doencas` (`codigo`);
CREATE INDEX IF NOT EXISTS `idx_doencas_codigo` ON `doencas` (`codigo`);

CREATE TABLE IF NOT EXISTS `notificacao_compulsoria` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `agravo` text NOT NULL,
  `tipo_notificacao` text NOT NULL,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_nc_agravo` ON `notificacao_compulsoria` (`agravo`);

CREATE TABLE IF NOT EXISTS `notificacao_cid` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `notificacao_id` integer NOT NULL,
  `codigo_cid` text NOT NULL,
  FOREIGN KEY (`notificacao_id`) REFERENCES `notificacao_compulsoria`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX IF NOT EXISTS `idx_nc_cid_codigo` ON `notificacao_cid` (`codigo_cid`);
CREATE INDEX IF NOT EXISTS `idx_nc_cid_notificacao` ON `notificacao_cid` (`notificacao_id`);

CREATE TABLE IF NOT EXISTS `regioes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `codigo_ibge` text NOT NULL,
  `nome` text NOT NULL,
  `tipo` text NOT NULL,
  `uf` text,
  `estado` text,
  `latitude` real,
  `longitude` real,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `regioes_codigo_ibge_unique` ON `regioes` (`codigo_ibge`);
CREATE INDEX IF NOT EXISTS `idx_regioes_codigo_ibge` ON `regioes` (`codigo_ibge`);
CREATE INDEX IF NOT EXISTS `idx_regioes_uf` ON `regioes` (`uf`);

CREATE TABLE IF NOT EXISTS `sintomas` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `codigo` text NOT NULL,
  `nome` text NOT NULL,
  `descricao` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `sintomas_codigo_unique` ON `sintomas` (`codigo`);
CREATE INDEX IF NOT EXISTS `idx_sintomas_codigo` ON `sintomas` (`codigo`);
