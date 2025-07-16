import { z } from 'zod';

export const ReviewCreateSchema = z.object({
  machineId: z.string().min(1, 'ID машины обязателен'),
  rating: z.number().min(1).max(5),
  text: z.string().min(5, 'Отзыв слишком короткий'),
});
