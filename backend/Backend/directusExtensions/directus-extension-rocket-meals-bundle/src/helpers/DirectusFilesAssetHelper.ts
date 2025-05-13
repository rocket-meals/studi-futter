import {DirectusFiles} from "../databaseTypes/types";
import {MyDatabaseTestableHelperInterface} from "./MyDatabaseHelperInterface";

export type DirectusFilesAssetHelperOptions = {
    bearerToken?: string | null | undefined,
}

export class DirectusFilesAssetHelper {

    private static getAssetUrl(serverUrl: string, directusFileId: string): string {
        return `${serverUrl}/assets/${directusFileId}`;
    }

    public static getDirectAssetUrlByObjectOrId(
        directusFile: DirectusFiles | string,
        myDatabaseTestableHelperInterface: MyDatabaseTestableHelperInterface,
    ): string {
        if (typeof directusFile === "string") {
            return DirectusFilesAssetHelper.getDirectAssetUrlById(directusFile, myDatabaseTestableHelperInterface);
        } else {
            return DirectusFilesAssetHelper.getDirectAssetUrl(directusFile, myDatabaseTestableHelperInterface);
        }
    }

    /**
     * Access only if permission is granted for the file
     * @param directusFile
     */
    public static getDirectAssetUrl(directusFile: DirectusFiles, myDatabaseTestableHelperInterface: MyDatabaseTestableHelperInterface): string {
        return DirectusFilesAssetHelper.getDirectAssetUrlById(directusFile.id, myDatabaseTestableHelperInterface);
    }

    public static getDirectAssetUrlById(directusFileId: string, myDatabaseTestableHelperInterface: MyDatabaseTestableHelperInterface): string {
        let publicServerUrl = myDatabaseTestableHelperInterface.getServerUrl();
        return DirectusFilesAssetHelper.getAssetUrl(publicServerUrl, directusFileId);
    }

}