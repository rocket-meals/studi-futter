import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import CustomStackHeader from '@/components/CustomStackHeader/CustomStackHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';
import { AppSettings, Markings, MarkingsGroups } from '@/constants/types';
import { MarkingGroupsHelper } from '@/redux/actions/MarkingGroups/MarkingGroups';
import { MarkingHelper } from '@/redux/actions/Markings/Markings';
import { useDispatch, useSelector } from 'react-redux';
import { SET_APP_SETTINGS, UPDATE_MARKINGS } from '@/redux/Types/types';
import { RootState } from '@/redux/reducer';
import { ActivityIndicator, View } from 'react-native';
import { AppSettingsHelper } from '@/redux/actions/AppSettings/AppSettings';

export default function MonitorLayout() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { translate } = useLanguage();
  const markingHelper = new MarkingHelper();
  const appSettingsHelper = new AppSettingsHelper();
  const markingGroupsHelper = new MarkingGroupsHelper();
  const [loading, setLoading] = useState(true);
  const { markings } = useSelector((state: RootState) => state.food);
  const { appSettings } = useSelector((state: RootState) => state.settings);

  const getMarkings = async () => {
    const markingResult = (await markingHelper.fetchMarkings({})) as Markings[];
    const markingGroupResult = (await markingGroupsHelper.fetchMarkingGroups(
      {}
    )) as MarkingsGroups[];

    // Normalize sort values to ensure undefined, null, or empty values don't break sorting
    const normalizeSort = (value: any) =>
      value === undefined || value === null || value === '' ? Infinity : value;

    // Sort marking groups by their "sort" field
    const sortedGroups = [...markingGroupResult].sort(
      (a, b) => normalizeSort(a.sort) - normalizeSort(b.sort)
    );

    // Create a map for quick lookup of each marking's group
    const markingToGroupMap = new Map<string, MarkingsGroups>();
    sortedGroups.forEach((group) => {
      group.markings.forEach((markingId) => {
        markingToGroupMap.set(markingId, group);
      });
    });

    // Helper function to get group sort value
    const getGroupSort = (marking: Markings): number => {
      const group = markingToGroupMap.get(marking.id);
      return normalizeSort(group?.sort);
    };

    // Helper function to get marking's own sort value
    const getMarkingSort = (marking: Markings): number => {
      return normalizeSort(marking.sort);
    };

    // Sort markings based on the specified criteria
    const sortedMarkings = [...markingResult].sort((a, b) => {
      const groupSortA = getGroupSort(a);
      const groupSortB = getGroupSort(b);

      // First, compare group sorts
      if (groupSortA !== groupSortB) {
        return groupSortA - groupSortB;
      }

      // If both markings belong to the same group, sort by their "sort" value
      const markingSortA = getMarkingSort(a);
      const markingSortB = getMarkingSort(b);

      if (markingSortA !== markingSortB) {
        return markingSortA - markingSortB;
      }

      // If no sort values exist, sort alphabetically by alias
      return (a.alias || '').localeCompare(b.alias || '');
    });

    dispatch({ type: UPDATE_MARKINGS, payload: sortedMarkings });
  };

  const getAppSettings = async () => {
    const result = (await appSettingsHelper.fetchAppSettings(
      {}
    )) as AppSettings;
    if (result) {
      dispatch({ type: SET_APP_SETTINGS, payload: result });
    }
  };

  const getAllData = async () => {
    const tasks: Promise<any>[] = [];

    if (!markings?.length) tasks.push(getMarkings());
    if (!Object.keys(appSettings || {}).length) tasks.push(getAppSettings());

    if (tasks.length === 0) {
      setLoading(false);
      return;
    }

    try {
      await Promise.allSettled(tasks);
    } catch (err) {
      console.error('Error in loading layout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          height: 200,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size={30} color={theme.screen.text} />
      </View>
    );
  }

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
