import { DatabaseTypes } from 'repo-depkit-common';

export type ApartmentsWithFieldsOmited = Omit<DatabaseTypes.Apartments, 'id' | 'created_on' | 'updated_on' | 'user_created' | 'user_updated' | 'washingmachines' | 'building' | 'sort' | 'status'> & {
  external_identifier: string;
};

export type ApartmentsForParser = {
  basicData: ApartmentsWithFieldsOmited;
  buildingData: {
    external_identifier: string;
    url?: string;
    alias?: string;
    image_remote_url?: string;
    year_of_construction?: number | null;
  };
};

export interface ApartmentParserInterface {
  getApartmentList(): Promise<ApartmentsForParser[]>;
}
