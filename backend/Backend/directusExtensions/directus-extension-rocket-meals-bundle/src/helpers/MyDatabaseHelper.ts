import {ApiContext} from "./ApiContext";

import {CashregisterHelper} from "./itemServiceHelpers/CashregisterHelper";
import {ItemsServiceHelper} from "./ItemsServiceHelper";
import {CollectionNames} from "./CollectionNames";
import {
    Apartments,
    AppFeedbacks,
    Buildings,
    Canteens,
    CanteensFeedbacksLabels,
    CanteensFeedbacksLabelsEntries,
    CollectionsDatesLastUpdate,
    Devices,
    DirectusUsers,
    Foodoffers,
    FoodoffersCategories,
    Foods,
    FoodsAttributes,
    FoodsCategories,
    FoodsFeedbacks,
    FoodsFeedbacksLabels,
    FoodsFeedbacksLabelsEntries,
    FormAnswers,
    FormExtracts,
    FormExtractsFormFields,
    FormFields,
    Forms,
    FormSubmissions,
    Mails,
    MailsFiles,
    Markings,
    MarkingsExclusions,
    News,
    Profiles,
    PushNotifications,
    UtilizationsEntries,
    UtilizationsGroups,
    Washingmachines,
    WashingmachinesJobs,
    Workflows
} from "../databaseTypes/types";
import {ServerServiceCreator} from "./ItemsServiceCreator";
import {AppSettingsHelper} from "./itemServiceHelpers/AppSettingsHelper";
import {AutoTranslationSettingsHelper} from "./itemServiceHelpers/AutoTranslationSettingsHelper";
import {WorkflowsRunHelper} from "./itemServiceHelpers/WorkflowsRunHelper";
import {FilesServiceHelper} from "./FilesServiceHelper";
import {EventContext as ExtentContextDirectusTypes, SchemaOverview} from "@directus/types";
import {EventContext as EventContextForFlows} from "@directus/extensions/node_modules/@directus/types/dist/events";
import {ShareServiceHelper} from "./ShareServiceHelper";
import {MyDatabaseHelperInterface} from "./MyDatabaseHelperInterface";
import {EnvVariableHelper} from "./EnvVariableHelper";
import ms from "ms";
import jwt from 'jsonwebtoken';
import {NanoidHelper} from "./NanoidHelper";

export class MyDatabaseHelper implements MyDatabaseHelperInterface {

    public apiContext: ApiContext;
    public eventContext: ExtentContextDirectusTypes | undefined;
    public useLocalServerMode: boolean = false;

    constructor(apiContext: ApiContext, eventContext?: EventContextForFlows) {
        this.apiContext = apiContext;
        // if available we should use eventContext - https://github.com/directus/directus/discussions/11051
        this.eventContext = eventContext as any as ExtentContextDirectusTypes; // stupid typescript error, because of the import
        // its better to use the eventContext, because of reusing the database connection instead of creating a new one
    }

    async getSchema(): Promise<SchemaOverview> {
        if(this?.eventContext?.schema){
            return this.eventContext.schema;
        } else {
            return await this.apiContext.getSchema();
        }
    }

    async getAdminBearerToken(): Promise<string | undefined> {
        let usersHelper = await this.getUsersHelper();
        let adminEmail = EnvVariableHelper.getAdminEmail();
        let adminUser = await usersHelper.findFirstItem({
            email: adminEmail,
            provider: "default",
        })
        const secret = EnvVariableHelper.getSecret();
        if(!adminUser){
            console.error("Admin user not found")
            return undefined;
        }

        const refreshToken = await NanoidHelper.getNanoid(64);
        const msRefreshTokenTTL: number = ms(String(EnvVariableHelper.getRefreshTTL())) || 0;
        const refreshTokenExpiration = new Date(Date.now() + msRefreshTokenTTL);

        let knex = this.apiContext.database;

        // Insert session into Directus
        await knex('directus_sessions').insert({
            token: refreshToken,
            user: adminUser.id, // Required, cannot be NULL
            expires: refreshTokenExpiration,
            ip: null,
            user_agent: null,
            origin: null,
        });

        // JWT payload
        const tokenPayload = {
            id: adminUser.id,
            role: adminUser.role,
            app_access: true,
            admin_access: true,
            session: refreshToken, // Attach the session
        };

        // Sign JWT with Directus secret
        // @ts-ignore - this is a workaround for the typescript error
        const accessToken = jwt.sign(tokenPayload, secret, {
            expiresIn: EnvVariableHelper.getAccessTokenTTL(),
            issuer: 'directus',
        });

        return `${accessToken}`;

    }

