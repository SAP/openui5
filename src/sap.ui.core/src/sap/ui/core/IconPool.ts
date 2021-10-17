import Icon from "sap/ui/core/Icon";
import _IconRegistry from "sap/ui/core/_IconRegistry";
import Log from "sap/base/Log";
import jQuery from "sap/ui/thirdparty/jquery";
export class IconPool {
    static addIcon = _IconRegistry.addIcon;
    static getIconURI = _IconRegistry.getIconURI;
    static getIconInfo = _IconRegistry.getIconInfo;
    static isIconURI = _IconRegistry.isIconURI;
    static getIconCollectionNames = _IconRegistry.getIconCollectionNames;
    static getIconNames = _IconRegistry.getIconNames;
    static insertFontFaceStyle = _IconRegistry.insertFontFaceStyle;
    static createControlByURI(setting: any, constructor: any) {
        if (typeof setting === "string") {
            setting = { src: setting };
        }
        if (setting && setting.src) {
            var sSrc = setting.src, fnConstructor = constructor;
            if (IconPool.isIconURI(sSrc)) {
                fnConstructor = Icon;
                if (setting.tap) {
                    setting.press = setting.tap;
                    delete setting.tap;
                }
            }
            if (typeof fnConstructor === "function") {
                setting = fnConstructor.getMetadata().removeUnknownSettings(setting);
                return new fnConstructor(setting);
            }
        }
    }
    static fontLoaded(sCollectionName: any) {
        var mFontRegistry = _IconRegistry.getFontRegistry();
        if (mFontRegistry[sCollectionName]) {
            if (mFontRegistry[sCollectionName].metadataLoaded instanceof Promise) {
                return mFontRegistry[sCollectionName].metadataLoaded;
            }
            else if (mFontRegistry[sCollectionName].metadataLoaded === true) {
                return Promise.resolve();
            }
        }
    }
    static registerFont(oConfig: any) {
        oConfig.collectionName = oConfig.collectionName || oConfig.fontFamily;
        if (!oConfig.fontURI) {
            Log.error("The configuration parameter fontURI is missing, cannot register the font '" + oConfig.collectionName + "'!");
            return;
        }
        if (oConfig.fontFamily === _IconRegistry.sapIconFontFamily) {
            Log.error("The font family" + _IconRegistry.sapIconFontFamily + " is already registered");
            return;
        }
        if (oConfig.fontURI.substr(oConfig.fontURI.length - 1) !== "/") {
            oConfig.fontURI += "/";
        }
        var mFontRegistry = _IconRegistry.getFontRegistry();
        if (!mFontRegistry[oConfig.collectionName] || mFontRegistry[oConfig.collectionName].metadataLoaded === false) {
            mFontRegistry[oConfig.collectionName] = {
                config: oConfig,
                inserted: false
            };
        }
        else {
            Log.warning("The font '" + oConfig.collectionName + "' is already registered");
        }
        if (!oConfig.lazy) {
            _IconRegistry._loadFontMetadata(oConfig.collectionName, true);
        }
    }
    static getIconForMimeType(sMimeType: any) {
        return mIconForMimeType[sMimeType] || "sap-icon://document";
    }
}
var mIconForMimeType = {
    "application/msword": "sap-icon://doc-attachment",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "sap-icon://doc-attachment",
    "application/rtf": "sap-icon://doc-attachment",
    "application/pdf": "sap-icon://pdf-attachment",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
    "application/vnd.ms-excel": "sap-icon://excel-attachment",
    "application/msexcel": "sap-icon://excel-attachment",
    "application/vnd.ms-powerpoint": "sap-icon://ppt-attachment",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "sap-icon://ppt-attachment",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "sap-icon://ppt-attachment",
    "application/mspowerpoint": "sap-icon://ppt-attachment",
    "application/xml": "sap-icon://attachment-html",
    "application/xhtml+xml": "sap-icon://attachment-html",
    "application/x-httpd-php": "sap-icon://attachment-html",
    "application/x-javascript": "sap-icon://attachment-html",
    "application/gzip": "sap-icon://attachment-zip-file",
    "application/x-rar-compressed": "sap-icon://attachment-zip-file",
    "application/x-tar": "sap-icon://attachment-zip-file",
    "application/zip": "sap-icon://attachment-zip-file",
    "audio/voxware": "sap-icon://attachment-audio",
    "audio/x-aiff": "sap-icon://attachment-audio",
    "audio/x-midi": "sap-icon://attachment-audio",
    "audio/x-mpeg": "sap-icon://attachment-audio",
    "audio/x-pn-realaudio": "sap-icon://attachment-audio",
    "audio/x-pn-realaudio-plugin": "sap-icon://attachment-audio",
    "audio/x-qt-stream": "sap-icon://attachment-audio",
    "audio/x-wav": "sap-icon://attachment-audio",
    "image/png": "sap-icon://attachment-photo",
    "image/tiff": "sap-icon://attachment-photo",
    "image/bmp": "sap-icon://attachment-photo",
    "image/jpeg": "sap-icon://attachment-photo",
    "image/gif": "sap-icon://attachment-photo",
    "text/plain": "sap-icon://attachment-text-file",
    "text/comma-separated-values": "sap-icon://attachment-text-file",
    "text/css": "sap-icon://attachment-text-file",
    "text/html": "sap-icon://attachment-text-file",
    "text/javascript": "sap-icon://attachment-text-file",
    "text/richtext": "sap-icon://attachment-text-file",
    "text/rtf": "sap-icon://attachment-text-file",
    "text/tab-separated-values": "sap-icon://attachment-text-file",
    "text/xml": "sap-icon://attachment-text-file",
    "video/mpeg": "sap-icon://attachment-video",
    "video/quicktime": "sap-icon://attachment-video",
    "video/x-msvideo": "sap-icon://attachment-video",
    "application/x-shockwave-flash": "sap-icon://attachment-video"
};