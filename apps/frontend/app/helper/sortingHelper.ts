import { DatabaseTypes } from 'repo-depkit-common';

export const normalizeSort = (value: any): number => {
  return value === undefined || value === null || value === "" ? Infinity : value;
};

export const sortBySortField = <T extends { sort?: number | null }>(
    items: T[]
): T[] => {
  console.log('sortBySortField - before', JSON.parse(JSON.stringify(items)));
  const withSort: T[] = [];
  const withoutSort: T[] = [];

  for (const item of items) {
    if (item.sort === undefined || item.sort === null) {
      withoutSort.push(item);
    } else {
      withSort.push(item);
    }
  }

  withSort.sort((a, b) => (a.sort! as number) - (b.sort! as number));

  const result = [...withSort, ...withoutSort];
  console.log('sortBySortField - after', JSON.parse(JSON.stringify(result)));
  return result;
};

import { getFoodName, isRatingNegative, isRatingPositive } from "./resourceHelper";

export function sortByFoodName(foodOffers: DatabaseTypes.Foodoffers[], languageCode: string) {
  console.log('sortByFoodName - before', JSON.parse(JSON.stringify(foodOffers)));
    foodOffers.sort((a, b) => {
      let nameA = getFoodName(a.food, languageCode);
      let nameB = getFoodName(b.food, languageCode);
      if (nameA && nameB) {
        return nameA.localeCompare(nameB);
      } else if (nameA) {
        return -1;
      } else if (nameB) {
        return 1;
      }
    });
  console.log('sortByFoodName - after', JSON.parse(JSON.stringify(foodOffers)));
  return foodOffers;
}

export function sortByFoodCategory(
  foodOffers: DatabaseTypes.Foodoffers[],
  categories: DatabaseTypes.FoodsCategories[],
    languageCode: string
) {
  console.log('sortByFoodCategory - before', JSON.parse(JSON.stringify(foodOffers)));
  // 1) Alphabetisch (am wenigsten wichtig)
    sortByFoodName(foodOffers, languageCode);

    // 2) Food Categories
    sortByFoodCategoryOnly(foodOffers, categories);
  console.log('sortByFoodCategory - after', JSON.parse(JSON.stringify(foodOffers)));

    return foodOffers;
}

export function sortByFoodCategoryOnly(
    foodOffers: DatabaseTypes.Foodoffers[],
    categories: DatabaseTypes.FoodsCategories[]
) {
  console.log('sortByFoodCategoryOnly - before', JSON.parse(JSON.stringify(foodOffers)));
  const sortMap = new Map<string, number>();
  categories.forEach((cat) => {
    if (cat.id) {
      sortMap.set(cat.id, normalizeSort(cat.sort));
    }
  });

  foodOffers = foodOffers.sort((a, b) => {
    const aId =
        typeof (a.food as any)?.food_category === 'object'
            ? (a.food as any)?.food_category?.id
            : (a.food as any)?.food_category;
    const bId =
        typeof (b.food as any)?.food_category === 'object'
            ? (b.food as any)?.food_category?.id
            : (b.food as any)?.food_category;

    const aSort = sortMap.has(aId as string)
        ? (sortMap.get(aId as string) as number)
        : Infinity;
    const bSort = sortMap.has(bId as string)
        ? (sortMap.get(bId as string) as number)
        : Infinity;
    return aSort - bSort;
  });
  console.log('sortByFoodCategoryOnly - after', JSON.parse(JSON.stringify(foodOffers)));
}

export function sortByFoodOfferCategory(
  foodOffers: DatabaseTypes.Foodoffers[],
  categories: DatabaseTypes.FoodoffersCategories[],
    languageCode: string
) {
    console.log('sortByFoodOfferCategory - before', JSON.parse(JSON.stringify(foodOffers)));
    // 1) Alphabetisch (am wenigsten wichtig)
    sortByFoodName(foodOffers, languageCode);

    // 2) Food Offer Categories
    sortByFoodOfferCategoryOnly(foodOffers, categories);
    console.log('sortByFoodOfferCategory - after', JSON.parse(JSON.stringify(foodOffers)));

    return foodOffers;
}

