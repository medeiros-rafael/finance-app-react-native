import { useCallback, useState } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError, type AppError } from '@/api/errors';

export function useFormError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  const [error, setBannerError] = useState<AppError | null>(null);

  const handle = useCallback(
    (failure: unknown) => {
      const appError: AppError = failure instanceof ApiError ? failure.error : { kind: 'unknown' };
      if (appError.kind === 'validation') {
        const matched = Object.entries(appError.fieldErrors).filter(([field]) =>
          fields.includes(field as Path<T>),
        );
        matched.forEach(([field, message]) => setError(field as Path<T>, { type: 'server', message }));
        if (matched.length > 0) return;
      }
      setBannerError(appError);
    },
    [fields, setError],
  );

  const clear = useCallback(() => setBannerError(null), []);

  return { error, handle, clear };
}
