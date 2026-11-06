import { useEffect, useState } from 'preact/hooks';
import { dayOfYear, isoUtc, isoWeek, unixSeconds } from '../core/now';
import { t, type Locale } from '../i18n';
import CopyButton from '../ui/CopyButton';
import { useMounted } from '../ui/useMounted';

export default function NowStrip({ locale }: { locale: Locale }) {
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());
  const [uuid, setUuid] = useState('');

  useEffect(() => {
    setUuid(crypto.randomUUID());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [wy, wn] = isoWeek(now);
  const unix = mounted ? String(unixSeconds(now)) : '';
  const iso = mounted ? isoUtc(now) : '';
  const week = mounted
    ? t(locale, 'now.weekValue', {
        week: `${wy}-W${String(wn).padStart(2, '0')}`,
        day: dayOfYear(now),
      })
    : '';

  return (
    <section class="now" aria-label={t(locale, 'now.section')}>
      <div>
        <div class="lbl">
          {t(locale, 'now.unix')}{' '}
          <CopyButton locale={locale} class="mini" text={() => String(unixSeconds(new Date()))} />
        </div>
        <div class="val big">{unix}</div>
      </div>
      <div>
        <div class="lbl">
          {t(locale, 'now.iso')}{' '}
          <CopyButton locale={locale} class="mini" text={() => isoUtc(new Date())} />
        </div>
        <div class="val">{iso}</div>
      </div>
      <div>
        <div class="lbl">
          {t(locale, 'now.uuid')}
          <span>
            <button class="mini" type="button" onClick={() => setUuid(crypto.randomUUID())}>
              {t(locale, 'now.another')}
            </button>
            <CopyButton locale={locale} class="mini" text={uuid} />
          </span>
        </div>
        <div class="val" data-testid="now-uuid">
          {uuid}
        </div>
      </div>
      <div>
        <div class="lbl">{t(locale, 'now.week')}</div>
        <div class="val">{week}</div>
      </div>
    </section>
  );
}
