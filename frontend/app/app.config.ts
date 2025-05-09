type CustomerConfig = {
    projectName: string;
    projectSlug: string;
    easUpdateId: string;
    easProjectId: string;
    appScheme: string;
    bundleIdIos: string;
    bundleIdAndroid: string;
    baseUrl: string;
    server_url: string;
}

function getVersion() {
    return "20.0.6";
}

function getBuildNumber() {
    return 136;
}

function getIosBuildNumber() { // "ios.buildNumber" must be a string
    return getBuildNumber().toString();
}

export function getCustomerConfig(): CustomerConfig {
    return studiFutterConfig;
}

const devConfig: CustomerConfig = {
    projectName: "Rocket Meals",
    projectSlug: "rocket-meals-dev",
    easUpdateId: "36f72583-5997-4602-8609-05f39444f2e7",
    easProjectId: "36f72583-5997-4602-8609-05f39444f2e7",
    appScheme: "app-rocket-meals",
    bundleIdIos: "de.baumgartner-software.rocket-meals-demo",
    bundleIdAndroid: "com.baumgartnersoftware.rocketmealsdev",
    baseUrl: "/rocket-meals",
    server_url: "https://test.rocket-meals.de/rocket-meals/api"
}
const swosyConfig: CustomerConfig = {
    projectName: "SWOSY 2.0",
    projectSlug: "rocket-meals-swosy",
    easUpdateId: "4147159f-d7b5-4db5-b6eb-f9988519950c",
    easProjectId: "4147159f-d7b5-4db5-b6eb-f9988519950c",
    appScheme: "app-rocket-meals-swosy",
    bundleIdIos: "de.baumgartner-software.swosy",
    bundleIdAndroid: "de.baumgartnersoftware.swosy",
    baseUrl: "/swosy",
    server_url: "https://swosy.rocket-meals.de/rocket-meals/api"
}
const studiFutterConfig: CustomerConfig = {
    projectName: "Studi|Futter",
    projectSlug: "rocket-meals-studi-futter",
    easUpdateId: "461671f9-774f-4bc4-80a8-5601313539b0",
    easProjectId: "461671f9-774f-4bc4-80a8-5601313539b0",
    appScheme: "app-rocket-meals-studi-futter",
    bundleIdIos: "de.stwh.app",
    bundleIdAndroid: "de.baumgartnersoftware.studifutter",
    baseUrl: "/studi-futter",
    server_url: "https://studi-futter.rocket-meals.de/rocket-meals/api"
}

