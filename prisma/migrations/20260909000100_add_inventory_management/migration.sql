ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "stockAlertThreshold" INTEGER NOT NULL DEFAULT 20;

CREATE TABLE IF NOT EXISTS "StockReceipt" (
  "id" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StockReceipt_receiptNumber_key"
ON "StockReceipt"("receiptNumber");

CREATE TABLE IF NOT EXISTS "StockReceiptItem" (
  "id" TEXT NOT NULL,
  "receiptId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "stockBefore" INTEGER NOT NULL,
  "stockAfter" INTEGER NOT NULL,
  CONSTRAINT "StockReceiptItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StockReceiptItem_receiptId_idx"
ON "StockReceiptItem"("receiptId");

CREATE INDEX IF NOT EXISTS "StockReceiptItem_productId_idx"
ON "StockReceiptItem"("productId");

DO $$ BEGIN
  ALTER TABLE "StockReceiptItem"
  ADD CONSTRAINT "StockReceiptItem_receiptId_fkey"
  FOREIGN KEY ("receiptId") REFERENCES "StockReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "StockReceiptItem"
  ADD CONSTRAINT "StockReceiptItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
