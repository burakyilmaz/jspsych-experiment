// src/custom.d.ts
declare module "*.scss";
declare module "*.css";
declare module "*.json" {
  const value: any;
  export default value;
}