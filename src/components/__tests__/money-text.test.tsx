import { screen } from '@testing-library/react-native';

import { MoneyText, TransactionAmountText } from '@/components/finance/money-text';
import { usePreferences } from '@/stores/preferences';
import { renderWithProviders } from '@/test-utils/render';

describe('MoneyText', () => {
  beforeEach(() => usePreferences.setState({ hideValues: false }));

  it('mostra o valor formatado', async () => {
    await renderWithProviders(<MoneyText cents={125050} />);
    expect(screen.getByText('R$ 1.250,50')).toBeOnTheScreen();
  });

  it('esconde o valor quando "ocultar valores" está ligado', async () => {
    usePreferences.setState({ hideValues: true });
    await renderWithProviders(<MoneyText cents={125050} />);
    expect(screen.getByText('R$ ••••••')).toBeOnTheScreen();
    expect(screen.queryByText('R$ 1.250,50')).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Valor oculto')).toBeOnTheScreen();
  });

  it('despesa aparece negativa e receita positiva', async () => {
    await renderWithProviders(
      <>
        <TransactionAmountText cents={2390} type="EXPENSE" />
        <TransactionAmountText cents={720000} type="INCOME" />
      </>,
    );
    expect(screen.getByText('- R$ 23,90')).toBeOnTheScreen();
    expect(screen.getByText('+ R$ 7.200,00')).toBeOnTheScreen();
  });
});
