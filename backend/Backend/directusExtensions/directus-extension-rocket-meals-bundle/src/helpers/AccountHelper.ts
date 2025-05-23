/**
 * Helper for Account things
 */
export class AccountHelper {
    /**
     * Set the accountablility to admin
     * @param accountability the given accountability
     * @returns {any} a copy of the accountability with admin permission
     */
    static getAdminAccountability(accountability: any) {
        const adminAccountAbility = JSON.parse(JSON.stringify(accountability)); //make a copy !
        adminAccountAbility.admin = true; //usefull if we realy want to upload something as admin
        return adminAccountAbility;
    }
}
