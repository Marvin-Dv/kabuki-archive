// Kabuki Archive — configuração do Nuxt (SSG para GitHub Pages)
//
// baseURL: "/" em desenvolvimento e em repositórios <usuario>.github.io.
// Em um repositório de projeto (ex.: kabuki-archive), o site fica em
// <usuario>.github.io/kabuki-archive/ e o workflow de deploy define
// NUXT_APP_BASE_URL=/kabuki-archive/ automaticamente.

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const baseURL = process.env.NUXT_APP_BASE_URL ?? '/'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: true,

  modules: ['@nuxtjs/i18n', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  // Tema: escuro por padrão, com alternância manual (classes .dark / .light no <html>)
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'kabuki-theme',
  },

  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'pt-BR',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh-CN', language: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'ko', language: 'ko-KR', name: '한국어', file: 'ko.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'kabuki-locale',
      redirectOn: 'root',
      fallbackLocale: 'pt-BR',
    },
  },

  // Geração estática para o GitHub Pages
  nitro: {
    preset: 'github_pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  app: {
    baseURL,
    head: {
      titleTemplate: '%s · Kabuki Archive',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0e0b16' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  typescript: { strict: true },
})
