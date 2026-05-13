import { proxyApi } from "./proxy-edge";

export const config = { runtime: "edge" as const };

export default proxyApi;
