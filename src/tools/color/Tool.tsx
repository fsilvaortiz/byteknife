import { useMemo, useState } from 'preact/hooks';
import type { ToolProps } from '../../components/ToolHost';
import { t, type Locale } from '../../i18n';
import ColorScale from '../../ui/ColorScale';
import KeyValue from '../../ui/KeyValue';
import Pane from '../../ui/Pane';
import Pill from '../../ui/Pill';
import Swatch from '../../ui/Swatch';
import { useDebounced } from '../../ui/useDebounced';
import { cssColorToRgba } from './browser';
import {
  BLACK,
  contrast,
  formats,
  oklchScale,
  parseColor,
  toHex,
  wcagGrade,
  WHITE,
  type Grade,
} from './logic';

const SAMPLE = '#2a4fd6';
const TONE: Record<Grade, 'ok' | 'warn' | 'bad'> = {
  aaa: 'ok',
  aa: 'ok',
  aaLarge: 'warn',
  fail: 'bad',
};

const ratioText = (locale: Locale, r: number) => t(locale, 'color.ratio', { ratio: r.toFixed(2) });

export default function ColorTool({ locale, initialInput }: ToolProps) {
  const [input, setInput] = useState(initialInput ?? SAMPLE);
  const src = useDebounced(input, 80);
  const color = useMemo(() => parseColor(src) ?? cssColorToRgba(src), [src]);

  const onWhite = color && contrast(color, WHITE);
  const onBlack = color && contrast(color, BLACK);

  return (
    <>
      <div class="bar">
        <input
          type="color"
          aria-label={t(locale, 'color.picker')}
          value={color ? toHex({ ...color, a: 1 }) : '#000000'}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        <input
          type="text"
          class="code"
          spellcheck={false}
          style="flex:1;min-width:180px"
          placeholder={t(locale, 'color.placeholder')}
          aria-label={t(locale, 'color.input')}
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {!color && src.trim() && <Pill tone="bad">{t(locale, 'color.invalid')}</Pill>}
      </div>
      {color && onWhite != null && onBlack != null && (
        <>
          <div class="split">
            <Pane title={t(locale, 'color.sample')}>
              <div>
                <Swatch color={`rgb(${color.r} ${color.g} ${color.b} / ${color.a})`}>
                  <span style="color:#fff">
                    {t(locale, 'color.sampleWhite', { ratio: onWhite.toFixed(2) })}
                  </span>
                  <span style="color:#000">
                    {t(locale, 'color.sampleBlack', { ratio: onBlack.toFixed(2) })}
                  </span>
                </Swatch>
                <div style="margin-top:8px">
                  <KeyValue
                    locale={locale}
                    rows={(
                      [
                        ['color.onWhite', onWhite],
                        ['color.onBlack', onBlack],
                      ] as const
                    ).map(([key, ratio]) => {
                      const grade = wcagGrade(ratio);
                      return {
                        key: t(locale, key),
                        value: (
                          <>
                            {ratioText(locale, ratio)}{' '}
                            <Pill tone={TONE[grade]}>{t(locale, `color.grade.${grade}`)}</Pill>
                          </>
                        ),
                      };
                    })}
                  />
                </div>
              </div>
            </Pane>
            <Pane title={t(locale, 'color.formats')}>
              <KeyValue
                locale={locale}
                rows={formats(color).map(([id, value]) => ({
                  key: t(locale, `color.fmt.${id}`),
                  value,
                  copy: value,
                }))}
              />
            </Pane>
          </div>
          <Pane title={t(locale, 'color.scale')}>
            <ColorScale locale={locale} steps={oklchScale(color)} />
          </Pane>
        </>
      )}
    </>
  );
}