    async getServerInfo() {
        const serverServiceCreator = new ServerServiceCreator(this.apiContext);
        return await serverServiceCreator.getServerInfo();
    }

    getServerUrl(): string {
        let defaultServerUrl = 'http://127.0.0.1:8055'; // https://github.com/directus/directus/blob/9bd3b2615bb6bc5089ffcf14d141406e7776dd0e/docs/self-hosted/quickstart.md?plain=1#L97
        // https://github.com/directus/directus/blob/9bd3b2615bb6bc5089ffcf14d141406e7776dd0e/app/vite.config.js#L64
        if(this.useLocalServerMode){
            return defaultServerUrl;
        }

        return EnvVariableHelper.getEnvVariable("PUBLIC_URL") || defaultServerUrl;
    }

    getServerPort(): string {
        let defaultServerPort = "8055";
        return EnvVariableHelper.getEnvVariable("PORT") || defaultServerPort;
    }

    getAppSettingsHelper() {
        return new AppSettingsHelper(this.apiContext);
    }

    getAutoTranslationSettingsHelper() {
        return new AutoTranslationSettingsHelper(this.apiContext);
    }

    getAppFeedbacksHelper() {
        return new ItemsServiceHelper<AppFeedbacks>(this, CollectionNames.APP_FEEDBACKS);
    }

    getCashregisterHelper() {
        return new CashregisterHelper(this);
    }

    getCollectionDatesLastUpdateHelper() {
        return new ItemsServiceHelper<CollectionsDatesLastUpdate>(this, CollectionNames.COLLECTIONS_DATES_LAST_UPDATE);
    }

    getFoodFeedbacksHelper() {
        return new ItemsServiceHelper<FoodsFeedbacks>(this, CollectionNames.FOODS_FEEDBACKS);
    }

    getFoodsHelper() {
        return new ItemsServiceHelper<Foods>(this, CollectionNames.FOODS);
    }

    getFoodFeedbackLabelsHelper() {
        return new ItemsServiceHelper<FoodsFeedbacksLabels>(this, CollectionNames.FOODS_FEEDBACK_LABELS);
    }

    getFoodsCategoriesHelper() {
        return new ItemsServiceHelper<FoodsCategories>(this, CollectionNames.FOODS_CATEGORIES);
    }

    getFoodsAttributesHelper() {
        return new ItemsServiceHelper<FoodsAttributes>(this, CollectionNames.FOODS_ATTRIBUTES);
    }

    getFoodFeedbackLabelEntriesHelper() {
        return new ItemsServiceHelper<FoodsFeedbacksLabelsEntries>(this, CollectionNames.FOODS_FEEDBACKS_LABELS_ENTRIES);
    }

    getCanteenFeedbackLabelsHelper() {
        return new ItemsServiceHelper<CanteensFeedbacksLabels>(this, CollectionNames.CANTEENS_FEEDBACK_LABELS);
    }

    getCanteenFeedbackLabelsEntriesHelper() {
        return new ItemsServiceHelper<CanteensFeedbacksLabelsEntries>(this, CollectionNames.CANTEENS_FEEDBACKS_LABELS_ENTRIES);
    }

    getFormsHelper() {
        return new ItemsServiceHelper<Forms>(this, CollectionNames.FORMS);
    }

    getFormExtractsHelper() {
        return new ItemsServiceHelper<FormExtracts>(this, CollectionNames.FORM_EXTRACTS);
    }

