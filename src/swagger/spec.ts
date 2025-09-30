const spec = {
  openapi: "3.0.3",
  info: {
    title: "Modakk API",
    version: "1.0.0",
    description: "API for managing the singleton config carousel and kids gift boxes."
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/config/carousel": {
      get: {
        summary: "Get carousel config",
        tags: ["config"],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfigCarousel" }
              }
            }
          },
          "404": { description: "Not Found" }
        }
      },
      post: {
        summary: "Create carousel config (only if none exists)",
        tags: ["config"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["slides"],
                properties: {
                  slides: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["image", "title", "description"],
                      properties: {
                        image: { type: "string", format: "uri", example: "https://cdn.site/hero.jpg" },
                        title: { type: "string", example: "Welcome to Modakk Kids" },
                        description: { type: "string", example: "Handpicked boxes that make kids smile." }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfigCarousel" }
              }
            }
          },
          "400": { description: "Bad Request" },
          "409": { description: "Already exists" }
        }
      },
      put: {
        summary: "Create or replace carousel config",
        tags: ["config"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["slides"],
                properties: {
                  slides: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["image", "title", "description"],
                      properties: {
                        image: { type: "string", format: "uri", example: "https://cdn.site/slide-1.jpg" },
                        title: { type: "string", example: "Slide title" },
                        description: { type: "string", example: "Slide description" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfigCarousel" }
              }
            }
          },
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfigCarousel" }
              }
            }
          },
          "400": { description: "Bad Request" }
        }
      }
    },
    "/config/carousel/import": {
      post: {
        summary: "Import carousel from Excel (max 7 slides)",
        description:
          "Upload an .xlsx (Excel) file with headers: url (or image / image url), title, description. Replaces the singleton carousel.",
        tags: ["config"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Excel file (.xlsx) with required headers"
                  }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ConfigCarousel" } }
            }
          },
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ConfigCarousel" } }
            }
          },
          "400": {
            description:
              "Bad Request (missing headers, invalid rows, or more than 7 slides)"
          }
        }
      }
    },
    "/kidsgiftboxes": {
      get: {
        summary: "List all kids gift boxes",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 1,
              minimum: 1
            },
            description: "Page number for pagination"
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 12,
              minimum: 1,
              maximum: 60
            },
            description: "Number of items per page"
          },
          {
            name: "q",
            in: "query",
            required: false,
            schema: {
              type: "string"
            },
            description: "Search query for filtering by name or description"
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["GB", "TY", "BK", "GM", "CL", "AC"]
            },
            description: "Filter by category (GB=Gift Box, TY=Toy, BK=Book, GM=Game, CL=Clothing, AC=Accessory)"
          },
          {
            name: "sortBy",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["price-asc", "price-desc", "rating-desc", "newest", "featured"],
              default: "featured"
            },
            description: "Sort by criteria (price ascending, price descending, rating descending, newest, or featured)"
          }
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/KidsGiftBoxCard" }
                    },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create a kids gift box",
        tags: ["kidsgiftboxes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateKidsGiftBox" }
            }
          }
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KidsGiftBoxCard" }
              }
            }
          },
          "400": { description: "Bad Request" },
          "500": { description: "Internal Server Error" }
        }
      }
    },
    "/kidsgiftboxes/{id}": {
      get: {
        summary: "Get a kids gift box by id",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^MDK-.*",
              example: "MDK-GB-25A-0001"
            },
            description: "Gift box ID (MDK format)"
          }
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KidsGiftBoxDetail" }
              }
            }
          },
          "404": { description: "Not Found" }
        }
      }
    },
    "/kidsgiftboxes/{id}/images": {
      post: {
        summary: "Append images to a gift box",
        description: "Add new images to the existing gallery. Duplicates are ignored. Maximum 12 total images per gift box.",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^MDK-.*",
              example: "MDK-GB-25A-0001"
            },
            description: "Gift box ID (MDK format)"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ImagesBody" }
            }
          }
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KidsGiftBoxDetail" }
              }
            }
          },
          "400": { description: "Bad Request (e.g., too many images)" },
          "404": { description: "Not Found" }
        }
      },
      put: {
        summary: "Replace all images of a gift box",
        description: "Replace the entire image gallery with a new set of images. Duplicates are removed.",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^MDK-.*",
              example: "MDK-GB-25A-0001"
            },
            description: "Gift box ID (MDK format)"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ImagesBody" }
            }
          }
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KidsGiftBoxDetail" }
              }
            }
          },
          "400": { description: "Bad Request" },
          "404": { description: "Not Found" }
        }
      },
      delete: {
        summary: "Remove specific images by URL",
        description: "Remove specific images from the gallery by providing their URLs.",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^MDK-.*",
              example: "MDK-GB-25A-0001"
            },
            description: "Gift box ID (MDK format)"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ImagesBody" }
            }
          }
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KidsGiftBoxDetail" }
              }
            }
          },
          "400": { description: "Bad Request" },
          "404": { description: "Not Found" }
        }
      }
    },

    "/kidsgiftboxes/bulkimport": {
      post: {
        summary: "Bulk import kids gift boxes from CSV or Excel",
        description: "Upload a CSV or Excel file to bulk import gift boxes. No limit on number of records. Returns detailed results including success/error counts.",
        tags: ["kidsgiftboxes"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "CSV or Excel file (.csv, .xlsx, .xls) with gift box data"
                  }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "All records imported successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BulkImportResult" }
              }
            }
          },
          "207": {
            description: "Partial success - some records imported, some failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BulkImportResult" }
              }
            }
          },
          "400": {
            description: "Bad Request - No file uploaded or invalid file type"
          },
          "500": {
            description: "Internal Server Error"
          }
        }
      }
    },
    "/kidsgiftboxes/bulkimport/template": {
      get: {
        summary: "Download bulk import template",
        description: "Download a sample template file for bulk import with all required fields and example data",
        tags: ["kidsgiftboxes"],
        parameters: [
          {
            name: "format",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["csv", "xlsx"],
              default: "xlsx"
            },
            description: "Template file format"
          }
        ],
        responses: {
          "200": {
            description: "Template file",
            content: {
              "text/csv": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              },
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          }
        }
      }
    },
  },
  components: {
    schemas: {
      ConfigCarousel: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          slides: {
            type: "array",
            items: {
              type: "object",
              required: ["image", "title", "description"],
              properties: {
                image: { type: "string", format: "uri" },
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        example: {
          id: "8e6c1a3a-9dcb-4c2e-bc8c-7d1a2c5e2a11",
          slides: [
            {
              image: "https://cdn.site/hero-1.jpg",
              title: "Welcome to Modakk Kids",
              description: "Handpicked boxes that make kids smile."
            }
          ],
          createdAt: "2025-09-07T16:09:00.000Z",
          updatedAt: "2025-09-07T16:09:00.000Z"
        }
      },
      CreateKidsGiftBox: {
        type: "object",
        required: ["name", "description", "price", "image", "rating"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            example: "Epic Squishmallow Fun",
            description: "Name of the gift box"
          },
          description: {
            type: "string",
            minLength: 1,
            example: "Adorable squishmallow collection with unicorn themes",
            description: "Description of the gift box"
          },
          price: {
            type: "number",
            minimum: 0,
            example: 399.95,
            description: "Price in INR"
          },
          image: {
            type: "string",
            format: "uri",
            example: "https://ik.imagekit.io/modakk/box.jpg",
            description: "Main display image URL"
          },
          badge: {
            type: "string",
            maxLength: 50,
            example: "Best Seller",
            description: "Optional badge text"
          },
          rating: {
            type: "number",
            example: 4.4,
            minimum: 0,
            maximum: 5,
            description: "Rating from 0 to 5"
          },
          reviews: {
            type: "integer",
            example: 124,
            minimum: 0,
            default: 0,
            description: "Number of reviews"
          },
          isWishlisted: {
            type: "boolean",
            example: false,
            default: false,
            description: "Whether the item is wishlisted"
          },
          isSoldOut: {
            type: "boolean",
            example: false,
            default: false,
            description: "Whether the item is sold out"
          },
          images: {
            type: "array",
            items: {
              type: "string",
              format: "uri",
              example: "https://ik.imagekit.io/modakk/box-1.jpg"
            },
            maxItems: 12,
            description: "Optional gallery images for detail pages"
          },
          category: {
            type: "string",
            enum: ["GB", "TY", "BK", "GM", "CL", "AC"],
            default: "GB",
            description: "Product category (GB=Gift Box, TY=Toy, BK=Book, GM=Game, CL=Clothing, AC=Accessory)"
          }
        }
      },
      KidsGiftBoxCard: {
        type: "object",
        properties: {
          id: {
            type: "string",
            pattern: "^MDK-.*",
            example: "MDK-GB-25A-0001",
            description: "Unique identifier in MDK format"
          },
          name: {
            type: "string",
            example: "Epic Squishmallow Fun"
          },
          price: {
            type: "number",
            example: 399.95,
            description: "Price in INR"
          },
          image: {
            type: "string",
            format: "uri",
            example: "https://ik.imagekit.io/modakk/box.jpg"
          },
          badge: {
            type: "string",
            example: "Best Seller",
            nullable: true
          },
          rating: {
            type: "number",
            example: 4.4,
            minimum: 0,
            maximum: 5
          },
          reviews: {
            type: "integer",
            example: 124
          },
          description: {
            type: "string",
            example: "Adorable squishmallow collection with unicorn themes"
          },
          isWishlisted: {
            type: "boolean",
            example: false
          },
          isSoldOut: {
            type: "boolean",
            example: false
          },
          category: {
            type: "string",
            enum: ["GB", "TY", "BK", "GM", "CL", "AC"],
            example: "GB",
            description: "Product category"
          }
        },
        required: ["id", "name", "price", "image", "rating", "reviews", "description", "isWishlisted", "isSoldOut", "category"]
      },
      KidsGiftBoxDetail: {
        type: "object",
        properties: {
          id: {
            type: "string",
            pattern: "^MDK-.*",
            example: "MDK-GB-25A-0001",
            description: "Unique identifier in MDK format"
          },
          name: {
            type: "string",
            example: "Epic Squishmallow Fun"
          },
          description: {
            type: "string",
            example: "Adorable squishmallow collection with unicorn themes"
          },
          priceInINR: {
            type: "number",
            example: 399.95,
            description: "Price in INR (stored as Decimal in DB)"
          },
          image: {
            type: "string",
            format: "uri",
            example: "https://ik.imagekit.io/modakk/box.jpg"
          },
          badge: {
            type: "string",
            example: "Best Seller",
            nullable: true
          },
          rating: {
            type: "number",
            example: 4.4,
            minimum: 0,
            maximum: 5,
            description: "Rating (stored as Decimal in DB)"
          },
          reviews: {
            type: "integer",
            example: 124
          },
          isWishlisted: {
            type: "boolean",
            example: false
          },
          isSoldOut: {
            type: "boolean",
            example: false
          },
          images: {
            type: "array",
            items: {
              type: "string",
              format: "uri",
              example: "https://ik.imagekit.io/modakk/box-1.jpg"
            },
            nullable: true,
            description: "Gallery images for detail view"
          },
          category: {
            type: "string",
            enum: ["GB", "TY", "BK", "GM", "CL", "AC"],
            example: "GB",
            description: "Product category"
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          }
        },
        required: ["id", "name", "description", "priceInINR", "image", "rating", "reviews", "isWishlisted", "isSoldOut", "category", "createdAt", "updatedAt"]
      },
      ImagesBody: {
        type: "object",
        required: ["images"],
        properties: {
          images: {
            type: "array",
            minItems: 1,
            maxItems: 12,
            items: {
              type: "string",
              format: "uri",
              example: "https://ik.imagekit.io/modakk/image.jpg"
            },
            description: "Array of image URLs"
          }
        }
      },
      IDFormats: {
        type: "object",
        description: "Supported ID formats for Modakk products",
        properties: {
          hybrid: {
            type: "string",
            pattern: "^MDK-[A-Z]{2}-\\d{2}[A-L]-\\d{4}$",
            example: "MDK-GB-25A-0001",
            description: "Format: MDK-{category}-{year}{month}-{sequence}"
          },
          alphanumeric: {
            type: "string",
            pattern: "^MDK-[A-Z0-9]{8}$",
            example: "MDK-B08X4N5V",
            description: "Format: MDK-{8 random alphanumeric characters}"
          },
          timestamp: {
            type: "string",
            pattern: "^MDK-\\d{13}-\\d{4}$",
            example: "MDK-1736241234567-8294",
            description: "Format: MDK-{timestamp}-{random}"
          }
        }
      },
      BulkImportResult: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "True if all records imported successfully"
          },
          totalRows: {
            type: "integer",
            description: "Total number of rows in the file"
          },
          successCount: {
            type: "integer",
            description: "Number of successfully imported records"
          },
          errorCount: {
            type: "integer",
            description: "Number of failed records"
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row: {
                  type: "integer",
                  description: "Row number in the file (1-based)"
                },
                data: {
                  type: "object",
                  description: "The row data that failed"
                },
                error: {
                  type: "string",
                  description: "Error message"
                }
              }
            }
          },
          imported: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row: {
                  type: "integer",
                  description: "Row number in the file"
                },
                id: {
                  type: "string",
                  example: "MDK-GB-25I-0001",
                  description: "Generated ID for the imported record"
                },
                name: {
                  type: "string",
                  description: "Name of the imported gift box"
                }
              }
            }
          },
          duration: {
            type: "integer",
            description: "Processing time in milliseconds"
          }
        },
        example: {
          success: false,
          totalRows: 100,
          successCount: 98,
          errorCount: 2,
          errors: [
            {
              row: 5,
              error: "price: Number must be greater than 0",
              data: { name: "Invalid Box", price: -10 }
            },
            {
              row: 23,
              error: "image: Invalid url",
              data: { name: "Bad Image Box", image: "not-a-url" }
            }
          ],
          imported: [
            {
              row: 2,
              id: "MDK-GB-25I-0001",
              name: "Unicorn Dreams Box"
            }
          ],
          duration: 3456
        }
      },
      BulkImportFileRequirements: {
        type: "object",
        description: "File format requirements for bulk import",
        properties: {
          requiredColumns: {
            type: "array",
            items: { type: "string" },
            example: ["name", "description", "price", "image", "rating"]
          },
          optionalColumns: {
            type: "array",
            items: { type: "string" },
            example: ["badge", "reviews", "isWishlisted", "isSoldOut", "category", "images"]
          },
          columnNotes: {
            type: "object",
            properties: {
              price: { type: "string", example: "Must be a positive number" },
              image: { type: "string", example: "Must be a valid URL" },
              rating: { type: "string", example: "Number between 0 and 5" },
              category: { type: "string", example: "One of: GB, TY, BK, GM, CL, AC" },
              images: { type: "string", example: "Comma-separated URLs for gallery images" },
              isWishlisted: { type: "string", example: "true/false or 1/0" },
              isSoldOut: { type: "string", example: "true/false or 1/0" }
            }
          },
          maxFileSize: { type: "string", example: "50MB" },
          supportedFormats: {
            type: "array",
            items: { type: "string" },
            example: [".csv", ".xlsx", ".xls"]
          }
        }
      }
    }
  },
  tags: [
    { name: "config", description: "Carousel configuration endpoints" },
    { name: "kidsgiftboxes", description: "Kids gift box management endpoints" }
  ]
} as const;

export default spec;