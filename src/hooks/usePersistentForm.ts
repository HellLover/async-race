import { useState, useEffect } from 'react';
import { z } from 'zod';

export function usePersistentForm<T>(
  schema: z.ZodSchema<T>,
  defaultValues: T,
  storageKey: string
) {
  const [data, setData] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validated = schema.safeParse(parsed);
        if (validated.success) {
          setData(validated.data);
        }
      } catch (error) {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      setIsValid(true);
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } else {
      setIsValid(false);
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
    }
  }, [data, schema, storageKey]);

  const clearData = () => {
    sessionStorage.removeItem(storageKey);
    setData(defaultValues);
    setErrors({});
  };

  return { data, setData, errors, isValid, clearData };
}