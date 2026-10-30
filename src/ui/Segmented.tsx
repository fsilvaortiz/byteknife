interface Props<T extends string> {
  label: string;
  options: readonly (readonly [value: T, label: string])[];
  value: T;
  onChange: (value: T) => void;
}

export default function Segmented<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div class="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}
