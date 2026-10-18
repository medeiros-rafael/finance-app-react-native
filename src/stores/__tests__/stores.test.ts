import * as SecureStore from 'expo-secure-store';

import { LOCK_AFTER_MS, useAppLock } from '../app-lock';
import { firstName, useSession } from '../session';

const auth = {
  accessToken: 'access',
  refreshToken: 'refresh',
  expiresIn: 3600,
  tokenType: 'Bearer',
  user: { id: 'u1', name: 'Rafael Medeiros', email: 'rafael@email.com' },
};

describe('sessão', () => {
  beforeEach(async () => {
    await useSession.getState().clear();
  });

  it('login salva no armazenamento seguro e reabre o app já logado', async () => {
    await useSession.getState().signIn(auth);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('finance.session.access', 'access');

    useSession.setState({ status: 'loading', user: null, tokens: null });
    await useSession.getState().hydrate();

    const state = useSession.getState();
    expect(state.status).toBe('signedIn');
    expect(state.user?.email).toBe('rafael@email.com');
    expect(state.tokens?.refreshToken).toBe('refresh');
  });

  it('sem sessão salva fica deslogado', async () => {
    await useSession.getState().hydrate();
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('dados corrompidos são tratados como deslogado', async () => {
    await SecureStore.setItemAsync('finance.session.access', 'a');
    await SecureStore.setItemAsync('finance.session.refresh', 'r');
    await SecureStore.setItemAsync('finance.session.meta', '{quebrado');
    await useSession.getState().hydrate();
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('atualiza o nome mantendo os tokens', async () => {
    await useSession.getState().signIn(auth);
    await useSession.getState().updateUser({ ...auth.user, name: 'Rafael S. Medeiros' });
    expect(useSession.getState().user?.name).toBe('Rafael S. Medeiros');
    expect(useSession.getState().tokens?.accessToken).toBe('access');
  });

  it('primeiro nome para saudações', () => {
    expect(firstName('  Rafael Medeiros ')).toBe('Rafael');
    expect(firstName(undefined)).toBe('');
  });
});

describe('bloqueio do app', () => {
  beforeEach(() => useAppLock.setState({ locked: true, backgroundedAt: null }));

  it('começa bloqueado e desbloqueia após a biometria', () => {
    expect(useAppLock.getState().locked).toBe(true);
    useAppLock.getState().unlock();
    expect(useAppLock.getState().locked).toBe(false);
  });

  it('bloqueia de novo só depois de 30 s em segundo plano', () => {
    const lock = useAppLock.getState();
    lock.unlock();

    lock.onBackground(1_000);
    lock.onForeground(1_000 + LOCK_AFTER_MS - 1);
    expect(useAppLock.getState().locked).toBe(false);

    lock.onBackground(100_000);
    lock.onForeground(100_000 + LOCK_AFTER_MS);
    expect(useAppLock.getState().locked).toBe(true);
  });
});