    getFormExtractFormFieldsHelper() {
        return new ItemsServiceHelper<FormExtractsFormFields>(this, CollectionNames.FORM_EXTRACTS_FORM_FIELDS);
    }

    getFormsFieldsHelper() {
        return new ItemsServiceHelper<FormFields>(this, CollectionNames.FORM_FIELDS);
    }

    getFormsSubmissionsHelper() {
        return new ItemsServiceHelper<FormSubmissions>(this, CollectionNames.FORM_SUBMISSIONS);
    }

    getFormsAnswersHelper() {
        return new ItemsServiceHelper<FormAnswers>(this, CollectionNames.FORM_ANSWERS);
    }

    getFoodoffersHelper() {
        return new ItemsServiceHelper<Foodoffers>(this, CollectionNames.FOODOFFERS);
    }

    getFoodofferCategoriesHelper() {
        return new ItemsServiceHelper<FoodoffersCategories>(this, CollectionNames.FOODOFFER_CATEGORIES);
    }

    getDevicesHelper() {
        return new ItemsServiceHelper<Devices>(this, CollectionNames.DEVICES);
    }

    getPushNotificationsHelper() {
        return new ItemsServiceHelper<PushNotifications>(this, CollectionNames.PUSH_NOTIFICATIONS);
    }

    getProfilesHelper() {
        return new ItemsServiceHelper<Profiles>(this, CollectionNames.PROFILES);
    }

    getMarkingsHelper() {
        return new ItemsServiceHelper<Markings>(this, CollectionNames.MARKINGS);
    }

    getMarkingsExclusionsHelper() {
        return new ItemsServiceHelper<MarkingsExclusions>(this, CollectionNames.MARKINGS_EXCLUSIONS);
    }

    getCanteensHelper() {
        return new ItemsServiceHelper<Canteens>(this, CollectionNames.CANTEENS);
    }

    getApartmentsHelper() {
        return new ItemsServiceHelper<Apartments>(this, CollectionNames.APARTMENTS);
    }

    getBuildingsHelper() {
        return new ItemsServiceHelper<Buildings>(this, CollectionNames.BUILDINGS);
    }

    getNewsHelper() {
        return new ItemsServiceHelper<News>(this, CollectionNames.NEWS);
    }

    getUsersHelper() {
        return new ItemsServiceHelper<DirectusUsers>(this, CollectionNames.USERS);
    }

    getShareServiceHelper() {
        return new ShareServiceHelper(this);
    }

    getUtilizationEntriesHelper() {
        return new ItemsServiceHelper<UtilizationsEntries>(this, CollectionNames.UTILIZATION_ENTRIES);
    }

    getUtilizationGroupsHelper() {
        return new ItemsServiceHelper<UtilizationsGroups>(this, CollectionNames.UTILIZATION_GROUPS);
    }

    getWashingmachinesHelper() {
        return new ItemsServiceHelper<Washingmachines>(this, CollectionNames.WASHINGMACHINES);
    }

    getWashingmachinesJobsHelper() {
        return new ItemsServiceHelper<WashingmachinesJobs>(this, CollectionNames.WASHINGMACHINES_JOBS);
    }

    getWorkflowsHelper() {
        return new ItemsServiceHelper<Workflows>(this, CollectionNames.WORKFLOWS);
    }

    getWorkflowsRunsHelper() {
        return new WorkflowsRunHelper(this, CollectionNames.WORKFLOWS_RUNS);
    }

    getItemsServiceHelper<T>(collectionName: CollectionNames) {
        return new ItemsServiceHelper<T>(this, collectionName);
    }

    async sendMail(mail: Partial<Mails>) {
        let mailsHelper = this.getMailsHelper();
        return await mailsHelper.createOne(mail);
    }

    getMailsHelper() {
        return new ItemsServiceHelper<Mails>(this, CollectionNames.MAILS);
    }

    getMailsFilesHelper() {
        return new ItemsServiceHelper<MailsFiles>(this, CollectionNames.MAILS_FILES);
    }

    getFilesHelper(){
        return new FilesServiceHelper(this);
    }

}
