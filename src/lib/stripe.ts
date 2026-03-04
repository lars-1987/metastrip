import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export type BatchPassType = "image" | "document";

export interface BatchProduct {
  passType: BatchPassType;
  name: string;
  description: string;
  priceInCents: number;
  maxFiles: number;
  maxFileSizeMB: number;
  allowedCategory: "image" | "document";
}

export const BATCH_PRODUCTS: Record<BatchPassType, BatchProduct> = {
  image: {
    passType: "image",
    name: "Image Batch Pass",
    description:
      "Strip metadata from up to 50 images with selective stripping options and audit report",
    priceInCents: 299,
    maxFiles: 50,
    maxFileSizeMB: 50,
    allowedCategory: "image",
  },
  document: {
    passType: "document",
    name: "Document Batch Pass",
    description:
      "Strip metadata from up to 25 documents with selective stripping options and audit report",
    priceInCents: 499,
    maxFiles: 25,
    maxFileSizeMB: 50,
    allowedCategory: "document",
  },
};
