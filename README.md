# Finance RN — app React Native (Expo)

Versão **React Native** do app Finance. Tem as mesmas telas, regras e textos do app Kotlin
(`../finance-app-android`), que continua sendo a referência, e consome a **mesma API .NET**
(`../finance-app-api`).

| | |
|---|---|
| Framework | Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict) |
| Navegação | Expo Router (rotas por arquivos em `src/app`, typed routes, `Stack.Protected`) |
| UI | React Native Paper (Material 3) com a paleta do app Kotlin |
| Dados da API | TanStack Query (cache, paginação infinita, invalidação) + Axios |
| Estado local | Zustand (sessão, preferências, bloqueio, snackbar) |
| Formulários | React Hook Form + Zod (validações iguais às dos use cases Kotlin) |
| Gráficos | Victory Native XL (Skia + Reanimated) |
| Armazenamento | expo-secure-store (tokens, Keystore/Keychain) + AsyncStorage (preferências) |
| Biometria | expo-local-authentication (rosto, digital ou PIN do aparelho) |
| Idiomas | i18next + expo-localization (pt-BR, en, es, os mesmos textos do Kotlin) |
| Testes | Jest (jest-expo) + React Native Testing Library |
| Qualidade | ESLint (eslint-config-expo) + Prettier |

## Como rodar

Pré-requisitos: **Node.js LTS**, **Android Studio** (SDK e emulador) e a **API rodando**
(veja `../finance-app-api/README.md`).

```bash
npm install
npm run android      # compila o app nativo (development build) e abre no emulador
```

O primeiro `npm run android` gera a pasta `android/` (`expo prebuild`) e compila com o Gradle.
Na primeira vez o Android SDK baixa o **NDK** e o **CMake**, que são necessários para
Reanimated, Worklets e Skia. Depois disso, para editar o código basta:

```bash
npm start            # Metro com recarregamento instantâneo (o app já instalado conecta sozinho)
```

O app é instalado como **"Finance RN"** (`com.rafaelmedeiros.finance.rn`) e fica lado a lado
com o app Kotlin (`com.rafaelmedeiros.finance`) no mesmo emulador.

### URL da API

Por padrão:
- no emulador Android: `http://10.0.2.2:5080/api/v1/` (é o `localhost` do PC);
- no simulador iOS: `http://localhost:5080/api/v1/`.

Para trocar (por exemplo, para um celular físico na mesma rede), copie `.env.example` para
`.env` e ajuste `EXPO_PUBLIC_API_URL`.

### iOS

O código já funciona no iOS (Face ID configurado em `app.json`), mas compilar exige um Mac
com Xcode (`npm run ios`) ou um build na nuvem com EAS (`npx eas-cli build -p ios`).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run android` / `npm run ios` | Compila e instala o development build |
| `npm start` | Inicia o Metro (servidor de desenvolvimento) |
| `npm test` | Roda os testes (Jest) |
| `npm run typecheck` | Verifica tipos (TypeScript) |
| `npm run lint` | ESLint + Prettier |
| `npm run check` | typecheck + lint + testes |
| `npm run prebuild` | Regenera as pastas nativas `android/` e `ios/` |

## Estrutura

```
src/
├── app/                      # Rotas (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx           # Raiz: providers, tema, splash e o "portão" login/bloqueio/app
│   ├── lock.tsx              # Tela de bloqueio por biometria
│   ├── (auth)/               # login, register, forgot-password
│   └── (app)/                # Área logada
│       ├── (tabs)/           # index (Início), statement, accounts, settings + barra inferior
│       ├── account/          # new, [id] (detalhe), edit/[id]
│       ├── transaction/      # new (?type=INCOME|EXPENSE), [id] (editar)
│       ├── transfer.tsx, profile.tsx, change-password.tsx
├── api/                      # Cliente Axios (token + refresh), endpoints, schemas Zod, erros
├── components/               # ui/ (design system), finance/, dashboard/, transactions/, ...
├── hooks/                    # Queries/mutations (TanStack Query) e hooks utilitários
├── stores/                   # Zustand: sessão, preferências, bloqueio, snackbar
├── i18n/                     # i18next + traduções pt-BR/en/es + mensagens de erro
├── lib/                      # Dinheiro (centavos), datas, validações Zod, biometria
├── theme/                    # Paleta, tema claro/escuro do Paper, espaçamentos
└── test-utils/               # Render com providers e dados de exemplo para testes
```

## Decisões importantes

- **Dinheiro em centavos inteiros.** A API envia decimais (`1250.50`); o app converte para
  `125050` na hora de ler (schemas Zod) e volta para reais só ao enviar. Nenhuma conta passa
  por ponto flutuante, o equivalente ao `BigDecimal` do Kotlin.
- **Datas como texto** (`"2026-09-28"`, `"2026-09"`), igual à API, sem o problema de fuso do `Date`.
- **Respostas da API validadas em tempo de execução** com Zod. Se a API mudar um campo, o app
  mostra um erro claro em vez de quebrar em outro lugar.
- **Sessão como fonte única de verdade.** Login e logout não navegam. A raiz observa a sessão e
  troca de área sozinha (`Stack.Protected`), como o `MainViewModel` do Kotlin.
- **Renovação de sessão com um único refresh.** Várias requisições que recebem 401 ao mesmo
  tempo compartilham um refresh só (o `Mutex` do `TokenAuthenticator` Kotlin).
- **Erros da API tratados em um só lugar.** Os códigos da API (`INSUFFICIENT_BALANCE`...) viram
  textos traduzidos; erros de validação da API aparecem no próprio campo do formulário.
