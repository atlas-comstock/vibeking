export type HereNowFileDescriptor = {
  path: string;
  size: number;
  contentType: string;
  hash?: string;
};

export type HereNowPublishRequest = {
  files: HereNowFileDescriptor[];
  viewer?: {
    title?: string;
    description?: string;
    ogImagePath?: string;
  };
  spaMode?: boolean;
  ttlSeconds?: number | null;
};

export type HereNowUploadEntry = {
  path: string;
  method: "PUT";
  url: string;
  headers: Record<string, string>;
};

export type HereNowPublishResponse = {
  slug: string;
  siteUrl: string;
  upload: {
    versionId: string;
    uploads: HereNowUploadEntry[];
    skipped: string[];
    finalizeUrl: string;
    expiresInSeconds: number;
  };
  claimUrl?: string;
  claimToken?: string;
  anonymous?: boolean;
};

export type HereNowFinalizeResponse = {
  success: boolean;
  slug: string;
  siteUrl: string;
  currentVersionId: string;
};