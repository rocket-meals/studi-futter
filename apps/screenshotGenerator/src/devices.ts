export type Device = {
    name: string;
    width: number;
    height: number;
    deviceScaleFactor: number;
    horizontal?: boolean;
};

export const devices: Device[] = [
    { name: 'google-playstore-presentation', width: 1024, height: 500, deviceScaleFactor: 1, horizontal: false },
    { name: 'google-playstore-phone', width: 1080 / 3, height: 1920 / 3, deviceScaleFactor: 3, horizontal: false },
    { name: 'google-playstore-tablet-10', width: 1080, height: 1920, deviceScaleFactor: 1, horizontal: true },
    { name: 'iphone-6.7', width: 1290 / 3, height: 2796 / 3, deviceScaleFactor: 3, horizontal: false },
    { name: 'iphone-5.5', width: 414, height: 736, deviceScaleFactor: 3, horizontal: false },
    { name: 'ipad-13', width: 2064 / 2, height: 2752 / 2, deviceScaleFactor: 2, horizontal: true },
    { name: 'ipad-12.9', width: 2048 / 2, height: 2732 / 2, deviceScaleFactor: 2, horizontal: true },
];
