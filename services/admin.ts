import { apiClient, unwrap } from "@/lib/api-client";
import type {
  AdminCookingStep,
  AdminRecipe,
  DishFamily,
  Ingredient,
  Pagination,
  User,
} from "@/types/api";
import type { RecipeQuery } from "@/services/recipes";

export type AdminDashboard = {
  statistics: {
    total_recipes: number;
    total_families: number;
    total_users: number;
    premium_users: number;
    published_recipes: number;
    draft_recipes: number;
    inactive_recipes: number;
    total_advertisements: number;
    pending_advertisements: number;
  };
  recent_recipes: AdminRecipe[];
  recent_updated_recipes: AdminRecipe[];
  recent_users: User[];
  recent_advertisements: AdminAdvertisement[];
  recent_audit: AdminAuditEntry[];
};

export type AdminAuditEntry = {
  id: number;
  admin_user_id: number;
  admin: string | null;
  action: string;
  target_type: string;
  target_id: number | null;
  created_at: string;
};

export type AdminRecipePayload = {
  name: string;
  slug?: string | null;
  category: string;
  family_id?: number | null;
  description: string;
  serving_size: number;
  steps: string[];
  image?: string;
  cuisine?: string | null;
  region?: string | null;
  protein?: string | null;
  diet_type?: string | null;
  difficulty?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  spice_level?: string | null;
  tags?: string[];
  publication_status: "draft" | "published" | "inactive";
  ingredients: Array<Pick<Ingredient, "name" | "quantity" | "unit">>;
  cooking_steps?: AdminCookingStep[];
};

export type AdminFamily = DishFamily & { managed_by_admin: boolean };
export type AdminUser = User & { is_premium: boolean };
export type AdminCategory = {
  name: string;
  recipe_count: number;
  family_count: number;
};
export type AdminAdvertisement = {
  id: number;
  amount: number;
  currency: string;
  payment_status: string;
  review_status: string;
  created_at: string;
  updated_at: string;
  customer: { id: number; username: string; email: string } | null;
};
export type AdminPayment = {
  id: number;
  user: { id: number; username: string; email: string };
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

type Paginated<T> = { items: T[]; meta: Pagination };

export const getAdminDashboard = () =>
  unwrap<AdminDashboard>(apiClient.get("/admin/dashboard"));

export const getAdminRecipes = (
  params: RecipeQuery & { status?: string } = {}
) => unwrap<Paginated<AdminRecipe>>(apiClient.get("/admin/recipes", { params }));

export const getAdminRecipe = (id: number) =>
  unwrap<{ recipe: AdminRecipe }>(apiClient.get(`/admin/recipes/${id}`));

export const createAdminRecipe = (payload: AdminRecipePayload) =>
  unwrap<{ recipe: AdminRecipe }>(apiClient.post("/admin/recipes", payload));

export const updateAdminRecipe = (
  id: number,
  payload: Partial<AdminRecipePayload>
) =>
  unwrap<{ recipe: AdminRecipe }>(apiClient.put(`/admin/recipes/${id}`, payload));

export const duplicateAdminRecipe = (id: number) =>
  unwrap<{ recipe: AdminRecipe }>(
    apiClient.post(`/admin/recipes/${id}/duplicate`)
  );

export const deactivateAdminRecipe = (id: number) =>
  unwrap<{ recipe: AdminRecipe }>(apiClient.delete(`/admin/recipes/${id}`));

export const getAdminFamilies = (
  params: { search?: string; page?: number; per_page?: number } = {}
) =>
  unwrap<Paginated<AdminFamily>>(
    apiClient.get("/admin/dish-families", { params })
  );

export const createAdminFamily = (payload: Partial<AdminFamily>) =>
  unwrap<{ family: AdminFamily }>(apiClient.post("/admin/dish-families", payload));

export const updateAdminFamily = (id: number, payload: Partial<AdminFamily>) =>
  unwrap<{ family: AdminFamily }>(
    apiClient.put(`/admin/dish-families/${id}`, payload)
  );

export const deleteAdminFamily = (id: number) =>
  apiClient.delete(`/admin/dish-families/${id}`);

export const getAdminCategories = () =>
  unwrap<{ items: AdminCategory[] }>(apiClient.get("/admin/categories"));

export const renameAdminCategory = (old_name: string, new_name: string) =>
  unwrap<{ recipes_updated: number; families_updated: number }>(
    apiClient.patch("/admin/categories", { old_name, new_name })
  );

export const getAdminUsers = (
  params: { search?: string; role?: string; is_active?: boolean; page?: number; per_page?: number } = {}
) => unwrap<Paginated<AdminUser>>(apiClient.get("/admin/users", { params }));

export const updateAdminUser = (
  id: number,
  payload: { role?: "user" | "admin"; is_active?: boolean }
) => unwrap<{ user: User }>(apiClient.patch(`/admin/users/${id}`, payload));

export const getAdminAdvertisements = (
  params: { status?: string; page?: number; per_page?: number } = {}
) =>
  unwrap<Paginated<AdminAdvertisement>>(
    apiClient.get("/admin/advertisements", { params })
  );

export const updateAdminAdvertisement = (id: number, review_status: string) =>
  unwrap<{ advertisement: AdminAdvertisement }>(
    apiClient.patch(`/admin/advertisements/${id}`, { review_status })
  );

export const getAdminPayments = (page = 1) =>
  unwrap<Paginated<AdminPayment>>(
    apiClient.get("/admin/payments", { params: { page } })
  );

export const getAdminSettings = () =>
  unwrap<Record<string, Record<string, unknown>>>(
    apiClient.get("/admin/settings")
  );
