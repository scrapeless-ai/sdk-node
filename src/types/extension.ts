export interface UploadExtensionResponse {
  extensionId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtensionListItem {
  extensionId: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtensionDetail {
  extensionId: string;
  teamId: string;
  manifestName: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrowserExtension {
  upload: (filePath: string, name: string) => Promise<UploadExtensionResponse>;
  update: (extensionId: string, filePath: string, name?: string) => Promise<{ success: boolean }>;
  get: (extensionId: string) => Promise<ExtensionDetail>;
  list: () => Promise<ExtensionListItem[]>;
  delete: (extensionId: string) => Promise<{ success: boolean }>;
}
