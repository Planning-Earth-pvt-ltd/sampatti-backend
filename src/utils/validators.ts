import { PropertyCategory } from '@prisma/client';

export const isValidPropertyCategory = (category: string): boolean => {
  const validCategories = Object.values(PropertyCategory);
  return validCategories.includes(category as PropertyCategory);
};
