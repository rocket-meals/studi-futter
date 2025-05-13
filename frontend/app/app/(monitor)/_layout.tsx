import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import CustomStackHeader from '@/components/CustomStackHeader/CustomStackHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';

export default function MonitorLayout() {
  const { theme } = useTheme();
  const { translate } = useLanguage();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.header.background },
        headerTintColor: theme.header.text,
      }}
    >
      <Stack.Screen
        name='statistics/index'
        options={{
          title: 'statistics',
          header: () => (
            <CustomStackHeader label={'Statistics'} key={'statistics'} />
          ),
        }}
      />
      <Stack.Screen
        name='foodPlanWeek/index'
        options={{
          title: 'FoodPlan:Week',
          header: () => (
            <CustomStackHeader
              label={translate(TranslationKeys.Food_Plan_Week)}
              key={'foodPlanWeek'}
            />
          ),
        }}
      />
      <Stack.Screen
        name='list-week-screen'
        options={{
          title: 'list-week-screen',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='foodPlanDay/index'
        options={{
          header: () => (
            <CustomStackHeader
              label={translate(TranslationKeys.food_Plan_Day)}
              key={'foodPlanDay'}
            />
          ),
        }}
      />
      <Stack.Screen
        name='bigScreen/index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='foodPlanList/index'
        options={{
          title: 'foodPlan:List',
          header: () => (
            <CustomStackHeader
              label={translate(TranslationKeys.Food_Plan_List)}
              key={'foodPlanList'}
            />
          ),
        }}
      />
      <Stack.Screen
        name='list-day-screen/index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='labels/index'
        options={{
          title: 'Labels',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
