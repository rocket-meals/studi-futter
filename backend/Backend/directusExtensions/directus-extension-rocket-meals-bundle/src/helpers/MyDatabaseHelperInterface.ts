import {ApiContext} from "./ApiContext";
import {EventContext as ExtentContextDirectusTypes} from "@directus/types";
import {ItemsServiceHelper} from "./ItemsServiceHelper";
import {CustomDirectusTypes, DirectusUsers} from "../databaseTypes/types";
import {ServerInfo} from "./ItemsServiceCreator";
import {createDirectus, rest, serverInfo} from "@directus/sdk";

export interface MyDatabaseTestableHelperInterface {
    getServerInfo(): Promise<ServerInfo>;
    getServerUrl(): string;
    getServerPort(): string;
    getAdminBearerToken(): Promise<string | undefined>;
}

export class MyDatabaseTestableHelper implements MyDatabaseTestableHelperInterface {
    private cachedServerInfo: ServerInfo | undefined = undefined;
    private cachedClient: any | undefined = undefined;
    public useOfflineServerInfo: boolean = false;

    getServerUrl(): string {
        return 'https://test.rocket-meals.de/rocket-meals/api';
    }

    async getServerInfo(): Promise<ServerInfo> {
        if(!this.useOfflineServerInfo){
            if(!this.cachedServerInfo){
                this.cachedServerInfo = await this.downloadServerInfo();
            }
            if(this.cachedServerInfo){
                return this.cachedServerInfo;
            }
        }
        return this.getServerInfoNoInternetTest();
    }

    async getServerInfoNoInternetTest(): Promise<ServerInfo> {
        return {
            project: {
                project_name: 'Rocket Meals',
                project_color: '#D14610',
                project_logo: undefined,
            }
        };
    }


    getServerPort(): string {
        return "8055";
    }

    public getPublicClient(){
        if(!this.cachedClient){
            this.cachedClient = createDirectus<CustomDirectusTypes>(this.getServerUrl()).with(rest());
        }
        return this.cachedClient;
    }

    async downloadServerInfo(): Promise<ServerInfo> {
        return await this.getPublicClient().request(serverInfo());
    }

    async getAdminBearerToken(): Promise<string | undefined> {
        return undefined;
    }
}

export interface MyDatabaseHelperInterface extends MyDatabaseTestableHelperInterface {

    apiContext: ApiContext;
    eventContext: ExtentContextDirectusTypes | undefined;

    getUsersHelper(): ItemsServiceHelper<DirectusUsers>;

}
