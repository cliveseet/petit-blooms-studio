import petalsPromises from "@/assets/product-petals-promises.jpg";
import petitSignature from "@/assets/product-petit-signature.jpg";
import loneBloom from "@/assets/product-lone-bloom.jpg";
import heliosBloom from "@/assets/product-helios-bloom.jpg";
import bloomBasket from "@/assets/product-bloom-basket.jpg";
import timelessLove from "@/assets/product-timeless-love.jpg";
import springsWhisper from "@/assets/product-springs-whisper.jpg";
import petalSymphony from "@/assets/product-petal-symphony.jpg";
import eternalLove from "@/assets/product-eternal-love.jpg";
import flowerBag from "@/assets/product-flower-bag.jpg";
import bear from "@/assets/product-bear.jpg";
import wrapping from "@/assets/product-wrapping.jpg";

export type Category = "fresh" | "preserved" | "accessories";
export type Occasion =
  | "celebration"
  | "birthday"
  | "get-well"
  | "romance"
  | "sympathy"
  | "everyday";

export type OptionChoice = {
  value: string;
  label: string;
  priceDelta?: number; // additive on top of base
  setsPriceTo?: number; // overrides absolute price (per stalk-style menus)
  swatch?: string; // solid colour or CSS gradient for colour/scheme choices
};

export type OptionGroup = {
  id: string;
  label: string;
  required?: boolean;
  choices: OptionChoice[];
};

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: Category;
  occasions: Occasion[];
  basePrice: number; // in SGD
  fromPrice: boolean; // show "from"
  image: string;
  shortDescription: string;
  description: string;
  options: OptionGroup[];
  addOns?: string[]; // slugs
  defaultPersonalisationPrompt?: string;
  sortOrder?: number;
  archived?: boolean;
  deletedAt?: string | null;
  source?: "local" | "database";
};