export function sortByFoodOfferCategoryOnly(
    foodOffers: DatabaseTypes.Foodoffers[],
    categories: DatabaseTypes.FoodoffersCategories[]
) {
  console.log('sortByFoodOfferCategoryOnly - before', JSON.parse(JSON.stringify(foodOffers)));
  const sortMap = new Map<string, number>();
  categories.forEach((cat) => {
    if (cat.id) {
      sortMap.set(cat.id, normalizeSort(cat.sort));
    }
  });

  foodOffers = foodOffers.sort((a, b) => {
    const aId =
        typeof a.foodoffer_category === 'object'
            ? (a.foodoffer_category as any)?.id
            : a.foodoffer_category;
    const bId =
        typeof b.foodoffer_category === 'object'
            ? (b.foodoffer_category as any)?.id
            : b.foodoffer_category;

    const aSort = sortMap.has(aId as string)
        ? (sortMap.get(aId as string) as number)
        : Infinity;
    const bSort = sortMap.has(bId as string)
        ? (sortMap.get(bId as string) as number)
        : Infinity;
    return aSort - bSort;
  });
  console.log('sortByFoodOfferCategoryOnly - after', JSON.parse(JSON.stringify(foodOffers)));
}

  // Working Own Favorite Sorting
export function sortByOwnFavorite(foodOffers: DatabaseTypes.Foodoffers[], ownFeedBacks: any) {
    console.log('sortByOwnFavorite - before', JSON.parse(JSON.stringify(foodOffers)));
    const feedbackMap = new Map(
      ownFeedBacks.map((feedback: any) => [feedback.food, feedback.rating])
    );
  foodOffers = foodOffers.sort((a, b) => {
      const aRating = feedbackMap.get(a?.food?.id) ?? null;
      const bRating = feedbackMap.get(b?.food?.id) ?? null;

      const getCategory = (rating: any) => {
        if (isRatingNegative(rating)) return 3; // Lowest priority
        if (rating === null || rating === undefined) return 2; // Unknown priority
        if (isRatingPositive(rating)) return 1; // Highest priority
        return 0; // Fallback, if needed
      };

      const aCategory = getCategory(aRating);
      const bCategory = getCategory(bRating);

      return aCategory - bCategory;
    });
    
    console.log('sortByOwnFavorite - after', JSON.parse(JSON.stringify(foodOffers)));
    return foodOffers;
  }

  // Working Public Favorite Sorting
export function sortByPublicFavorite(foodOffers: DatabaseTypes.Foodoffers[]) {
    console.log('sortByPublicFavorite - before', JSON.parse(JSON.stringify(foodOffers)));
    foodOffers.sort((a, b) => {
      const aFood: DatabaseTypes.Foods = a.food || {};
      const bFood: DatabaseTypes.Foods = b.food || {};
      const getRatingCategory = (rating: number | null | undefined) => {
        if (isRatingNegative(rating)) return "negative";
        if (rating === null || rating === undefined) return "null";
        if (isRatingPositive(rating)) return "positive";
        return "unknown"; // Fallback for unexpected cases
      };

      const aCategory = getRatingCategory(aFood?.rating_average);
      const bCategory = getRatingCategory(bFood?.rating_average);

      const priorityOrder = ["positive", "unknown", "null", "negative",];

      const aPriority = priorityOrder.indexOf(aCategory);
      const bPriority = priorityOrder.indexOf(bCategory);

      return aPriority - bPriority;
    });

    console.log('sortByPublicFavorite - after', JSON.parse(JSON.stringify(foodOffers)));

    return foodOffers;
  }


