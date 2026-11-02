import { useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import KeyValue from '../../ui/KeyValue';
import Pill from '../../ui/Pill';
import Table from '../../ui/Table';
import {
  ChmodError,
  CLASSES,
  parseMode,
  toChmodSymbolic,
  toOctal,
  toSymbolic,
  warnings,
  type Mode,
  type PermClass,
} from './logic';

const BITS = [
  ['read', 4],
  ['write', 2],
  ['exec', 1],
] as const;

const SPECIALS = [
  ['setuid', 4],
  ['setgid', 2],
  ['sticky', 1],
] as const;

export default function ChmodTool({ locale, initialInput }: ToolProps) {
  const start = (() => {
    try {
      return initialInput ? parseMode(initialInput) : null;
    } catch {
      return null;
    }
  })();
  const [mode, setMode] = useState<Mode>(start ?? { special: 0, user: 7, group: 5, other: 5 });
  const [text, setText] = useState(initialInput ?? '755');
  const [invalid, setInvalid] = useState(false);

  const onText = (value: string) => {
    setText(value);
    try {
      setMode(parseMode(value, mode));
      setInvalid(false);
    } catch (e) {
      if (!(e instanceof ChmodError)) throw e;
      setInvalid(value.trim() !== '');
    }
  };

  const update = (next: Mode) => {
    setMode(next);
    setText(toOctal(next));
    setInvalid(false);
  };
  const toggle = (c: PermClass, bit: number, on: boolean) =>
    update({ ...mode, [c]: on ? mode[c] | bit : mode[c] & ~bit });
  const toggleSpecial = (bit: number, on: boolean) =>
    update({ ...mode, special: on ? mode.special | bit : mode.special & ~bit });

  const octal = toOctal(mode);
  const symbolic = toChmodSymbolic(mode);

  return (
    <>
      <div class="bar">
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:200px"
          placeholder="755, rwxr-xr-x, u+x, chmod 640 app.log"
          aria-label={t(locale, 'chmod.input')}
          value={text}
          onInput={(e) => onText(e.currentTarget.value)}
        />
        {invalid && <Pill tone="bad">{t(locale, 'chmod.invalid')}</Pill>}
        {warnings(mode).map((w) => (
          <Pill key={w} tone="warn">
            {t(locale, `chmod.warn.${w}`)}
          </Pill>
        ))}
      </div>
      <Table
        label={t(locale, 'chmod.matrix')}
        header={[
          t(locale, 'chmod.who'),
          ...BITS.map(([k]) => t(locale, `chmod.perm.${k}`)),
          t(locale, 'chmod.octal'),
        ]}
        rows={CLASSES.map((c) => ({
          cells: [
            t(locale, `chmod.class.${c}`),
            ...BITS.map(([k, bit]) => (
              <input
                key={k}
                type="checkbox"
                aria-label={`${t(locale, `chmod.class.${c}`)}: ${t(locale, `chmod.perm.${k}`)}`}
                checked={(mode[c] & bit) > 0}
                onChange={(e) => toggle(c, bit, e.currentTarget.checked)}
              />
            )),
            String(mode[c]),
          ],
        }))}
      />
      <div class="bar">
        {SPECIALS.map(([k, bit]) => (
          <label key={k} class="chk">
            <input
              type="checkbox"
              checked={(mode.special & bit) > 0}
              onChange={(e) => toggleSpecial(bit, e.currentTarget.checked)}
            />
            {t(locale, `chmod.special.${k}`)}
          </label>
        ))}
      </div>
      <KeyValue
        locale={locale}
        rows={[
          { key: t(locale, 'chmod.octal'), value: octal, copy: octal },
          { key: t(locale, 'chmod.symbolic'), value: toSymbolic(mode), copy: toSymbolic(mode) },
          {
            key: t(locale, 'chmod.ls'),
            value: `-${toSymbolic(mode)}`,
            copy: `-${toSymbolic(mode)}`,
          },
          {
            key: t(locale, 'chmod.command'),
            value: `chmod ${octal} ${t(locale, 'chmod.file')}`,
            copy: `chmod ${octal} `,
          },
          {
            key: t(locale, 'chmod.commandSym'),
            value: `chmod ${symbolic} ${t(locale, 'chmod.file')}`,
            copy: `chmod ${symbolic} `,
          },
        ]}
      />
    </>
  );
}