export const products: Product[] = [
  {
    slug: "petals-and-promises",
    name: "Petals and Promises (Wedding Edition)",
    category: "fresh",
    occasions: ["romance", "celebration"],
    basePrice: 50,
    fromPrice: true,
    image: petalsPromises,
    shortDescription: "A soft, romantic bridal bouquet — blush, ivory and muted greens.",
    description:
      "Crafted for the most unforgettable walk down the aisle, this hand-tied bridal bouquet is a soft, elegant composition of fresh seasonal blooms. Featuring a romantic palette of blush, ivory and muted greens, it is designed to complement any gown with grace and timeless beauty. Each bouquet is made to order, ensuring your florals are as unique as your love story. Perfect for brides seeking a classic, refined look with a modern touch. Satin ribbon wrap included; customisation available upon request.",
    options: [
      {
        id: "booking",
        label: "Booking type",
        required: true,
        choices: [
          { value: "deposit", label: "Deposit (advance bookings)", setsPriceTo: 50 },
          { value: "full", label: "Full payment (within the year)", setsPriceTo: 180 },
        ],
      },
    ],
  },
  {
    slug: "the-petit-signature",
    name: "The Petit Signature",
    category: "fresh",
    occasions: ["celebration", "birthday", "get-well", "everyday"],
    basePrice: 45,
    fromPrice: true,
    image: petitSignature,
    shortDescription: "Our signature bouquet, tailored to your colour scheme and story.",
    description:
      "Bring your vision to life with ease. Share your preferred colour scheme, and let us craft a one-of-a-kind masterpiece tailored to your special someone. Trust us to create a breathtaking bouquet that speaks from the heart and leaves a lasting impression.",
    options: [
      {
        id: "size",
        label: "Size",
        required: true,
        choices: [
          { value: "petite", label: "Petite", setsPriceTo: 45 },
          { value: "medium", label: "Medium", setsPriceTo: 65 },
          { value: "large", label: "Large", setsPriceTo: 95 },
          { value: "xl", label: "Extra Large", setsPriceTo: 130 },
        ],
      },
      {
        id: "scheme",
        label: "Colour scheme",
        required: true,
        choices: [
          { value: "whispers", label: "Whispers of pink (pinks, whites, blush)" },
          { value: "pastel", label: "Pastel dreamscape (pinks, blues, purples, whites)" },
          { value: "rich", label: "Rich medley (blues, reds, dark purples, yellows)" },
        ],
      },
      {
        id: "flower-request",
        label: "Flower requests",
        choices: [
          { value: "none", label: "None" },
          { value: "peonies", label: "Peonies", priceDelta: 10 },
          { value: "hydrangea", label: "Hydrangea", priceDelta: 8 },
          { value: "calla", label: "Calla lilies", priceDelta: 8 },
        ],
      },
    ],
    addOns: ["flower-bag", "bouquet-companion", "wrapping-catalogue"],
  },
  {
    slug: "lone-bloom",
    name: "Lone Bloom (Single Rose)",
    category: "fresh",
    occasions: ["romance", "celebration", "everyday"],
    basePrice: 20,
    fromPrice: false,
    image: loneBloom,
    shortDescription: "A timeless single-stalk rose for a quiet, elegant gesture.",
    description:
      "Planning a small surprise or celebrating a special moment? Our timeless single-stalk rose bouquet is the perfect touch of elegance.",
    options: [
      {
        id: "colour",
        label: "Colour",
        required: true,
        choices: [
          { value: "pink", label: "Soft pink", setsPriceTo: 20 },
          { value: "red", label: "Classic red", setsPriceTo: 20 },
        ],
      },
    ],
  },
  {
    slug: "timeless-love",
    name: "Timeless Love (Roses)",
    category: "fresh",
    occasions: ["romance", "celebration", "birthday"],
    basePrice: 38,
    fromPrice: true,
    image: timelessLove,
    shortDescription: "A classic rose bouquet — love, honour, faith and beauty.",
    description:
      "Roses embody love, honour, faith, beauty and passion, making them a timeless choice for any bouquet. Elegant and versatile, they bring a touch of sophistication to every occasion. For custom arrangements or a specific number of roses, feel free to contact us.",
    options: [
      {
        id: "stalks",
        label: "Stalks",
        required: true,
        choices: [
          { value: "3", label: "3 stalks", setsPriceTo: 38 },
          { value: "6", label: "6 stalks", setsPriceTo: 70 },
          { value: "10", label: "10 stalks", setsPriceTo: 95 },
        ],
      },
      {
        id: "colour",
        label: "Colour",
        required: true,
        choices: [
          { value: "pink", label: "Soft pink" },
          { value: "red", label: "Classic red" },
          { value: "cappuccino", label: "Elegant cappuccino" },
          { value: "white", label: "White" },
        ],
      },
    ],
  },
  {
    slug: "helios-bloom",
    name: "Helio's Bloom (Sunflower)",
    category: "fresh",
    occasions: ["birthday", "celebration", "get-well"],
    basePrice: 30,
    fromPrice: true,
    image: heliosBloom,
    shortDescription: "Sunflowers for happiness and warm wishes.",
    description:
      "Sunflowers symbolise happiness and warm wishes, carrying cheer through their golden petals. This bold bloom brings warmth to any gesture. Do note that filler flowers may change, depending on the design.",
    options: [
      {
        id: "stalks",
        label: "Stalks",
        required: true,
        choices: [
          { value: "1", label: "1 stalk", setsPriceTo: 30 },
          { value: "2", label: "2 stalks", setsPriceTo: 40 },
          { value: "3", label: "3 stalks", setsPriceTo: 50 },
        ],
      },
      {
        id: "filler",
        label: "Filler",
        choices: [{ value: "mixed", label: "Mixed filler flowers" }],
      },
    ],
  },
  {
    slug: "petal-symphony",
    name: "Petal Symphony (Hydrangea)",
    category: "fresh",
    occasions: ["celebration", "birthday", "everyday"],
    basePrice: 58,
    fromPrice: true,
    image: petalSymphony,
    shortDescription: "Lush hydrangeas with our signature filler — abundance and emotion.",
    description:
      "Set among our signature mixed filler flowers, hydrangeas symbolise abundance and heartfelt emotion. This generous bloom brings softness, volume and quiet elegance to any bouquet.",
    options: [
      {
        id: "stalks",
        label: "Stalks",
        required: true,
        choices: [
          { value: "1", label: "1 stalk", setsPriceTo: 58 },
          { value: "3", label: "3 stalks", setsPriceTo: 98 },
          { value: "4", label: "4 stalks", setsPriceTo: 128 },
        ],
      },
      {
        id: "colour",
        label: "Colour",
        required: true,
        choices: [
          { value: "dark-blue", label: "Dark blue" },
          { value: "mixed-blues", label: "Mixed blues" },
          { value: "mixed-pinks", label: "Mixed pinks" },
          { value: "pastels", label: "Mixed pastels" },
          { value: "dark", label: "Mixed dark" },
        ],
      },
    ],
  },
  {
    slug: "springs-whisper",
    name: "Spring's Whisper (Tulips)",
    category: "fresh",
    occasions: ["romance", "birthday", "celebration", "get-well"],
    basePrice: 40,
    fromPrice: true,
    image: springsWhisper,
    shortDescription: "Tulips — perfect love, renewal and new beginnings.",
    description:
      "Tulips, symbolising perfect love, are often linked to the arrival of spring, carrying a message of renewal and new beginnings. These graceful blooms bring movement and colour to our Spring's Whisper bouquet. Do note that filler flowers may change, depending on the design.",
    options: [
      {
        id: "stalks",
        label: "Stalks",
        required: true,
        choices: [
          { value: "3", label: "3 stalks", setsPriceTo: 40 },
          { value: "5", label: "5 stalks", setsPriceTo: 55 },
          { value: "10", label: "10 stalks", setsPriceTo: 95 },
        ],
      },
      {
        id: "colour",
        label: "Colour",
        required: true,
        choices: [
          { value: "soft", label: "Soft radiance (pinks, whites)" },
          { value: "rich", label: "Rich tones (reds, purples)" },
        ],
      },
    ],
  },
  {
    slug: "carry-my-love",
    name: "Carry My Love With You (Bloom Basket)",
    category: "fresh",
    occasions: ["birthday", "celebration", "get-well", "everyday"],
    basePrice: 70,
    fromPrice: true,
    image: bloomBasket,
    shortDescription: "A reusable basket overflowing with our signature mix.",
    description:
      "Carry My Love With You showcases a stunning mix of our signature flowers in a reusable basket — a sustainable, heartfelt keepsake for any celebration. Note that both sides of the basket contain blooms.",
    options: [
      {
        id: "scheme",
        label: "Colour scheme",
        required: true,
        choices: [
          { value: "classics", label: "Timeless classics (reds)", setsPriceTo: 70 },
          {
            value: "pastels",
            label: "Soft pastels (pinks, blues, purples, whites)",
            setsPriceTo: 75,
          },
          { value: "helios", label: "Helio's basket (sunflowers)", setsPriceTo: 70 },
        ],
      },
    ],
  },
  {
    slug: "eternal-love",
    name: "Eternal Love (Preserved Flowers)",
    category: "preserved",
    occasions: ["romance", "celebration", "sympathy"],
    basePrice: 45,
    fromPrice: false,
    image: eternalLove,
    shortDescription: "A long-lasting preserved bouquet — a timeless keepsake.",
    description:
      "A timeless way to capture nature's beauty, offering a long-lasting alternative to fresh flowers. Arranged with care, these bouquets retain their rich colours and delicate textures — a perfect keepsake or thoughtful gift for any occasion.",
    options: [
      {
        id: "scheme",
        label: "Colour scheme",
        required: true,
        choices: [
          { value: "pastels", label: "Soft pastels (pinks, blues, purples, whites)" },
          { value: "classics", label: "Timeless classics (reds)" },
        ],
      },
    ],
  },
  {
    slug: "flower-bag",
    name: "Flower Bag",
    category: "accessories",
    occasions: [],
    basePrice: 2,
    fromPrice: false,
    image: flowerBag,
    shortDescription: "Extra protection for your blooms on the move.",
    description:
      "Planning to stroll around before or after presenting your flowers? Or need to bring your bouquet along during your commute? Our flower bag is the perfect solution — providing extra protection for your blooms and giving you peace of mind while you are on the move.",
    options: [],
  },
  {
    slug: "bouquet-companion",
    name: "Bouquet Companion (Bear)",
    category: "accessories",
    occasions: [],
    basePrice: 5,
    fromPrice: false,
    image: bear,
    shortDescription: "A soft companion to add to your bouquet.",
    description:
      "Looking for a soft friend? Add this cute bear to your bouquet. 5% discount for IG followers — follow @petit.blooms and drop us a DM.",
    options: [
      {
        id: "colour",
        label: "Colour",
        required: true,
        choices: [
          { value: "white-grad", label: "White graduation bear" },
          { value: "brown-grad", label: "Brown graduation bear" },
          { value: "white", label: "White bear" },
          { value: "brown", label: "Brown bear" },
        ],
      },
    ],
  },
  {
    slug: "wrapping-catalogue",
    name: "Wrapping Catalogue",
    category: "accessories",
    occasions: [],
    basePrice: 0,
    fromPrice: false,
    image: wrapping,
    shortDescription: "Browse available wrapping colours — choose at checkout.",
    description:
      "Refer to this page for the available wrapping colours. To ensure a smooth checkout, avoid adding items to your cart from this page — instead, specify your preferred wrapping colour in the pop-up while selecting your bouquet.",
    options: [
      {
        id: "colour",
        label: "Available colours",
        choices: [
          { value: "emerald", label: "Emerald green (Petit Signature)" },
          { value: "pink", label: "Pink" },
          { value: "purple", label: "Purple" },
          { value: "green", label: "Green" },
          { value: "khaki", label: "Khaki" },
          { value: "blue", label: "Blue" },
          { value: "silver-white", label: "Silver-white dual-tone" },
          { value: "black", label: "Black" },
          { value: "white", label: "White" },
          { value: "newspaper", label: "Newspaper print" },
        ],
      },
    ],
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

export const occasionLabels: Record<Occasion, string> = {
  romance: "Romance",
  birthday: "Birthday",
  celebration: "Celebration",
  everyday: "Everyday",
  "get-well": "Get Well Soon",
  sympathy: "Sympathy",
};

export const categoryLabels: Record<Category, string> = {
  fresh: "Fresh Bouquets",
  preserved: "Preserved Bouquets",
  accessories: "Accessories",
};

export function computePrice(product: Product, selections: Record<string, string>): number {
  let absolute: number | null = null;
  let delta = 0;
  for (const group of product.options) {
    const val = selections[group.id];
    if (!val) continue;
    const choice = group.choices.find((c) => c.value === val);
    if (!choice) continue;
    if (typeof choice.setsPriceTo === "number") absolute = choice.setsPriceTo;
    if (typeof choice.priceDelta === "number") delta += choice.priceDelta;
  }
  return (absolute ?? product.basePrice) + delta;
}
