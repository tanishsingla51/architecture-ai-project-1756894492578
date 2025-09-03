import { z } from 'zod';

export const getConversationByIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid conversation ID format'),
  }),
});

export const deleteConversationSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid conversation ID format'),
  }),
});
