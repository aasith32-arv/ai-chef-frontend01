export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string> | string[] | null;
};

export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  serving_size: number;
  steps: string[];
  image: string | null;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
};

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type RecipeListData = {
  items: Recipe[];
  meta: Pagination;
  /** @deprecated use meta */
  pagination?: Pagination;
};

export type CalculateResult = {
  recipe: string;
  people: number;
  serving_size: number;
  quantities: Record<string, string>;
};

export type RecommendationItem = {
  recipe: Recipe;
  match_percentage: number;
  missing_ingredients: string[];
};

export type RecommendResult = {
  available_ingredients: string[];
  count: number;
  recommendations: RecommendationItem[];
};

export type Favorite = {
  id: number;
  user_id: number;
  recipe_id: number;
  created_at: string;
  recipe: Recipe;
};

export type AuthPayload = {
  user: User;
};

export type AIIngredient = {
  name: string;
  quantity: number;
  unit: string;
  display: string;
};

export type AIMealPlan = {
  dish: string;
  category: string;
  description: string;
  people: number;
  ingredients: AIIngredient[];
  steps: string[];
  tips: string[];
  source: string;
  language?: string;
};

export type AISuggestion = {
  name: string;
  category: string;
  match_percentage: number;
  description: string;
  missing_ingredients: string[];
  why: string;
};

export type AISuggestResult = {
  available_ingredients: string[];
  count: number;
  suggestions: AISuggestion[];
  source: string;
};
