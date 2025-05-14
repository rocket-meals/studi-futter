import axios from "axios";
import {CheerioAPI, load as cheerioLoad} from 'cheerio';
import type { Element as CheerioElement } from 'domhandler';
import {ApartmentParserInterface, ApartmentsForParser} from "../ApartmentParserInterface";


export class StudentenwerkHannoverApartments_Parser implements ApartmentParserInterface {

    static baseUrl = 'https://www.studentenwerk-hannover.de';
// https://www.studentenwerk-hannover.de/wohnen/wohnhaeuser
    static apartmentsUrl = `${StudentenwerkHannoverApartments_Parser.baseUrl}/wohnen/wohnhaeuser`;

    constructor() {

    }

    async getApartmentList(): Promise<ApartmentsForParser[]> {
        return await this.getRealItems();
    }

    async getCoordiantesFromAdress(address: string) {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: address,
                format: 'json'
            }
        });
        if (response.data && response.data.length > 0) {
            return {
                latitude: response.data[0].lat,
                longitude: response.data[0].lon
            };
        } else {
            return null;
        }
    }

    getImageUrlFromElement(cheerioAPI: CheerioAPI, element: CheerioElement) {
        try{
            let mensaImag = cheerioAPI(element).find('div.mensaImag');
            //console.log("mensaImag", mensaImag)
            /**
             mensaImag LoadedCheerio {
               '0': <ref *1> Element {
                 parent: Element {
                   parent: [Element],
                   prev: [Text],
                   next: [Text],
                   startIndex: null,
                   endIndex: null,
                   children: [Array],
                   name: 'a',
                   attribs: [Object: null prototype],
                   type: 'tag',
                   namespace: 'http://www.w3.org/1999/xhtml',
                   'x-attribsNamespace': [Object: null prototype],
                   'x-attribsPrefix': [Object: null prototype]
                 },
                 prev: Text {
                   parent: [Element],
                   prev: null,
                   next: [Circular *1],
                   startIndex: null,
                   endIndex: null,
                   data: '\n                                    ',
                   type: 'text'
                 },
                 next: Text {
                   parent: [Element],
                   prev: [Circular *1],
                   next: [Element],
                   startIndex: null,
                   endIndex: null,
                   data: '\n                                    ',
                   type: 'text'
                 },
                 startIndex: null,
                 endIndex: null,
                 children: [ [Text] ],
                 name: 'div',
                 attribs: [Object: null prototype] {
                   class: 'mensaImag',
                   style: 'background: url(/fileadmin/user_upload/Bilder/2_Wohnen/WH_KaWi_Obst.JPG) no-repeat;'
                 },
                 type: 'tag',
                 namespace: 'http://www.w3.org/1999/xhtml',
                 'x-attribsNamespace': [Object: null prototype] { class: undefined, style: undefined },
                 'x-attribsPrefix': [Object: null prototype] { class: undefined, style: undefined }
               },
               length: 1,
               options: { xml: false, decodeEntities: true },
               _root: <ref *2> LoadedCheerio {
                 '0': Document {
                   parent: null,
                   prev: null,
                   next: null,
                   startIndex: null,
                   endIndex: null,
                   children: [Array],
                   type: 'root',
                   'x-mode': 'no-quirks'
                 },
                 length: 1,
                 options: { xml: false, decodeEntities: true },
                 _root: [Circular *2]
               },
               prevObject: LoadedCheerio {
                 '0': Element {
                   parent: [Element],
                   prev: [Text],
                   next: [Text],
                   startIndex: null,
                   endIndex: null,
                   children: [Array],
                   name: 'div',
                   attribs: [Object: null prototype],
                   type: 'tag',
                   namespace: 'http://www.w3.org/1999/xhtml',
                   'x-attribsNamespace': [Object: null prototype],
                   'x-attribsPrefix': [Object: null prototype]
                 },
                 length: 1,
                 options: { xml: false, decodeEntities: true },
                 _root: <ref *3> LoadedCheerio {
                   '0': [Document],
                   length: 1,
                   options: [Object],
                   _root: [Circular *3]
                 }
               }
             }
             */
            let attribs = mensaImag?.[0]?.attribs;
            let style = attribs?.style;
            if(!style) {
                return undefined;
            }
            const split = style.split("url(");
            if(split.length < 2) {
                return undefined;
            }
            const secondPart = split[1];
            if(!secondPart) {
                return undefined;
            }
            let imageUrl = secondPart.split(")")[0];
            if(!imageUrl) {
                return undefined;
            }
            return StudentenwerkHannoverApartments_Parser.baseUrl + imageUrl;
        } catch (error) {
            console.log("Error while fetching image url")
            console.log(error)
            return undefined
        }
    }

    async getRealItems(): Promise<ApartmentsForParser[]> {
        try {
            let response = await axios.get(StudentenwerkHannoverApartments_Parser.apartmentsUrl);
            const cheerioAPI = cheerioLoad(response.data);

            // Find all apartment divs
            let data: ApartmentsForParser[] = [];
            cheerioAPI('div.wohnheimListView').each((index, element) => {
                let name = cheerioAPI(element).find('h3').text().trim();
                let imageUrl = this.getImageUrlFromElement(cheerioAPI, element);
                let apartmentUrl = StudentenwerkHannoverApartments_Parser.baseUrl + cheerioAPI(element).find('a').attr('href');

                data.push({
                    basicData: {
                        external_identifier: "apartment_" + name.replace(/\W+/g, '_'),
                        available_from: null,
                        handicapped_accessible: false,
                        family_friendly: false,
                        singleflat: false,
                    },
                    buildingData: {
                        external_identifier: "building_" + name.replace(/\W+/g, '_'),
                        url: apartmentUrl,
                        alias: name,
                        image_remote_url: imageUrl,
                        year_of_construction: null
                    }
                });
            });

            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
