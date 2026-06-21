export type PublishFileDescriptor = {
  path: string;
  size: number;
  contentType: string;
  hash?: string;
};

export type PublishRequest = {
  wishId: string;
  kind: "hosted" | "inline_html" | "url";
  files?: PublishFileDescriptor[];
  inlineHtml?: string;
  externalUrl?: string;
  viewer?: {
    title: string;
    description?: string;
    ogImagePath?: string;
  };
  spaMode?: boolean;
};

export type PresignedUpload = {
  path: string;
  method: "PUT";
  url: string;
  headers: Record<string, string>;
};

export type PublishInitResponse = {
  deliverableId: string;
  slug: string;
  siteUrl: string;
  upload?: {
    versionId: string;
    uploads: PresignedUpload[];
    skipped: string[];
    finalizeUrl: string;
    expiresInSeconds: number;
  };
};

export type SlugMeta = {
  currentVersionId: string;
  spaMode: boolean;
  updatedAt: string;
};

export type FinalizeResult = {
  success: boolean;
  siteUrl: string;
  revisionNumber: number;
  alreadyFinalized?: boolean;
};