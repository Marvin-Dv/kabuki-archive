import type { Config } from 'tailwindcss'

// As cores vêm de CSS variables (assets/css/main.css), então o tema
// claro/escuro funciona sem duplicar classes `dark:` por todo o código.
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: 'var(--k-bg)',
        'bg-soft': 'var(--k-bg-soft)',
        surface: 'var(--k-surface)',
        'surface-2': 'var(--k-surface-2)',
        line: 'var(--k-border)',
        ink: 'var(--k-text)',
        muted: 'var(--k-muted)',
        accent: 'var(--k-accent)',
        'accent-2': 'var(--k-accent-2)',
        'accent-ink': 'var(--k-accent-ink)',
        el: {
          physical: 'var(--el-physical)',
          fire: 'var(--el-fire)',
          ice: 'var(--el-ice)',
          lightning: 'var(--el-lightning)',
          wind: 'var(--el-wind)',
          quantum: 'var(--el-quantum)',
          imaginary: 'var(--el-imaginary)',
        },
      },
      fontFamily: {
        // Chinês, japonês e coreano usam a fonte do sistema como reserva.
        display: [
          'Sora',
          'Noto Sans JP',
          'Noto Sans SC',
          'Noto Sans KR',
          'PingFang SC',
          'Hiragino Sans',
          'Microsoft YaHei',
          'Malgun Gothic',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'DM Sans',
          'Noto Sans JP',
          'Noto Sans SC',
          'Noto Sans KR',
          'PingFang SC',
          'Hiragino Sans',
          'Microsoft YaHei',
          'Malgun Gothic',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
} satisfies Config