export default ({config}: {config?: any}) => {
    const customerConfig: CustomerConfig = getCustomerConfig();

    return {
        "expo": {
            "name": customerConfig.projectName,
            "slug": customerConfig.projectSlug,
            "version": getVersion(),
            "orientation": "default",
            "icon": "./assets/images/icon.png",
            "notification": {
                "icon": "./assets/images/notification-icon.png"
            },
            "updates": {
                "enabled": true,
                "url": "https://u.expo.dev/"+customerConfig.easUpdateId,
            },
            "scheme": customerConfig.appScheme,
            "userInterfaceStyle": "automatic",
            "splash": {
                "image": "./assets/images/splash.png",
                "resizeMode": "contain",
                "backgroundColor": "#ffffff"
            },
            "assetBundlePatterns": [
                "**/*"
            ],
            "ios": {
                "supportsTablet": true,
                "bundleIdentifier": customerConfig.bundleIdIos,
                "buildNumber": getIosBuildNumber(),
                "infoPlist": {
                    "NSPhotoLibraryUsageDescription": "We need access to your photo library to select files",
                    "NSDocumentDirectoryUsageDescription": "We need access to your document directory to select files"
                },
                "config": {
                    "usesNonExemptEncryption": false
                },
                "entitlements": {
                    "com.apple.developer.applesignin": ["Default"]
                },
                "privacyManifests": {
                    "NSPrivacyCollectedDataTypes": [
                        {
                            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePreciseLocation",
                            "NSPrivacyCollectedDataTypeLinked": false,
                            "NSPrivacyCollectedDataTypeTracking": false,
                            "NSPrivacyCollectedDataTypePurposes": [
                                "NSPrivacyCollectedDataTypePurposeProductPersonalization",
                                "NSPrivacyCollectedDataTypePurposeAppFunctionality",
                                "NSPrivacyCollectedDataTypePurposeOther"
                            ]
                        },
                        {
                            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailsOrTextMessages",
                            "NSPrivacyCollectedDataTypeLinked": true,
                            "NSPrivacyCollectedDataTypeTracking": false,
                            "NSPrivacyCollectedDataTypePurposes": [
                                "NSPrivacyCollectedDataTypePurposeProductPersonalization",
                                "NSPrivacyCollectedDataTypePurposeAppFunctionality"
                            ]
                        },
                        {
                            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePhotosorVideos",
                            "NSPrivacyCollectedDataTypeLinked": true,
                            "NSPrivacyCollectedDataTypeTracking": false,
                            "NSPrivacyCollectedDataTypePurposes": [
                                "NSPrivacyCollectedDataTypePurposeAppFunctionality"
                            ]
                        },
                        {
                            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeOtherUserContent",
                            "NSPrivacyCollectedDataTypeLinked": true,
                            "NSPrivacyCollectedDataTypeTracking": false,
                            "NSPrivacyCollectedDataTypePurposes": [
                                "NSPrivacyCollectedDataTypePurposeAppFunctionality"
                            ]
                        },
                        {
                            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailAddress",
                            "NSPrivacyCollectedDataTypeLinked": true,
                            "NSPrivacyCollectedDataTypeTracking": false,
                            "NSPrivacyCollectedDataTypePurposes": [
                                "NSPrivacyCollectedDataTypePurposeAppFunctionality"
                            ]
                        }
                    ],
                    "NSPrivacyAccessedAPITypes": [
                        {
                            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
                            "NSPrivacyAccessedAPITypeReasons": [
                                "CA92.1"
                            ]
                        },
                        {
                            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
                            "NSPrivacyAccessedAPITypeReasons": [
                                "8FFB.1"
                            ]
                        },
                        {
                            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace",
                            "NSPrivacyAccessedAPITypeReasons": [
                                "85F4.1"
                            ]
                        },
                        {
                            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
                            "NSPrivacyAccessedAPITypeReasons": [
                                "DDA9.1"
                            ]
                        }
                    ]
                }
            },
            "android": {
                "adaptiveIcon": {
                    "foregroundImage": "./assets/images/adaptive-icon.png",
                    "backgroundColor": "#ffffff"
                },
                "package": customerConfig.bundleIdAndroid,
                "versionCode": getBuildNumber(),
                "blockedPermissions": [
                    "android.permission.READ_MEDIA_IMAGES",
                    "android.permission.READ_MEDIA_VIDEO"
                ]
            },
            "web": {
                "bundler": "metro",
                "output": "static",
                "favicon": "./assets/images/favicon.png"
            },
            "plugins": [
                "expo-router",
                "expo-secure-store",
                "expo-location",
                "expo-notifications",
                [
                    "expo-document-picker",
                    {
                        "iCloudContainerEnvironment": "Production"
                    }
                ],
                [
                    "expo-splash-screen",
                    {
                        "image": "./assets/images/splash-icon.png",
                        "imageWidth": 200,
                        "resizeMode": "contain",
                        "backgroundColor": "#ffffff"
                    }
                ],
                [
                    "react-native-nfc-manager",
                    {
                        "nfcPermission": "The app accesses NFC read your Card balance.",
                        "includeNdefEntitlement": false
                    }
                ],
                [
                    "expo-updates",
                    {
                        "username": "jack5496"
                    }
                ],
                [
                    "expo-image-picker",
                    {
                        "photosPermission": "custom photos permission",
                        "cameraPermission": "Allow $(PRODUCT_NAME) to open the camera",
                        "//": "Disables the microphone permission",
                        "microphonePermission": false
                    }
                ],
                [
                    "expo-build-properties",
                    {
                        "android": {
                            "compileSdkVersion": 35,
                            "targetSdkVersion": 34,
                            "buildToolsVersion": "35.0.0",
                            //"kotlinVersion": "1.9.25" // https://github.com/expo/expo/issues/32844
                        },
                        "ios": {
                            "deploymentTarget": "15.1"
                        }
                    }
                ],
                "expo-localization",
                "expo-asset",
                "expo-font"
            ],
            "experiments": {
                "typedRoutes": true,
                "baseUrl": customerConfig.baseUrl
            },
            "extra": {
                "router": {
                    "origin": false
                },
                "eas": {
                    "projectId": customerConfig.easProjectId,
                }
            },
            "owner": "baumgartner-software",
            "runtimeVersion": {
                "policy": "appVersion"
            }
        }
    }
}