export function sortByEatingHabits(
    foodOffers: DatabaseTypes.Foodoffers[],
    profileMarkingsData: any
) {
  console.log('sortByEatingHabits - before', JSON.parse(JSON.stringify(foodOffers)));

  const profileMarkingsMap = new Map(
      profileMarkingsData?.map((marking: any) => [marking.markings_id, marking])
  );

  const liked: DatabaseTypes.Foodoffers[] = [];
  const disliked: DatabaseTypes.Foodoffers[] = [];
  const neutral: DatabaseTypes.Foodoffers[] = [];

  for (const offer of foodOffers) {
    let isLiked = false;
    let isDisliked = false;

    if (offer?.markings) {
      for (const marking of offer.markings) {
        const profileMarking = profileMarkingsMap.get(marking.markings_id);

        if (profileMarking) {
          if (profileMarking.like === true) {
            isLiked = true;
          } else if (profileMarking.like === false) {
            isDisliked = true;
          }
        }
      }
    }

    if (isLiked) {
      liked.push(offer);
    } else if (isDisliked) {
      disliked.push(offer);
    } else {
      neutral.push(offer);
    }
  }

  const sorted = [...liked, ...neutral, ...disliked];

  console.log('sortByEatingHabits - after', JSON.parse(JSON.stringify(sorted)));

  return sorted;
}


export function sortMarkingsByGroup(markings: DatabaseTypes.Markings[], markingGroups: DatabaseTypes.MarkingsGroups[]): DatabaseTypes.Markings[] {
  if (!markings || !markingGroups) {
    return markings || [];
  }
  // Sort marking groups by their "sort" field
  const sortedGroups = sortBySortField(markingGroups);

  // Create a map for quick lookup of each marking's group
  const markingToGroupMap = new Map<string, DatabaseTypes.MarkingsGroups>();
  sortedGroups.forEach((group) => {
    group.markings.forEach((markingId) => {
      if (typeof markingId === 'string') {
        markingToGroupMap.set(markingId, group);
      } else if (markingId && typeof markingId === 'object' && 'id' in markingId) {
        markingToGroupMap.set(markingId.id, group);
      }
    });
  });

  // Helper function to get group sort value
  const getGroupSort = (marking: DatabaseTypes.Markings): number => {
    const group = markingToGroupMap.get(marking.id);
    return normalizeSort(group?.sort);
  };

  // Helper function to get marking's own sort value
  const getMarkingSort = (marking: DatabaseTypes.Markings): number => {
    return normalizeSort(marking.sort);
  };

  // Sort markings based on the specified criteria
  return [...markings].sort((a, b) => {
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
}

export function intelligentSort(
    foodOffers: DatabaseTypes.Foodoffers[],
    ownFeedbacks: any[],
    profileMarkings: any[],
    languageCode: string,
    foodCategories: DatabaseTypes.FoodsCategories[] = [],
    foodOfferCategories: DatabaseTypes.FoodoffersCategories[] = []
) {
  console.log('intelligentSort - initial', JSON.parse(JSON.stringify(foodOffers)));
  // 1) Alphabetisch (am wenigsten wichtig)
  foodOffers = sortByFoodName(foodOffers, languageCode);
  console.log('intelligentSort - after sortByFoodName', JSON.parse(JSON.stringify(foodOffers)));

  // 2) Public Rating + Amount
  foodOffers = sortByPublicFavorite(foodOffers);
  console.log('intelligentSort - after sortByPublicFavorite', JSON.parse(JSON.stringify(foodOffers)));

  // 3) Food Offer Categories
  foodOffers = sortByFoodOfferCategoryOnly(foodOffers, foodOfferCategories);
  console.log('intelligentSort - after sortByFoodOfferCategoryOnly', JSON.parse(JSON.stringify(foodOffers)));

  // 4) Food Categories
  foodOffers = sortByFoodCategoryOnly(foodOffers, foodCategories);
  console.log('intelligentSort - after sortByFoodCategoryOnly', JSON.parse(JSON.stringify(foodOffers)));

  // 5) Own Feedbacks
  foodOffers = sortByOwnFavorite(foodOffers, ownFeedbacks);
  console.log('intelligentSort - after sortByOwnFavorite', JSON.parse(JSON.stringify(foodOffers)));

  // 6) Eating Habits (am wichtigsten)
  foodOffers = sortByEatingHabits(foodOffers, profileMarkings);
  console.log('intelligentSort - after sortByEatingHabits', JSON.parse(JSON.stringify(foodOffers)));

  return foodOffers;
}
