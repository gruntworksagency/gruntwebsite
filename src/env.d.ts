/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    } | null;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
    } | null;
  }
}
