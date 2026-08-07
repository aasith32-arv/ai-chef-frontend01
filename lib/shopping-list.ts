export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  dish?: string;
  checked: boolean;
  addedAt: number;
};

const STORAGE_KEY = "ai-chef:shopping-list";

let cachedRaw: string | null = null;
let cachedItems: ShoppingListItem[] = [];

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseItems(raw: string): ShoppingListItem[] {
  try {
    const parsed = JSON.parse(raw) as ShoppingListItem[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}

function getSnapshot(): ShoppingListItem[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  cachedItems = parseItems(raw);
  return cachedItems;
}

function write(items: ShoppingListItem[]) {
  const raw = JSON.stringify(items);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedItems = [...items].sort((a, b) => b.addedAt - a.addedAt);
  window.dispatchEvent(new Event("ai-chef:shopping-list"));
}

export function getShoppingList(): ShoppingListItem[] {
  return getSnapshot();
}

export function subscribeShoppingList(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("ai-chef:shopping-list", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ai-chef:shopping-list", handler);
  };
}

export function addShoppingItems(
  items: Array<{ name: string; quantity: string; unit?: string; dish?: string }>
) {
  const existing = getSnapshot();
  const stamp = Date.now();
  const merged = [
    ...items.map((item, index) => ({
      id: `${stamp}-${index}-${item.name}`,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      dish: item.dish,
      checked: false,
      addedAt: stamp - index,
    })),
    ...existing,
  ];
  write(merged);
  return merged.length;
}

export function toggleShoppingItem(id: string) {
  write(
    getSnapshot().map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
  );
}

export function removeShoppingItem(id: string) {
  write(getSnapshot().filter((item) => item.id !== id));
}

export function clearCheckedShoppingItems() {
  write(getSnapshot().filter((item) => !item.checked));
}

export function clearShoppingList() {
  write([]);
}
