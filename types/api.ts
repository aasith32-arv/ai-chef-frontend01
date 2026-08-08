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

export type BillingSubscription = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type AdvertisingOrder = {
  id: number;
  amount: number;
  currency: string;
  payment_status: string;
  review_status: string;
  created_at: string;
};

export type BillingStatus = {
  subscription: BillingSubscription | null;
  advertising_orders: AdvertisingOrder[];
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

export type CookingPreferences = {
  servings: number;
  spice_level: "mild" | "medium" | "hot";
  oil_level: "low" | "standard";
  salt_preference: "low" | "standard";
  dietary_restrictions: string[];
  cooking_method: string;
  cookware: string;
  available_ingredients: string[];
  preferred_texture: string;
  beginner_mode: boolean;
  science_mode: boolean;
};

export type CookingIngredient = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  display: string;
  adjusted: boolean;
};

export type CookingStepIngredient = CookingIngredient & {
  addition_order: number;
  why_now: string;
  contribution: string;
  added_too_early: string;
  added_too_late: string;
  expected_transformation: string;
  visual_cue: string;
  aroma_cue: string;
  texture_cue: string;
};

export type CookingStepData = {
  id: string | number;
  step_number: number;
  title: string;
  instruction: string;
  beginner_instruction: string;
  stage: string;
  timing: {
    minimum_minutes: number;
    maximum_minutes: number;
    estimated_minutes: number;
    source: string;
  };
  timeline: { start_minute: number; end_minute: number };
  temperature: {
    heat_level: string;
    minimum_c: number | null;
    maximum_c: number | null;
    reason: string;
    context: string;
    food_safety: string | null;
  };
  ingredients: CookingStepIngredient[];
  doneness: {
    visual_cue: string;
    colour_stage: string;
    colour_progress: number;
    texture_cue: string;
    aroma_cue: string;
  };
  transformation: {
    before: string;
    process: string;
    after: string;
    science?: string;
  };
  purpose: string;
  benefits: string[];
  warnings: string[];
  common_mistakes: Array<{ problem: string; correction: string }>;
  correction: string;
  scientific_explanation: string;
  critical: boolean;
  source: string;
  science_visible: boolean;
};

export type CookingPlanData = {
  recipe: {
    id: number;
    name: string;
    category: string;
    description: string | null;
    base_servings: number;
  };
  servings: number;
  ingredients: CookingIngredient[];
  steps: CookingStepData[];
  summary: {
    estimated_minutes: number;
    difficulty: string;
    heat_profile: string;
    stages: number;
    ingredients: number;
    critical_steps: number;
  };
  personalization: CookingPreferences;
  personalization_notes: Array<{ level: "warning" | "info"; message: string }>;
  source: "stored" | "rule-based";
  estimate_notice: string;
  safety_source: string;
};

export type TroubleshootingResult = {
  problem: string;
  probable_cause: string;
  immediate_action: string;
  recovery_option: string;
  prevention_tip: string;
  disclaimer: string;
  source: string;
  supported_problems: string[];
};

export type SubstitutionResult = {
  ingredient: string;
  options: Array<{
    substitution: string;
    why_it_works: string;
    how_much: string;
    what_changes: string;
  }>;
  context_warning: string;
  source: string;
};
