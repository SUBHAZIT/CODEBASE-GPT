export interface RepoMeta {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  language: string;
  fileCount: number;
  framework: string;
  complexity: "Low" | "Medium" | "High" | "Enterprise";
}

export interface OverviewData {
  narrative: string;
  framework: string;
  complexity: "Low" | "Medium" | "High" | "Enterprise";
  suggestedQs: string[];
  keyFiles: string[];
  keyPatterns: string[];
  mainDeps: string[];
  languages: { name: string; percentage: number }[];
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  language?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface Citation {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
}

export const DEMO_REPOS: RepoMeta[] = [
  {
    id: "nextjs-commerce",
    name: "commerce",
    owner: "vercel",
    description: "Next.js Commerce – An all-in-one starter kit for high-performance e-commerce sites.",
    stars: 10200,
    language: "TypeScript",
    fileCount: 1247,
    framework: "Next.js 14",
    complexity: "High",
  },
  {
    id: "supabase",
    name: "supabase",
    owner: "supabase",
    description: "The open source Firebase alternative. Supabase gives you a dedicated Postgres database.",
    stars: 73400,
    language: "TypeScript",
    fileCount: 2134,
    framework: "Next.js + Go",
    complexity: "Enterprise",
  },
  {
    id: "fastapi",
    name: "fastapi",
    owner: "tiangolo",
    description: "FastAPI framework, high performance, easy to learn, fast to code, ready for production.",
    stars: 78900,
    language: "Python",
    fileCount: 812,
    framework: "FastAPI",
    complexity: "Medium",
  },
];

export const DEMO_OVERVIEW: OverviewData = {
  narrative:
    "This is a Next.js 14 e-commerce application using the App Router. It integrates with Shopify's Storefront API for product management and checkout. Authentication is handled via Next.js middleware with cookie-based sessions. The cart system uses React Server Components for real-time updates. Styling uses Tailwind CSS with a custom design system. Key modules: product catalog, cart management, checkout flow, and search with filtering.",
  framework: "Next.js 14",
  complexity: "High",
  suggestedQs: [
    "How does the shopping cart work?",
    "Where is the checkout flow implemented?",
    "How does product search work?",
    "What authentication method is used?",
    "How are server components used in this project?",
    "Where is the Shopify API integration?",
    "How does the image optimization pipeline work?",
    "What happens when a user adds an item to cart?",
  ],
  keyFiles: [
    "app/layout.tsx",
    "lib/shopify/index.ts",
    "components/cart/actions.ts",
    "app/search/page.tsx",
    "middleware.ts",
  ],
  keyPatterns: [
    "React Server Components for data fetching",
    "Server Actions for mutations (cart, checkout)",
    "Middleware-based auth with cookie sessions",
    "Edge runtime for API routes",
  ],
  mainDeps: [
    "next@14.2.0",
    "@shopify/hydrogen-react",
    "tailwindcss",
    "clsx",
    "react-hot-toast",
    "plaiceholder",
    "sharp",
    "geist",
  ],
  languages: [
    { name: "TypeScript", percentage: 78 },
    { name: "CSS", percentage: 12 },
    { name: "JavaScript", percentage: 6 },
    { name: "MDX", percentage: 4 },
  ],
};

export const DEMO_FILE_TREE: FileTreeNode[] = [
  {
    name: "app",
    path: "app",
    type: "folder",
    children: [
      { name: "layout.tsx", path: "app/layout.tsx", type: "file", language: "typescript" },
      { name: "page.tsx", path: "app/page.tsx", type: "file", language: "typescript" },
      {
        name: "search",
        path: "app/search",
        type: "folder",
        children: [
          { name: "page.tsx", path: "app/search/page.tsx", type: "file", language: "typescript" },
          { name: "loading.tsx", path: "app/search/loading.tsx", type: "file", language: "typescript" },
        ],
      },
      {
        name: "product",
        path: "app/product",
        type: "folder",
        children: [
          { name: "[handle]/page.tsx", path: "app/product/[handle]/page.tsx", type: "file", language: "typescript" },
        ],
      },
    ],
  },
  {
    name: "components",
    path: "components",
    type: "folder",
    children: [
      {
        name: "cart",
        path: "components/cart",
        type: "folder",
        children: [
          { name: "actions.ts", path: "components/cart/actions.ts", type: "file", language: "typescript" },
          { name: "cart-modal.tsx", path: "components/cart/cart-modal.tsx", type: "file", language: "typescript" },
          { name: "add-to-cart.tsx", path: "components/cart/add-to-cart.tsx", type: "file", language: "typescript" },
        ],
      },
      {
        name: "product",
        path: "components/product",
        type: "folder",
        children: [
          { name: "gallery.tsx", path: "components/product/gallery.tsx", type: "file", language: "typescript" },
          { name: "product-description.tsx", path: "components/product/product-description.tsx", type: "file", language: "typescript" },
        ],
      },
    ],
  },
  {
    name: "lib",
    path: "lib",
    type: "folder",
    children: [
      {
        name: "shopify",
        path: "lib/shopify",
        type: "folder",
        children: [
          { name: "index.ts", path: "lib/shopify/index.ts", type: "file", language: "typescript" },
          { name: "types.ts", path: "lib/shopify/types.ts", type: "file", language: "typescript" },
          { name: "queries.ts", path: "lib/shopify/queries.ts", type: "file", language: "typescript" },
        ],
      },
    ],
  },
  { name: "middleware.ts", path: "middleware.ts", type: "file", language: "typescript" },
  { name: "next.config.js", path: "next.config.js", type: "file", language: "javascript" },
  { name: "tailwind.config.ts", path: "tailwind.config.ts", type: "file", language: "typescript" },
];

export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "How does the shopping cart work?",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content: `The shopping cart in this Next.js Commerce app uses **Server Actions** for all mutations and **React Server Components** for rendering.

Here's how it works:

1. **Cart State** is stored as a Shopify cart object, with the cart ID saved in a cookie (\`cartId\`).

2. **Adding items** triggers the \`addItem\` Server Action in \`components/cart/actions.ts\`, which calls the Shopify Storefront API's \`cartLinesAdd\` mutation.

3. **Cart display** uses the \`CartModal\` component which fetches cart data server-side via \`getCart()\` from \`lib/shopify/index.ts\`.

\`\`\`typescript
// components/cart/actions.ts
export async function addItem(selectedVariantId: string) {
  const cartId = cookies().get('cartId')?.value;
  
  if (!cartId || !selectedVariantId) {
    return 'Error adding item to cart';
  }

  await addToCart(cartId, [
    { merchandiseId: selectedVariantId, quantity: 1 }
  ]);
  
  revalidateTag(TAGS.cart);
}
\`\`\`

4. After mutation, \`revalidateTag(TAGS.cart)\` triggers a re-render of all components that depend on cart data.`,
    citations: [
      {
        filePath: "components/cart/actions.ts",
        startLine: 12,
        endLine: 28,
        snippet: "export async function addItem(selectedVariantId: string) { ... }",
      },
      {
        filePath: "lib/shopify/index.ts",
        startLine: 89,
        endLine: 112,
        snippet: "export async function addToCart(cartId: string, lines: CartItem[]) { ... }",
      },
      {
        filePath: "components/cart/cart-modal.tsx",
        startLine: 1,
        endLine: 45,
        snippet: "export default function CartModal({ cart }: { cart: Cart }) { ... }",
      },
    ],
    timestamp: new Date(),
  },
];

export const DEMO_FILE_CONTENT = `import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { addToCart, removeFromCart, updateCart } from 'lib/shopify';
import { TAGS } from 'lib/constants';

export async function addItem(selectedVariantId: string) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId || !selectedVariantId) {
    return 'Error adding item to cart';
  }

  try {
    await addToCart(cartId, [
      { merchandiseId: selectedVariantId, quantity: 1 }
    ]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(lineId: string) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    await removeFromCart(cartId, [lineId]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  lineId: string,
  quantity: number
) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    if (quantity === 0) {
      await removeFromCart(cartId, [lineId]);
    } else {
      await updateCart(cartId, [
        { id: lineId, quantity }
      ]);
    }
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error updating item quantity';
  }
}`;
