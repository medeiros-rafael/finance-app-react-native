import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';

import { FinanceTabBar } from '@/components/navigation/finance-tab-bar';
import { AddActionSheet } from '@/components/transactions/add-action-sheet';

export default function TabsLayout() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, animation: 'shift' }}
        tabBar={(props) => <FinanceTabBar {...props} onAddPress={() => setAddOpen(true)} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="statement" />
        <Tabs.Screen name="accounts" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <AddActionSheet
        visible={addOpen}
        onDismiss={() => setAddOpen(false)}
        onAddTransaction={(type) => router.push({ pathname: '/transaction/new', params: { type } })}
        onTransfer={() => router.push('/transfer')}
      />
    </>
  );
}
