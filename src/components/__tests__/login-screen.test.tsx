import { screen, userEvent } from '@testing-library/react-native';

import { authApi } from '@/api/auth';
import { ApiError } from '@/api/errors';
import LoginScreen from '@/app/(auth)/login';
import { useSession } from '@/stores/session';
import { sampleUser } from '@/test-utils/sample-data';
import { renderWithProviders } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('@/api/auth', () => ({ authApi: { login: jest.fn() } }));

const login = authApi.login as jest.Mock;

describe('Tela de login', () => {
  beforeEach(() => {
    login.mockReset();
    useSession.setState({ status: 'signedOut', user: null, tokens: null });
  });

  it('valida os campos antes de chamar a API', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen />);

    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findAllByText('Campo obrigatório')).toHaveLength(2);
    expect(login).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('E-mail'), 'rafael');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('E-mail inválido')).toBeOnTheScreen();
  });

  it('mostra a mensagem traduzida quando a API recusa as credenciais', async () => {
    login.mockRejectedValue(new ApiError({ kind: 'business', code: 'INVALID_CREDENTIALS' }));
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen />);

    await user.type(screen.getByLabelText('E-mail'), 'rafael@email.com');
    await user.type(screen.getByLabelText('Senha'), 'errada123');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeOnTheScreen();
    expect(login).toHaveBeenCalledWith('rafael@email.com', 'errada123');
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('login bem-sucedido salva a sessão (a raiz do app troca de área sozinha)', async () => {
    login.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: sampleUser,
    });
    const user = userEvent.setup();
    await renderWithProviders(<LoginScreen />);

    await user.type(screen.getByLabelText('E-mail'), ' rafael@email.com ');
    await user.type(screen.getByLabelText('Senha'), 'Senha123');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    await screen.findByRole('button', { name: 'Entrar' });
    expect(login).toHaveBeenCalledWith('rafael@email.com', 'Senha123');
    expect(useSession.getState().status).toBe('signedIn');
    expect(useSession.getState().user).toEqual(sampleUser);
  });
});
