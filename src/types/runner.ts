/**
 * Runner interface
 */
export interface Runner {
  id: string;
  name: string;
  description?: string;
  actorId: string;
  config: Record<string, any>;
  env: Record<string, string>;
  memoryMb: number;
  timeoutSecs: number;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
