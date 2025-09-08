-- CreateTable
CREATE TABLE "public"."ConfigCarousel" (
    "id" TEXT NOT NULL,
    "slides" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KidsGiftBox" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "priceInINR" DECIMAL(10,2) NOT NULL,
    "image" TEXT NOT NULL,
    "badge" VARCHAR(50),
    "rating" DECIMAL(2,1) NOT NULL,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "isWishlisted" BOOLEAN NOT NULL DEFAULT false,
    "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" VARCHAR(2) NOT NULL DEFAULT 'GB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidsGiftBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsGiftBox_category_idx" ON "public"."KidsGiftBox"("category");

-- CreateIndex
CREATE INDEX "KidsGiftBox_createdAt_idx" ON "public"."KidsGiftBox"("createdAt");
