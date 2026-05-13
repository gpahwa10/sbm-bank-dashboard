import { proxyApi } from "../web/api/proxy-edge";

export const config = { runtime: "edge" as const };

export default proxyApi;
