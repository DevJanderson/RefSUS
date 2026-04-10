CREATE TABLE `doencas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`capitulo` text,
	`categoria` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doencas_codigo_unique` ON `doencas` (`codigo`);--> statement-breakpoint
CREATE INDEX `idx_doencas_codigo` ON `doencas` (`codigo`);--> statement-breakpoint
CREATE TABLE `notificacao_cid` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notificacao_id` integer NOT NULL,
	`codigo_cid` text NOT NULL,
	FOREIGN KEY (`notificacao_id`) REFERENCES `notificacao_compulsoria`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_nc_cid_codigo` ON `notificacao_cid` (`codigo_cid`);--> statement-breakpoint
CREATE INDEX `idx_nc_cid_notificacao` ON `notificacao_cid` (`notificacao_id`);--> statement-breakpoint
CREATE TABLE `notificacao_compulsoria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agravo` text NOT NULL,
	`tipo_notificacao` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_nc_agravo` ON `notificacao_compulsoria` (`agravo`);--> statement-breakpoint
CREATE TABLE `regioes` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `regioes_codigo_ibge_unique` ON `regioes` (`codigo_ibge`);--> statement-breakpoint
CREATE INDEX `idx_regioes_codigo_ibge` ON `regioes` (`codigo_ibge`);--> statement-breakpoint
CREATE INDEX `idx_regioes_uf` ON `regioes` (`uf`);--> statement-breakpoint
CREATE TABLE `sintomas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sintomas_codigo_unique` ON `sintomas` (`codigo`);--> statement-breakpoint
CREATE INDEX `idx_sintomas_codigo` ON `sintomas` (`codigo`);