import SparkMD5 from 'spark-md5';

function deepSort(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(deepSort);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
                acc[key] = deepSort(obj[key]);
                return acc;
            }, {});
    }
    return obj;
}

export class HashHelper {
    public static getHashFromObject(obj: any): string {
        const sorted = deepSort(obj);
        const json = JSON.stringify(sorted);
        return SparkMD5.hash(json);
    }
}