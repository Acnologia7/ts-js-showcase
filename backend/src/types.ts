export type FilesType = {
  path: string;
  originalName: string;
  size: number;
  mimeType: string;
  alertId: number;
}[];

export type AlertType = {
  files: {
    id: number;
    createdAt: Date;
    path: string;
    originalName: string;
    size: number;
    mimeType: string;
    alertId: number;
  }[];
} & {
  id: number;
  sender: string;
  age: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: number;
};

export type AlertsType = ({
  files: {
    id: number;
    createdAt: Date;
    path: string;
    originalName: string;
    size: number;
    mimeType: string;
    alertId: number;
  }[];
} & {
  userId: number;
  id: number;
  sender: string;
  age: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
})[];

export type CreateAlertRequestBody = {
  sender: string;
  age: string;
  description: string;
};

export type UpdateAlertRequestBody = {
  sender?: string;
  age?: string;
  description?: string;
  deleteFileIds?: string;
};
