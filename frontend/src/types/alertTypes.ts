export type Alert = {
    id: number;
    sender: string;
    age: number;
    description: string;
    files: Array<{ 
        id: number;
        path: string;
        originalName: string;
        filename: string;
        size: number;
        mimeType: string;
        alertId: number;
    }>;
};
  
export type CreateAlertData = {
    sender: string;
    age: number;
    description: string;
    files: File[];
};
  
export type UpdateAlertData = {
    sender?: string;
    age?: number;
    description?: string;
    files?: File[];
    deleteFileIds?: number[];
};

export type AlertFile = {
    id: number;
    path: string;
    originalName: string;
    filename: string;
    size: number;
    mimeType: string;
    alertId: number;
  };
