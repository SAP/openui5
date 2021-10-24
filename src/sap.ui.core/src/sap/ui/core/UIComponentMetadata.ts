import ComponentMetadata from "./ComponentMetadata";
import ViewType from "sap/ui/core/mvc/ViewType";
export class UIComponentMetadata {
    static prototype = Object.create(ComponentMetadata.prototype);
    getRootView(bDoNotMerge: any) {
        return this.getManifestEntry("/sap.ui5/rootView", !bDoNotMerge);
    }
    getRoutingConfig(bDoNotMerge: any) {
        return this.getManifestEntry("/sap.ui5/routing/config", !bDoNotMerge);
    }
    getRoutes(bDoNotMerge: any) {
        return this.getManifestEntry("/sap.ui5/routing/routes", !bDoNotMerge);
    }
    private _convertLegacyMetadata(oStaticInfo: any, oManifest: any) {
        ComponentMetadata.prototype._convertLegacyMetadata.call(this, oStaticInfo, oManifest);
        var oUI5Manifest = oManifest["sap.ui5"];
        var oRootView = oUI5Manifest["rootView"] || oStaticInfo["rootView"];
        if (oRootView) {
            oUI5Manifest["rootView"] = oRootView;
        }
        var oRouting = oUI5Manifest["routing"] || oStaticInfo["routing"];
        if (oRouting) {
            oUI5Manifest["routing"] = oRouting;
        }
        if (oUI5Manifest["rootView"] && typeof oUI5Manifest["rootView"] === "string") {
            oUI5Manifest["rootView"] = {
                viewName: oUI5Manifest["rootView"],
                type: ViewType.XML
            };
        }
    }
    static preprocessClassInfo(oClassInfo: any) {
        if (oClassInfo && typeof oClassInfo.metadata === "string") {
            oClassInfo.metadata = {
                _src: oClassInfo.metadata
            };
        }
        return oClassInfo;
    }
    constructor(sClassName: any, oClassInfo: any) {
        ComponentMetadata.apply(this, arguments);
    }
}
UIComponentMetadata.prototype.constructor = UIComponentMetadata;