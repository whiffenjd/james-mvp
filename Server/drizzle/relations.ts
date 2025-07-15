import { relations } from "drizzle-orm/relations";
import { users, investorOnboarding } from "./schema";

export const investorOnboardingRelations = relations(investorOnboarding, ({one}) => ({
	user: one(users, {
		fields: [investorOnboarding.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	investorOnboardings: many(investorOnboarding),
}));