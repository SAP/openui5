import Log from "sap/base/Log";
export class ThemeHelper {
    static reset(...args: any) {
        mLibThemeMetadata = {};
    }
    static getMetadata(sLibId: any) {
        if (!sLibId) {
            return null;
        }
        var sLibName = sLibId.replace("sap-ui-theme-", "").replace(/\./g, "-");
        if (mLibThemeMetadata[sLibName]) {
            return mLibThemeMetadata[sLibName];
        }
        var oMetadata, sMetadataJSON;
        var oBodyStyle = window.getComputedStyle(document.body || document.documentElement);
        var sVariablesMarker = oBodyStyle.getPropertyValue("--sapUiTheme-" + sLibName).trim();
        if (sVariablesMarker) {
            sMetadataJSON = oBodyStyle.getPropertyValue("--sapThemeMetaData-UI5-" + sLibName).trim();
        }
        if (!sMetadataJSON) {
            var oMetadataElement = document.createElement("span");
            oMetadataElement.classList.add("sapThemeMetaData-UI5-" + sLibName);
            document.documentElement.appendChild(oMetadataElement);
            var sDataUri = window.getComputedStyle(oMetadataElement).getPropertyValue("background-image");
            document.documentElement.removeChild(oMetadataElement);
            var aDataUriMatch = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)/i.exec(sDataUri);
            if (!aDataUriMatch || aDataUriMatch.length < 2) {
                return null;
            }
            var sMetaData = aDataUriMatch[1];
            if (sMetaData.charAt(0) !== "{" && sMetaData.charAt(sMetaData.length - 1) !== "}") {
                try {
                    sMetaData = decodeURI(sMetaData);
                }
                catch (ex) {
                }
            }
            sMetaData = sMetaData.replace(/\\"/g, "\"");
            sMetadataJSON = sMetaData.replace(/%20/g, " ");
        }
        try {
            oMetadata = JSON.parse(sMetadataJSON);
            mLibThemeMetadata[sLibName] = oMetadata;
        }
        catch (ex) {
            Log.error("Could not parse theme metadata for library " + sLibName + ".");
        }
        return oMetadata;
    }
}
var mLibThemeMetadata = {};