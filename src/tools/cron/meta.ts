import type { ToolMeta } from '../../core/types';
import { isCronExpression } from './logic';

export const meta: ToolMeta = {
  id: 'cron',
  category: 'time',
  order: 2,
  i18n: {
    es: {
      name: 'Expresiones cron',
      description:
        'Explica una expresión cron en lenguaje claro y calcula las próximas ejecuciones.',
      keywords: ['cron', 'crontab', 'schedule', 'programar', 'job', 'tarea', 'expresion'],
      labels: { cron: 'Cron' },
    },
    en: {
      name: 'Cron expressions',
      description: 'Explain a cron expression in plain language and compute the next runs.',
      keywords: ['cron', 'crontab', 'schedule', 'job', 'task', 'expression'],
      labels: { cron: 'Cron' },
    },
    pt: {
      name: 'Expressões cron',
      description: 'Explica uma expressão cron em linguagem clara e calcula as próximas execuções.',
      keywords: ['cron', 'crontab', 'schedule', 'agendar', 'job', 'tarefa', 'expressao'],
      labels: { cron: 'Cron' },
    },
  },
  detect: (input) => (isCronExpression(input) ? { label: 'cron', confidence: 0.85 } : null),
};
