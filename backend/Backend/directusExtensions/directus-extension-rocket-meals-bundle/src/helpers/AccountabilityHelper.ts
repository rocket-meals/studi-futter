import {Accountability} from "@directus/types";

/**
 * Helper for Account things
 */
export class AccountabilityHelper {
    public static getAccountabilityFromRequest(req: any): Accountability | undefined {
        // @ts-ignore
        const accountability = req?.accountability;
        if(accountability){
            return accountability as Accountability;
        } else {
            return undefined;
        }
    }
}