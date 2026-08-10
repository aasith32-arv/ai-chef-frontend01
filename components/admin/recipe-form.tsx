"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminRecipe, DishFamily } from "@/types/api";
import type { AdminRecipePayload } from "@/services/admin";

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unit: z.string().trim().min(1, "Unit is required"),
});

const cookingStepSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  instruction: z.string().trim().min(1, "Instruction is required"),
  duration: z.coerce.number().int().min(0),
  heat_level: z.string(),
  temperature_min: z.coerce.number().int().min(0),
  temperature_max: z.coerce.number().int().min(0),
  visual_cue: z.string(),
  colour_stage: z.string(),
  texture_cue: z.string(),
  aroma_cue: z.string(),
  purpose: z.string(),
  warnings: z.string(),
  ingredient_names: z.string(),
  critical: z.boolean(),
});

const recipeFormSchema = z.object({
  name: z.string().trim().min(2, "Recipe name is required").max(150),
  slug: z.string().trim().regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string(),
  category: z.string().trim().min(1, "Category is required"),
  family_id: z.string(),
  serving_size: z.coerce.number().int().min(1).max(1000),
  prep_time: z.coerce.number().int().min(0),
  cook_time: z.coerce.number().int().min(0),
  difficulty: z.string(),
  cuisine: z.string(),
  region: z.string(),
  protein: z.string(),
  diet_type: z.string(),
  spice_level: z.string(),
  tags: z.string(),
  image: z.string().refine(
    (value) => !value || /^https:\/\/images\.unsplash\.com\//.test(value),
    "Use an images.unsplash.com URL"
  ),
  publication_status: z.enum(["draft", "published", "inactive"]),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient"),
  steps: z.array(z.object({ value: z.string().trim().min(1, "Instruction is required") })).min(1),
  cooking_steps: z.array(cookingStepSchema),
});

type RecipeFormInput = z.input<typeof recipeFormSchema>;
type RecipeFormValues = z.output<typeof recipeFormSchema>;

function optional(value: string) {
  return value.trim() || null;
}

function emptyCookingStep() {
  return {
    title: "",
    instruction: "",
    duration: 0,
    heat_level: "",
    temperature_min: 0,
    temperature_max: 0,
    visual_cue: "",
    colour_stage: "",
    texture_cue: "",
    aroma_cue: "",
    purpose: "",
    warnings: "",
    ingredient_names: "",
    critical: false,
  };
}

function defaults(recipe?: AdminRecipe): RecipeFormValues {
  return {
    name: recipe?.name ?? "",
    slug: recipe?.slug ?? "",
    description: recipe?.description ?? "",
    category: recipe?.category ?? "",
    family_id: recipe?.family_id ? String(recipe.family_id) : "",
    serving_size: recipe?.serving_size ?? 4,
    prep_time: recipe?.prep_time ?? 0,
    cook_time: recipe?.cook_time ?? 0,
    difficulty: recipe?.difficulty ?? "Medium",
    cuisine: recipe?.cuisine ?? "",
    region: recipe?.region ?? "",
    protein: recipe?.protein ?? "",
    diet_type: recipe?.diet_type ?? "",
    spice_level: recipe?.spice_level ?? "Medium",
    tags: (recipe?.tags ?? []).join(", "),
    image: recipe?.image ?? "",
    publication_status: recipe?.publication_status ?? "draft",
    ingredients: recipe?.ingredients?.length
      ? recipe.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit }))
      : [{ name: "", quantity: 1, unit: "g" }],
    steps: recipe?.steps?.length ? recipe.steps.map((value) => ({ value })) : [{ value: "" }],
    cooking_steps: recipe?.cooking_steps?.map((step) => ({
      title: step.title,
      instruction: step.instruction,
      duration: step.duration ?? 0,
      heat_level: step.heat_level ?? "",
      temperature_min: step.temperature_min ?? 0,
      temperature_max: step.temperature_max ?? 0,
      visual_cue: step.visual_cue ?? "",
      colour_stage: step.colour_stage ?? "",
      texture_cue: step.texture_cue ?? "",
      aroma_cue: step.aroma_cue ?? "",
      purpose: step.purpose ?? "",
      warnings: (step.warnings ?? []).join("\n"),
      ingredient_names: (step.ingredient_names ?? []).join(", "),
      critical: step.critical,
    })) ?? [],
  };
}

