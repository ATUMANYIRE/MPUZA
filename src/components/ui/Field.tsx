import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cx } from '../../lib/cx';

/**
 * Measured from .mpuza_input: height 2.8125rem (45px), radius 6px, 14px,
 * border 1px #dbdbdb, background #fff, letter-spacing -.01em.
 * Focus on the real site only changes border-colour to #35a8df; we keep that
 * and add a visible ring on top (see design-language.md §6).
 */
const CONTROL = cx(
  'w-full rounded-md border border-line-input bg-surface px-3 text-button text-text',
  'placeholder:text-text-placeholder',
  'transition-colors duration-base ease-default',
  'hover:border-primary focus:border-primary focus:outline-none',
  'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted',
);

const ERROR = 'border-danger hover:border-danger focus:border-danger';

interface LabelProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
}

const FieldShell = ({
  label,
  htmlFor,
  hint,
  error,
  children,
}: LabelProps & { children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-meta font-medium text-text-body">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-bar-sub text-danger" role="alert">
        {error}
      </p>
    ) : hint ? (
      <p className="text-bar-sub text-text-muted">{hint}</p>
    ) : null}
  </div>
);

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = ({ label, hint, error, className, ...rest }: TextFieldProps) => {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error}>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cx(CONTROL, 'h-control', error && ERROR, className)}
      />
    </FieldShell>
  );
};

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextArea = ({ label, hint, error, className, ...rest }: TextAreaProps) => {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error}>
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cx(CONTROL, 'min-h-28 resize-y py-2.5 leading-body', error && ERROR, className)}
      />
    </FieldShell>
  );
};

interface SelectFieldProps {
  label: string;
  value: string | null;
  placeholder: string;
  hint?: string;
  error?: string;
  onOpen: () => void;
}

/**
 * On mobile a native <select> cannot offer search or large touch targets, so
 * this renders as a button that opens a bottom sheet. It stays a labelled
 * form control to assistive tech via aria-haspopup + the value in its text.
 */
export const SelectField = ({
  label,
  value,
  placeholder,
  hint,
  error,
  onOpen,
}: SelectFieldProps) => {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error}>
      <button
        id={id}
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-invalid={error ? true : undefined}
        className={cx(
          CONTROL,
          'h-control flex items-center justify-between text-left',
          error && ERROR,
        )}
      >
        <span className={cx('truncate', !value && 'text-text-placeholder')}>
          {value ?? placeholder}
        </span>
        <ChevronDown />
      </button>
    </FieldShell>
  );
};

export const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={cx('h-4 w-4 shrink-0 text-text-placeholder', className)}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="m4 6 4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface CheckboxProps {
  label: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

/** Measured: .ant-checkbox-checked .ant-checkbox-inner is #35a8df fill + border. */
export const Checkbox = ({ label, checked, disabled, onChange }: CheckboxProps) => (
  <label
    className={cx(
      'flex min-h-tap cursor-pointer select-none items-center gap-2.5',
      disabled && 'cursor-not-allowed opacity-50',
    )}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={cx(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border',
        'transition-colors duration-base ease-default',
        'peer-focus-visible:outline peer-focus-visible:outline-2',
        'peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
        checked ? 'border-primary bg-primary' : 'border-line-input bg-surface',
      )}
    >
      {checked && (
        <svg className="h-3 w-3 text-text-on-primary" viewBox="0 0 12 12" fill="none">
          <path
            d="m2.5 6.2 2.3 2.3L9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span className="text-meta text-text-body">{label}</span>
  </label>
);
