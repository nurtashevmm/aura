import { z } from 'zod';

export const BalanceTopupSchema = z.object({
  amount: z.number().min(1, 'Сумма должна быть больше 0'),
});
