import ComponentMetadata from "./ComponentMetadata";
import ViewType from "sap/ui/core/mvc/ViewType";
var UIComponentMetadata = function (sClassName, oClassInfo) {
    ComponentMetadata.apply(this, arguments);
};
UIComponentMetadata.prototype = Object.create(ComponentMetadata.prototype);
UIComponentMetadata.prototype.constructor = UIComponentMetadata;
UIComponentMetadata.preprocessClassInfo = function (oClassInfo) {
    if (oClassInfo && typeof oClassInfo.metadata === "string") {
        oClassInfo.metadata = {
            _src: oClassInfo.metadata
        };
    }
    return oClassInfo;
};
UIComponentMetadata.prototype.getRootView = function (bDoNotMerge) {
    return this.getManifestEntry("/sap.ui5/rootView", !bDoNotMerge);
};
UIComponentMetadata.prototype.getRoutingConfig = function (bDoNotMerge) {
    return this.getManifestEntry("/sap.ui5/routing/config", !bDoNotMerge);
};
UIComponentMetadata.prototype.getRoutes = function (bDoNotMerge) {
    return this.getManifestEntry("/sap.ui5/routing/routes", !bDoNotMerge);
};
UIComponentMetadata.prototype._convertLegacyMetadata = function (oStaticInfo, oManifest) {
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
};