import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t } from '../../i18n';
import List from '../../ui/List';
import Pill, { type Tone } from '../../ui/Pill';
import {
  entropyBits,
  generatePassword,
  PasswordError,
  strength,
  type Charset,
  type Strength,
} from './logic';

const SETS: Charset[] = ['upper', 'lower', 'digits', 'symbols'];
const TONE: Record<Strength, Tone> = { weak: 'bad', fair: 'warn', strong: 'ok', excellent: 'ok' };
const COUNT = 6;

export default function PasswordTool({ locale }: ToolProps) {
  const [length, setLength] = useState(24);
  const [sets, setSets] = useState<Charset[]>(SETS);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [list, setList] = useState<string[] | null>([]);

  const generate = () => {
    try {
      setList(
        Array.from({ length: COUNT }, () => generatePassword({ length, sets, avoidAmbiguous })),
      );
    } catch (e) {
      if (!(e instanceof PasswordError)) throw e;
      setList(null);
    }
  };
  useEffect(generate, [length, sets, avoidAmbiguous]);

  const toggle = (k: Charset, on: boolean) =>
    setSets(SETS.filter((s) => (s === k ? on : sets.includes(s))));
  const bits = entropyBits({ length, sets, avoidAmbiguous });
  const level = strength(bits);

  return (
    <>
      <div class="bar">
        <label class="fld">
          {t(locale, 'pwd.length')}
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onInput={(e) => setLength(e.currentTarget.valueAsNumber)}
          />
          <b class="mono">{length}</b>
        </label>
      </div>
      <div class="bar">
        {SETS.map((k) => (
          <label key={k} class="chk">
            <input
              type="checkbox"
              checked={sets.includes(k)}
              onChange={(e) => toggle(k, e.currentTarget.checked)}
            />
            {t(locale, `pwd.${k}`)}
          </label>
        ))}
        <label class="chk">
          <input
            type="checkbox"
            checked={avoidAmbiguous}
            onChange={(e) => setAvoidAmbiguous(e.currentTarget.checked)}
          />
          {t(locale, 'pwd.ambiguous')}
        </label>
        <button class="btn primary" type="button" onClick={generate}>
          {t(locale, 'pwd.regenerate')}
        </button>
        {list && (
          <Pill tone={TONE[level]}>
            {t(locale, 'pwd.strength', {
              label: t(locale, `pwd.${level}`),
              bits: Math.round(bits),
            })}
          </Pill>
        )}
      </div>
      {list ? (
        <List locale={locale} label={t(locale, 'pwd.list')} rows={list.map((text) => ({ text }))} />
      ) : (
        <p class="err" role="alert">
          {t(locale, 'pwd.noSets')}
        </p>
      )}
    </>
  );
}
