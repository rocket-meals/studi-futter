import { Foods } from '@/constants/types';

export interface FeedbacksProps {
  foodDetails: Foods;
  canteenId?: string;
  offerId: string;
}
