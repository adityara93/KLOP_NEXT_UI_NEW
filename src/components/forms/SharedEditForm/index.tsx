import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { ConfirmationDialog } from '../../common/ConfirmationDialog';
import { useContextualFeedback } from '../../feedback/ContextualFeedback';

export interface EditFormField<Values extends Record<string, unknown>> {
  name: keyof Values;
  label: string;
  type?: TextFieldProps['type'];
  required?: boolean;
  immutable?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: readonly { label: string; value: string }[];
  parseValue: (rawValue: string, currentValue: Values[keyof Values]) => Values[keyof Values];
  validate?: (value: Values[keyof Values], values: Readonly<Values>) => string | undefined;
}

export interface SharedEditFormProps<Values extends Record<string, unknown>> {
  initialValues: Values;
  fields: readonly EditFormField<Values>[];
  onSubmit: (values: Readonly<Values>) => Promise<boolean>;
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  onCancel?: () => void;
}

function hasChanged<Values extends Record<string, unknown>>(
  initialValues: Values,
  values: Values,
) {
  return Object.keys(initialValues).some(
    (key) => !Object.is(initialValues[key], values[key]),
  );
}

export function SharedEditForm<Values extends Record<string, unknown>>({
  initialValues,
  fields,
  onSubmit,
  submitLabel = 'Save changes',
  successMessage = 'Changes saved successfully.',
  errorMessage = 'Changes could not be saved. Please try again.',
  onCancel,
}: SharedEditFormProps<Values>) {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const feedback = useContextualFeedback();
  const dirty = hasChanged(initialValues, values);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [dirty]);

  const updateField = (field: EditFormField<Values>, rawValue: string) => {
    const nextValue = field.parseValue(rawValue, values[field.name]);
    setValues((current) => ({ ...current, [field.name]: nextValue }));
    setErrors((current) => ({ ...current, [field.name]: undefined }));
    setSubmitError('');
    setSubmitSuccess('');
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof Values, string>> = {};
    fields.forEach((field) => {
      const value = values[field.name];
      const requiredMissing =
        field.required &&
        (value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === ''));
      if (requiredMissing) {
        nextErrors[field.name] = `${field.label} is required.`;
      } else if (!requiredMissing) {
        const message = field.validate?.(value, values);
        if (message) nextErrors[field.name] = message;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const confirmed = await onSubmit(values);
      if (!confirmed) {
        setSubmitError(errorMessage);
        return;
      }
      setSubmitSuccess(successMessage);
      feedback?.showFeedback({ severity: 'success', message: successMessage });
    } catch {
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const requestCancel = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onCancel?.();
  };

  const discardChanges = () => {
    setConfirmDiscard(false);
    onCancel?.();
  };

  return (
    <>
      <Stack component="form" spacing={2} onSubmit={submit} noValidate>
        {fields.map((field) => {
          const value = values[field.name];
          return (
            <TextField
              key={String(field.name)}
              label={field.label}
              type={field.type ?? 'text'}
              value={value === null || value === undefined ? '' : String(value)}
              onChange={(event) => updateField(field, event.target.value)}
              required={field.required}
              disabled={field.immutable || submitting}
              multiline={field.multiline}
              rows={field.multiline ? field.rows ?? 3 : undefined}
              select={Boolean(field.options)}
              error={Boolean(errors[field.name])}
              helperText={errors[field.name] ?? (field.immutable ? 'This field cannot be changed.' : undefined)}
              inputProps={{ readOnly: field.immutable }}
              fullWidth
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          );
        })}
        {submitError && <Alert severity="error" role="alert">{submitError}</Alert>}
        {submitSuccess && <Alert severity="success" role="status">{submitSuccess}</Alert>}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          {onCancel && (
            <Button onClick={requestCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !dirty}
            startIcon={submitting ? <CircularProgress color="inherit" size={16} /> : undefined}
          >
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </Stack>
      </Stack>
      <ConfirmationDialog
        open={confirmDiscard}
        targetName="your unsaved changes"
        actionDescription="Discard your changes and leave this form?"
        impactDescription="Any edits made since opening the form will be lost."
        confirmLabel="Discard changes"
        danger
        onConfirm={discardChanges}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
