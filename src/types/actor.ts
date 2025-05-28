/**
 * Actor run options
 */
export interface ActorRunOptions {
  CPU?: number;
  memory?: number;
  timeout?: number;
  version?: string;
}

/**
 * Actor creation data
 */
export interface ActorCreateRequest {
  description?: string;
  gitRepo: string;
  isPublic?: boolean;
  name: string;
  defaultRunOptions?: ActorRunOptions;
  title: string;
  version: string;
}

/**
 * Actor run data
 */
export interface ActorRunRequest<T = any> {
  input: T;
  runOptions?: ActorRunOptions;
}

/**
 * Actor run result
 */
export interface ActorRunResult<T = any> {
  actorId: string;
  finishedAt: Date;
  input: T;
  runId: string;
  runOptions: ActorRunOptions;
  startedAt: Date;
  stats: {
    CPU: number;
    memory: number;
    timeout: number;
    version: string;
  };
  status: string;
  teamId: string;
  userId: string;
}

/**
 * Actor update data
 */
export type ActorUpdateRequest = Partial<ActorCreateRequest>;

/**
 * Actor build response
 */
export interface ActorBuildResponse {
  buildId: string;
  finishedAt: string;
  logs: string[];
  message: string;
  startedAt: string;
  status: string;
}

export interface IActorRunOptions {
  CPU?: number;
  memory?: number;
  timeout?: number;
  version?: string;
}

export interface IRunActorData<T> {
  input: T;
  runOptions: IActorRunOptions;
}
