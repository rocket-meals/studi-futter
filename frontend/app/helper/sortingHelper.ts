import { Foodoffers, Foods, Markings, MarkingsGroups } from "@/constants/types";
import { getFoodName, isRatingNegative, isRatingPositive } from "./resourceHelper";

export function sortByFoodName(foodOffers: Foodoffers[], languageCode: string) {
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
    return foodOffers;
  }

  // Working Own Favorite Sorting
export function sortByOwnFavorite(foodOffers: Foodoffers[], ownFeedBacks: any) {
    const feedbackMap = new Map(
      ownFeedBacks.map((feedback: any) => [feedback.food, feedback.rating])
    );
    return foodOffers.sort((a, b) => {
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
  }

  // Working Public Favorite Sorting
export function sortByPublicFavorite(foodOffers: Foodoffers[]) {
    foodOffers.sort((a, b) => {
      const aFood: Foods = a.food || {};
      const bFood: Foods = b.food || {};
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

    return foodOffers;
  }


export function sortByEatingHabits(foodOffers: Foodoffers[], profileMarkingsData: any) {
    const profileMarkingsMap = new Map(
      profileMarkingsData?.map((marking: any) => [marking.markings_id, marking])
    );
    foodOffers.sort((a, b) => {
      const calculateSortValue = (foodOffer: Foodoffers) => {
        let sortValue = 0;
        const likeSortWeight = 1;
        const dislikeSortWeight = likeSortWeight * 2;

        if (foodOffer?.markings) {
          foodOffer.markings.forEach((marking) => {
            const profileMarking = profileMarkingsMap.get(marking.markings_id);

            if (profileMarking) {
              if (profileMarking.like === true) {
                sortValue += likeSortWeight;
              } else if (profileMarking.like === false) {
                sortValue -= dislikeSortWeight;
              }
            }
          });
        }

        return sortValue;
      };

      const aSortValue = calculateSortValue(a);
      const bSortValue = calculateSortValue(b);

      // Sort in descending order of sort value (higher preference first)
      return bSortValue - aSortValue;
    });

    return foodOffers;
  }


export function sortMarkingsByGroup(markings: Markings[], markingGroups: MarkingsGroups[]): Markings[] {
  if (!markings || !markingGroups) {
    return markings || [];
  }

  // Normalize sort values to ensure undefined, null, or empty values don't break sorting
  const normalizeSort = (value: any) =>
    value === undefined || value === null || value === ''
      ? Infinity
      : value;

  // Sort marking groups by their "sort" field
  const sortedGroups = [...markingGroups].sort(
    (a, b) => normalizeSort(a.sort) - normalizeSort(b.sort)
  );

  // Create a map for quick lookup of each marking's group
  const markingToGroupMap = new Map<string, MarkingsGroups>();
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
  const getGroupSort = (marking: Markings): number => {
    const group = markingToGroupMap.get(marking.id);
    return normalizeSort(group?.sort);
  };

  // Helper function to get marking's own sort value
  const getMarkingSort = (marking: Markings): number => {
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

export function intelligentSort(foodOffers, ownFeedbacks, profileMarkings, languageCode) {
  return foodOffers.sort((a, b) => {
    // 1. Sort by Eating Habits
    const calculateSortValue = (foodOffer) => {
      let sortValue = 0;
      const likeSortWeight = 1;
      const dislikeSortWeight = likeSortWeight * 2;

      if (foodOffer?.markings) {
        foodOffer.markings.forEach((marking) => {
          const profileMarking = profileMarkings?.find(
            (mark) => mark.markings_id === marking.markings_id
          );

          if (profileMarking) {
            if (profileMarking.like === true) {
              sortValue += likeSortWeight;
            } else if (profileMarking.like === false) {
              sortValue -= dislikeSortWeight;
            }
          }
        });
      }
      return sortValue;
    };

    const aSortValue = calculateSortValue(a);
    const bSortValue = calculateSortValue(b);

    if (aSortValue !== bSortValue) {
      return bSortValue - aSortValue; // Descending order
    }

    // 2. Sort by Own Ratings
    const feedbackMap = new Map(
      ownFeedbacks.map((feedback) => [feedback.food, feedback.rating])
    );

    const getCategory = (rating) => {
      if (isRatingNegative(rating)) return 3; // Lowest priority
      if (rating === null || rating === undefined) return 2; // Unknown priority
      if (isRatingPositive(rating)) return 1; // Highest priority
      return 0; // Fallback, if needed
    };

    const aRating = feedbackMap.get(a?.food?.id) ?? null;
    const bRating = feedbackMap.get(b?.food?.id) ?? null;

    const aCategory = getCategory(aRating);
    const bCategory = getCategory(bRating);

    if (aCategory !== bCategory) {
      return aCategory - bCategory; // Ascending order
    }

    // 3. Sort by Public Ratings
    const publicRatingA = a.food?.rating_average || 0;
    const publicRatingB = b.food?.rating_average || 0;

    if (publicRatingA !== publicRatingB) {
      return publicRatingB - publicRatingA; // Descending order
    }

    // 4. Sort Alphabetically
    const nameA = getFoodName(a.food, languageCode);
    const nameB = getFoodName(b.food, languageCode);

    return nameA.localeCompare(nameB);
  });
}
