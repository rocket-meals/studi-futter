import {
    FileServiceCreator,
    FileServiceFileStream,
    FileServiceSteamType,
    FilesService,
    MutationOptions
} from "./ItemsServiceCreator";
import {ItemsServiceHelper} from "./ItemsServiceHelper";
import {CollectionNames} from "./CollectionNames";
import {PrimaryKey} from "@directus/types";
import {DirectusFiles} from "../databaseTypes/types";
import {AssetsService} from "@directus/api";
import {Readable} from "node:stream";
import type {Stat} from "@directus/storage";
import {CreateShareLinkOptionForDirectusFiles, ShareDirectusFileMethod, ShareServiceHelper} from "./ShareServiceHelper";
import { Buffer } from "node:buffer";
import {MyDatabaseHelperInterface} from "./MyDatabaseHelperInterface";

export enum MyFileTypes {
    PDF = "application/pdf",
    PNG = "image/png",
    JPEG = "image/jpeg",
    JPG = "image/jpg",
    JSON = "application/json",
    CSV = "text/csv",
    TXT = "text/plain",
}

export class FilesServiceHelper extends ItemsServiceHelper<DirectusFiles> implements FilesService, ShareDirectusFileMethod {

    constructor(myDatabaseHelper: MyDatabaseHelperInterface) {
        super(myDatabaseHelper, CollectionNames.DIRECTUS_FILES);
    }

    protected override async getItemsService(){
        const filesServiceCreator = new FileServiceCreator(this.apiContext, this.eventContext);
        let filesService = await filesServiceCreator.getFileService();
        return filesService;
    }

    public static sanitizeFilename(filename: string): string {
        // Replace any invalid characters with underscores
        filename = filename.replace(/[^a-zA-Z0-9-_\.]/g, '_');
        // Limit the filename length to 255 characters
        if (filename.length > 255) {
            filename = filename.substring(0, 255);
        }
        // if empty, set to "filename_download"
        if (filename.length === 0) {
            filename = "filename_download";
        }
        return filename;
    }

    async uploadOneFromBuffer(buffer: Buffer, filename: string, fileType: MyFileTypes, myDatabaseHelper: MyDatabaseHelperInterface,  directus_folder_id?: string): Promise<PrimaryKey> {
        const filesHelper = new FilesServiceHelper(myDatabaseHelper);

        // Convert Buffer to a Readable Stream
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null); // Mark end of stream

        let filename_download = FilesServiceHelper.sanitizeFilename(filename);
        // now fix the filename to be a valid filename

        // Define file metadata
        const fileMetadata: FileServiceFileStream = {
            filename_download: filename_download,
            title: filename,
            type: fileType,
            storage: "local",
            folder: directus_folder_id,
        };

        // Upload the file
        try {
            const fileId = await this.uploadOne(stream, fileMetadata);
            //console.log('File uploaded successfully with ID:', fileId);
            return fileId;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }


    async uploadOne(
        stream: FileServiceSteamType,
        data: FileServiceFileStream,
        primaryKey?: PrimaryKey,
        opts?: MutationOptions,
    ): Promise<PrimaryKey> {
        let filesService = await this.getItemsService();
        return filesService.uploadOne(stream, data, primaryKey, opts);
    }

    async importOne(importURL: string, body: Partial<DirectusFiles>): Promise<PrimaryKey> {
        let filesService = await this.getItemsService();
        return filesService.importOne(importURL, body);
    }

    async readFileContent(id: PrimaryKey): Promise<Buffer> {
        console.log("FilesServiceHelper.readFileContent: ", id);
        const AssetsService: AssetsService = this.apiContext.services.AssetsService
        let schema = await this.apiContext.getSchema();
        // @ts-ignore
        let assetsService = new AssetsService({
            accountability: null, //this makes us admin
            knex: this.knex,
            schema: schema,
        })

        console.log(" - getAsset: ", id);
        let file: {
            stream: Readable;
            file: any;
            stat: Stat;
        } = await assetsService.getAsset(id, { transformationParams: {} }); // https://github.com/directus/directus/discussions/14318

        console.log(" - read the file buffer");
        let chunks: Buffer[] = [];
        return new Promise<Buffer>((resolve, reject) => {
            file.stream.on('data', (chunk: Buffer<ArrayBufferLike>) => {
                console.log("Chunk type:", typeof chunk, "instanceof Buffer:", chunk instanceof Buffer);
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            file.stream.on('end', () => {
                console.log(" - end of stream");
                // @ts-ignore
                resolve(Buffer.concat(chunks));
            });
            file.stream.on('error', (error: Error) => {
                console.error(" - error in stream", error);
                reject(error);
            });
        });
    }

    createDirectusFilesShareLink(options: CreateShareLinkOptionForDirectusFiles): Promise<string | null> {
        let shareServiceHelper = new ShareServiceHelper(this.myDatabaseHelper);
        return shareServiceHelper.createDirectusFilesShareLink(options);
    }

}