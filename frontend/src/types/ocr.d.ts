export interface OCRResponse {
  success: boolean;
  text?: string;
  amount?: number;
  error?: string;
  receiptData: KaspiReceiptData;
}

export interface KaspiReceiptData {
  amount: number;
  merchant?: string;
  date?: string;
  transactionId?: string;
  receiptNumber?: string;
  verified?: boolean;
}
