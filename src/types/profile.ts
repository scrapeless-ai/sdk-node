export interface IProfileItem {
  profileId: string;
  name: string;
  lastModifyAt: Date;
  count: number;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProfileResponse extends IProfileItem {}

export interface IDeleteProfileResponse {
  success: boolean;
}

export interface IProfilePaginationParams {
  /**
   * Page number (1-based)
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Filter by profile name or profile ID
   */
  name?: string;
}

export interface IProfilePaginationResponse {
  docs: IProfileItem[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
}
