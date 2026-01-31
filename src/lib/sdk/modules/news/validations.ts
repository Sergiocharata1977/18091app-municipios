import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(5000),
  tags: z.array(z.string()).optional(),
});

export const CreateCommentSchema = z.object({
  postId: z.string().uuid('ID de post inválido'),
  content: z.string().min(1, 'El comentario no puede estar vacío').max(1000),
});

export const CreateReactionSchema = z.object({
  postId: z.string().uuid('ID de post inválido'),
  userId: z.string().uuid('ID de usuario inválido'),
  reactionType: z.enum(['like', 'love', 'haha', 'wow', 'sad', 'angry']),
});

export const PostFiltersSchema = z.object({
  tags: z.array(z.string()).optional(),
  author: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.date().or(z.string().datetime()).optional(),
  dateTo: z.date().or(z.string().datetime()).optional(),
});
