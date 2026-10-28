// Webhook adapter: interface + stub only. OFF by default.
// Enable by setting VITE_WEBHOOK_URL (and a key) in .env – never commit real values.
export interface ProcessControl { stop(ids: string[]): Promise<void>; restart(ids: string[]): Promise<void>; }
export const webhookEnabled = false;
export const stubControl: ProcessControl = {
  async stop(ids) { console.info("[stub] stop", ids); },
  async restart(ids) { console.info("[stub] restart", ids); },
};