export function RecipeForm({
  recipe,
  families,
  pending,
  onSubmit,
}: {
  recipe?: AdminRecipe;
  families: DishFamily[];
  pending: boolean;
  onSubmit: (payload: AdminRecipePayload) => Promise<void>;
}) {
  const form = useForm<RecipeFormInput, unknown, RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: defaults(recipe),
  });
  const ingredients = useFieldArray({ control: form.control, name: "ingredients" });
  const instructions = useFieldArray({ control: form.control, name: "steps" });
  const intelligence = useFieldArray({ control: form.control, name: "cooking_steps" });
  const image = useWatch({ control: form.control, name: "image" });
  const publicationStatus = useWatch({ control: form.control, name: "publication_status" });

  function move<T extends { move: (from: number, to: number) => void }>(array: T, index: number, direction: -1 | 1, length: number) {
    const target = index + direction;
    if (target >= 0 && target < length) array.move(index, target);
  }

  return (
    <form
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          slug: values.slug.trim() || null,
          description: values.description.trim(),
          category: values.category.trim(),
          family_id: values.family_id ? Number(values.family_id) : null,
          serving_size: values.serving_size,
          prep_time: values.prep_time,
          cook_time: values.cook_time,
          difficulty: optional(values.difficulty),
          cuisine: optional(values.cuisine),
          region: optional(values.region),
          protein: optional(values.protein),
          diet_type: optional(values.diet_type),
          spice_level: optional(values.spice_level),
          tags: values.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
          image: values.image.trim(),
          publication_status: values.publication_status,
          ingredients: values.ingredients,
          steps: values.steps.map((step) => step.value.trim()),
          cooking_steps: values.cooking_steps.map((step) => ({
            ...step,
            minimum_duration: null,
            maximum_duration: null,
            temperature_min: step.temperature_min || null,
            temperature_max: step.temperature_max || null,
            heat_level: optional(step.heat_level),
            visual_cue: optional(step.visual_cue),
            colour_stage: optional(step.colour_stage),
            texture_cue: optional(step.texture_cue),
            aroma_cue: optional(step.aroma_cue),
            transformation_before: null,
            transformation_process: null,
            transformation_after: null,
            purpose: optional(step.purpose),
            benefits: [],
            warnings: step.warnings.split("\n").map((item) => item.trim()).filter(Boolean),
            common_mistakes: [],
            correction: null,
            scientific_explanation: null,
            ingredient_names: step.ingredient_names.split(",").map((item) => item.trim()).filter(Boolean),
          })),
        });
      })}
    >
      <div className="min-w-0 space-y-6">
      <Card id="general" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>1. Basic information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipe name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Stable slug" hint="Leave blank to generate from the name." error={form.formState.errors.slug?.message}><Input {...form.register("slug")} placeholder="hyderabadi-chicken-biryani" /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={4} {...form.register("description")} /></Field></div>
          <Field label="Base servings" error={form.formState.errors.serving_size?.message}><Input type="number" min={1} {...form.register("serving_size")} /></Field>
          <Field label="Difficulty"><select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("difficulty")}><option>Easy</option><option>Medium</option><option>Advanced</option></select></Field>
          <Field label="Preparation time (minutes)"><Input type="number" min={0} {...form.register("prep_time")} /></Field>
          <Field label="Cooking time (minutes)"><Input type="number" min={0} {...form.register("cook_time")} /></Field>
        </CardContent>
      </Card>

      <Card id="classification" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>2. Classification</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Category" error={form.formState.errors.category?.message}><Input {...form.register("category")} placeholder="Rice Dishes" /></Field>
          <Field label="Dish family" hint="Need another family? Use the management link below."><select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("family_id")}><option value="">No family</option>{families.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select><Link className="inline-flex text-xs font-semibold text-primary hover:underline" href="/admin/families">Create or manage dish families</Link></Field>
          <Field label="Cuisine"><Input {...form.register("cuisine")} /></Field>
          <Field label="Region"><Input {...form.register("region")} /></Field>
          <Field label="Protein"><Input {...form.register("protein")} /></Field>
          <Field label="Diet type"><Input {...form.register("diet_type")} /></Field>
          <Field label="Spice level"><select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("spice_level")}><option>Mild</option><option>Medium</option><option>Hot</option></select></Field>
          <div className="sm:col-span-2"><Field label="Tags" hint="Comma-separated"><Input {...form.register("tags")} placeholder="rice, celebration, sri-lankan" /></Field></div>
        </CardContent>
      </Card>

      <Card id="ingredients" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>3. Ingredients</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {ingredients.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded-2xl border border-border p-3 sm:grid-cols-[1fr_130px_120px_auto] sm:items-end">
              <Field label={`Ingredient ${index + 1}`} error={form.formState.errors.ingredients?.[index]?.name?.message}><Input {...form.register(`ingredients.${index}.name`)} /></Field>
              <Field label="Quantity" error={form.formState.errors.ingredients?.[index]?.quantity?.message}><Input type="number" min="0.001" step="any" {...form.register(`ingredients.${index}.quantity`)} /></Field>
              <Field label="Unit"><Input {...form.register(`ingredients.${index}.unit`)} placeholder="g" /></Field>
              <div className="flex gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Move ingredient up" onClick={() => move(ingredients, index, -1, ingredients.fields.length)}><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" aria-label="Move ingredient down" onClick={() => move(ingredients, index, 1, ingredients.fields.length)}><ArrowDown /></Button><Button type="button" size="icon" variant="destructive" aria-label="Remove ingredient" disabled={ingredients.fields.length === 1} onClick={() => ingredients.remove(index)}><Trash2 /></Button></div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => ingredients.append({ name: "", quantity: 1, unit: "g" })}><Plus /> Add ingredient</Button>
        </CardContent>
      </Card>

      <Card id="instructions" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>4. Cooking instructions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {instructions.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 rounded-2xl border border-border p-3">
              <span className="mt-2 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
              <Textarea aria-label={`Instruction ${index + 1}`} rows={2} {...form.register(`steps.${index}.value`)} />
              <div className="flex flex-col gap-1"><Button type="button" size="icon-sm" variant="ghost" onClick={() => move(instructions, index, -1, instructions.fields.length)}><ArrowUp /></Button><Button type="button" size="icon-sm" variant="ghost" onClick={() => move(instructions, index, 1, instructions.fields.length)}><ArrowDown /></Button><Button type="button" size="icon-sm" variant="destructive" disabled={instructions.fields.length === 1} onClick={() => instructions.remove(index)}><Trash2 /></Button></div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => instructions.append({ value: "" })}><Plus /> Add instruction</Button>
        </CardContent>
      </Card>

      <Card id="cooking-intelligence" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>5. Curated Cooking Intelligence</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Optional curated cues take priority. Conservative deterministic temperature and doneness validation still applies.</p>
          {intelligence.fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between"><p className="font-bold">Structured step {index + 1}</p><Button type="button" size="sm" variant="destructive" onClick={() => intelligence.remove(index)}><Trash2 /> Remove</Button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title"><Input {...form.register(`cooking_steps.${index}.title`)} /></Field>
                <Field label="Duration (minutes)"><Input type="number" min={0} {...form.register(`cooking_steps.${index}.duration`)} /></Field>
                <div className="sm:col-span-2"><Field label="Instruction"><Textarea {...form.register(`cooking_steps.${index}.instruction`)} /></Field></div>
                <Field label="Heat level"><Input {...form.register(`cooking_steps.${index}.heat_level`)} placeholder="LOW / MEDIUM / HIGH" /></Field>
                <div className="grid grid-cols-2 gap-2"><Field label="Min °C"><Input type="number" min={0} {...form.register(`cooking_steps.${index}.temperature_min`)} /></Field><Field label="Max °C"><Input type="number" min={0} {...form.register(`cooking_steps.${index}.temperature_max`)} /></Field></div>
                <Field label="Visual cue"><Input {...form.register(`cooking_steps.${index}.visual_cue`)} /></Field>
                <Field label="Colour cue"><Input {...form.register(`cooking_steps.${index}.colour_stage`)} /></Field>
                <Field label="Texture cue"><Input {...form.register(`cooking_steps.${index}.texture_cue`)} /></Field>
                <Field label="Aroma cue"><Input {...form.register(`cooking_steps.${index}.aroma_cue`)} /></Field>
                <Field label="Purpose"><Input {...form.register(`cooking_steps.${index}.purpose`)} /></Field>
                <Field label="Ingredient references" hint="Comma-separated names from this recipe"><Input {...form.register(`cooking_steps.${index}.ingredient_names`)} placeholder="Chicken, Onion" /></Field>
                <Field label="Safety warnings" hint="One per line"><Textarea {...form.register(`cooking_steps.${index}.warnings`)} /></Field>
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register(`cooking_steps.${index}.critical`)} /> Critical cooking stage</label>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => intelligence.append(emptyCookingStep())}><Plus /> Add curated step</Button>
        </CardContent>
      </Card>

      <Card id="publishing" className="admin-card scroll-mt-24 shadow-none">
        <CardHeader><CardTitle>6. Media and publishing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Unsplash image URL" hint="Only the deployment-configured images.unsplash.com host is accepted." error={form.formState.errors.image?.message}><Input {...form.register("image")} /></Field>
          <Field label="Publication status"><select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" {...form.register("publication_status")}><option value="draft">Draft</option><option value="published">Published</option><option value="inactive">Inactive</option></select></Field>
          {image && <div className="h-48 rounded-2xl bg-cover bg-center sm:col-span-2" role="img" aria-label="Recipe image preview" style={{ backgroundImage: `url(${image})` }} />}
        </CardContent>
      </Card>

      {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
      </div>

      <aside className="admin-card sticky bottom-3 z-20 p-3 xl:top-24 xl:bottom-auto xl:p-5">
        <div className="hidden xl:block">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--admin-subtle-foreground)]">Recipe summary</p>
        <div className="mt-4 rounded-xl bg-[var(--admin-surface-soft)] p-4">
          <p className="text-sm font-semibold capitalize">{publicationStatus}</p>
          <p className="mt-1 text-xs text-[var(--admin-muted-foreground)]">Current publication state</p>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-[var(--admin-border)] p-2"><dt className="text-lg font-bold">{ingredients.fields.length}</dt><dd className="text-[10px] text-[var(--admin-muted-foreground)]">Ingredients</dd></div>
          <div className="rounded-xl border border-[var(--admin-border)] p-2"><dt className="text-lg font-bold">{instructions.fields.length}</dt><dd className="text-[10px] text-[var(--admin-muted-foreground)]">Instructions</dd></div>
          <div className="rounded-xl border border-[var(--admin-border)] p-2"><dt className="text-lg font-bold">{intelligence.fields.length}</dt><dd className="text-[10px] text-[var(--admin-muted-foreground)]">AI steps</dd></div>
        </dl>
        <nav aria-label="Recipe editor sections" className="mt-5 space-y-1 border-y border-[var(--admin-border)] py-4 text-sm">
          {[["general", "General"], ["classification", "Classification"], ["ingredients", "Ingredients"], ["instructions", "Instructions"], ["cooking-intelligence", "Cooking Intelligence"], ["publishing", "Publishing"]].map(([href, label]) => <a key={href} href={`#${href}`} className="block rounded-lg px-3 py-2 text-[var(--admin-muted-foreground)] hover:bg-[var(--admin-surface-soft)] hover:text-[var(--admin-foreground)]">{label}</a>)}
        </nav>
        </div>
        <div className="flex justify-end gap-2 xl:mt-5 xl:block xl:space-y-2"><Button type="submit" className="min-h-11 rounded-xl xl:w-full" disabled={pending}><Save /> {pending ? "Saving…" : recipe ? "Save recipe" : "Create recipe"}</Button><Button asChild type="button" variant="ghost" className="hidden w-full rounded-xl xl:flex"><Link href="/admin/recipes">Cancel</Link></Button></div>
      </aside>
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
