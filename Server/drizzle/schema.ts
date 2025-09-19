import { pgTable, uuid, varchar, timestamp, text, numeric, jsonb, index, boolean, unique, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const themes = pgTable("themes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar().notNull(),
	dashboardBackground: varchar("dashboard_background").notNull(),
	cardBackground: varchar("card_background").notNull(),
	primaryText: varchar("primary_text").notNull(),
	secondaryText: varchar("secondary_text").notNull(),
	sidebarAccentText: varchar("sidebar_accent_text").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const funds = pgTable("funds", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	fundSize: numeric("fund_size").notNull(),
	fundType: text("fund_type").notNull(),
	targetGeographies: text("target_geographies").notNull(),
	targetSectors: text("target_sectors").notNull(),
	targetMoic: text("target_moic").notNull(),   // changed to string
	targetIrr: text("target_irr").notNull(),     // changed to string
	minimumInvestment: numeric("minimum_investment").notNull(),
	fundManagerId: text("fund_manager_id").notNull(),
	fundLifetime: text("fund_lifetime").notNull(),
	fundDescription: text("fund_description"),
	documents: jsonb().default([]),
	investors: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const otp = pgTable("otp", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	otp: varchar({ length: 10 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	isUsed: boolean("is_used").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("otp_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("otp_otp_idx").using("btree", table.otp.asc().nullsLast().op("text_ops")),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar().notNull(),
	role: varchar({ length: 50 }).notNull(),
	isEmailVerified: boolean("is_email_verified").default(false).notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	selectedThemeId: uuid("selected_theme_id"),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	isOnboarded: boolean("is_onboarded").default(false).notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	referral: varchar({ length: 255 }).default('),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	index("users_selected_theme_idx").using("btree", table.selectedThemeId.asc().nullsLast().op("uuid_ops")),
	unique("users_email_unique").on(table.email),
]);

export const userTokens = pgTable("user_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	email: varchar({ length: 512 }).notNull(),
	token: varchar({ length: 512 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	userRole: varchar("user_role", { length: 50 }).notNull(),
}, (table) => [
	index("user_tokens_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("user_tokens_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);

export const investorOnboarding = pgTable("investor_onboarding", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	status: varchar({ length: 30 }).default('pending').notNull(),
	rejectionNote: varchar("rejection_note", { length: 1024 }),
	formData: jsonb("form_data").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("investor_onboarding_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "investor_onboarding_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const websiteAssets = pgTable("website_assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	logoUrl: varchar("logo_url").notNull(),
	projectName: varchar("project_name").notNull(),
	projectDescription: varchar("project_description").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
