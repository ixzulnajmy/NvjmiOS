import { z } from 'zod';

export const prayerSchema = z.object({
  prayer_name: z.enum(['subuh', 'zohor', 'asar', 'maghrib', 'isyak']),
  prayer_date: z.string().or(z.date()),
  completed: z.boolean().default(false),
  status: z.enum(['on_time', 'late', 'missed']).default('on_time'),
  jemaah: z.boolean().default(false),
  location: z.enum(['home', 'office', 'masjid_muadz', 'other']).default('home'),
});

export const quranLogSchema = z.object({
  date: z.string().or(z.date()),
  pages_read: z.number().int().min(0, 'Pages read must be 0 or more'),
  surah_name: z.string().optional(),
  notes: z.string().optional(),
});

export const sedekahSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().or(z.date()),
});

export type PrayerFormData = z.infer<typeof prayerSchema>;
export type QuranLogFormData = z.infer<typeof quranLogSchema>;
export type SedekahFormData = z.infer<typeof sedekahSchema>;
