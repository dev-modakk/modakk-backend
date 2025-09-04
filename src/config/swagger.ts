import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Modakk Kids Gift Boxes API',
      version: '1.0.0',
      description: 'A Node.js API for Kids Gift Boxes with PostgreSQL, TypeScript, and Swagger documentation',
      contact: {
        name: 'API Support',
        email: 'support@modakk.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        KidsGiftBox: {
          type: 'object',
          required: ['title', 'price', 'box_contains', 'reviews_avg', 'description'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the kids gift box',
              example: 1
            },
            title: {
              type: 'string',
              description: 'The gift box title',
              example: 'Squishmallow Fun'
            },
            price: {
              type: 'string',
              description: 'The gift box price in format $XX.XX',
              pattern: '^\\$[0-9]+\\.[0-9]{2}$',
              example: '$39.95'
            },
            box_contains: {
              type: 'string',
              description: 'Description of what the gift box contains',
              example: 'This Epic Kids Squishmallow gift box contains: 1x 12" Squishmallow plushie, 1x Kit Kat Mini, 2x Mini Mentos Fruit lolly rolls'
            },
            reviews_avg: {
              type: 'number',
              format: 'float',
              minimum: 1.0,
              maximum: 5.0,
              description: 'Average reviews rating from 1 to 5',
              example: 4.5
            },
            description: {
              type: 'string',
              description: 'Detailed description of the gift box',
              example: 'Perfect gift box for kids who love soft, cuddly companions! This amazing Squishmallow gift box brings joy and sweetness together.'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'The date the gift box was created',
              example: '2023-01-01T00:00:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'The date the gift box was last updated',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Validation Error'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Title must be at least 2 characters long'
            }
          },
          required: ['error', 'message']
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Modakk Kids Gift Boxes API Documentation'
};