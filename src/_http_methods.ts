export const httpMethods = ["DELETE", "GET", "PATCH", "POST", "PUT"] as const;
export type HttpMethod = typeof httpMethods[number];
