import { z } from 'zod';

export const MachineCreateSchema = z.object({
  cpu: z.string().min(2, 'Укажите CPU'),
  gpu: z.string().min(2, 'Укажите GPU'),
  ram: z.string().min(1, 'Укажите RAM'),
  hourlyRate: z.number().min(1, 'Цена должна быть больше 0'),
  screenshotUrl: z.string().url('Некорректная ссылка на скриншот').optional(),
  tailscaleIp: z.string().optional(),
  sunshinePin: z.string().optional(),
  games: z.array(z.string()).optional(),
});
