import type { ReactNode } from 'react';

export function SegmentedControl<T extends string>({
  label,
  onChange,
  options,
  value,
  titleCase,
  layout = 'fit',
  variant = 'default',
  labelSuffix,
}: {
  label: string;
  onChange: (value: T) => void;
  options: T[];
  value: T;
  titleCase: (value?: string) => string;
  layout?: 'fit' | 'two';
  variant?: 'default' | 'compact' | 'micro';
  labelSuffix?: ReactNode;
}) {
  const optionsClassName =
    layout === 'two'
      ? 'segmented-field__options segmented-field__options--two'
      : 'segmented-field__options segmented-field__options--fit';

  const fieldsetClassName =
    variant === 'compact'
      ? 'segmented-field segmented-field--compact'
      : variant === 'micro'
        ? 'segmented-field segmented-field--micro'
        : 'segmented-field';

  const segmentClassName =
    variant === 'compact'
      ? 'segment segment--compact'
      : variant === 'micro'
        ? 'segment segment--micro'
        : 'segment';

  return (
    <fieldset className={fieldsetClassName}>
      <legend className="segmented-field__legend">
        <span>{label}</span>
        {labelSuffix}
      </legend>
      <div className={optionsClassName}>
        {options.map((option) => (
          <button
            key={option}
            aria-label={`${label} ${titleCase(option)}`}
            aria-pressed={value === option}
            className={`${segmentClassName}${value === option ? ' is-active' : ''}`}
            onClick={() => onChange(option)}
            type="button"
          >
            {titleCase(option)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
