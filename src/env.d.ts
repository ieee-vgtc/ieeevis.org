/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: import("./lib/auth0").AuthenticatedUser;
  }
}
