import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Имя слишком короткое'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль слишком короткий'),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  role: z.enum(['PLAYER', 'MERCHANT', 'ADMIN']),
});
