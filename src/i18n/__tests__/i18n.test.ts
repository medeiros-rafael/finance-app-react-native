import i18n from '@/i18n';
import { ValidationError } from '@/lib/validation';

import en from '../locales/en.json';
import es from '../locales/es.json';
import ptBR from '../locales/pt-BR.json';
import { appErrorMessage, validationMessage } from '../messages';

function keysOf(tree: Record<string, Record<string, string>>): string[] {
  return Object.entries(tree)
    .filter(([group]) => group !== 'app')
    .flatMap(([group, entries]) => Object.keys(entries).map((key) => `${group}.${key}`))
    .sort();
}

describe('traduções', () => {
  it('inglês e espanhol têm exatamente as mesmas chaves do português', () => {
    expect(keysOf(en)).toEqual(keysOf(ptBR));
    expect(keysOf(es)).toEqual(keysOf(ptBR));
  });

  it('interpola nomes e e-mails', () => {
    const t = i18n.getFixedT('en');
    expect(t('dashboard.greeting', { name: 'Rafael' })).toBe('Hi, Rafael');
    expect(i18n.getFixedT('pt-BR')('auth.forgotSent', { email: 'a@b.com' })).toContain('a@b.com');
  });

  it('mensagens de erro conhecidas são traduzidas; desconhecidas usam o texto da API', () => {
    const t = i18n.getFixedT('pt-BR');
    expect(appErrorMessage(t, { kind: 'network' })).toBe(ptBR.ui.errorNetwork);
    expect(appErrorMessage(t, { kind: 'business', code: 'INSUFFICIENT_BALANCE' })).toBe(
      ptBR.ui.errorInsufficientBalance,
    );
    expect(appErrorMessage(t, { kind: 'business', code: 'NOVO_CODIGO', message: 'Texto da API' })).toBe(
      'Texto da API',
    );
    expect(appErrorMessage(t, { kind: 'validation', fieldErrors: { amount: 'Valor inválido' } })).toBe(
      'Valor inválido',
    );
  });

  it('códigos de validação local viram texto; mensagens da API passam direto', () => {
    const t = i18n.getFixedT('es');
    expect(validationMessage(t, ValidationError.REQUIRED)).toBe(es.ui.validationRequired);
    expect(validationMessage(t, 'Mensagem do servidor')).toBe('Mensagem do servidor');
    expect(validationMessage(t, undefined)).toBeUndefined();
  });
});
