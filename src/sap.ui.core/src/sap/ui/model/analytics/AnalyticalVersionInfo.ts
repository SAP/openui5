import Log from "sap/base/Log";
export class AnalyticalVersionInfo {
    static getVersion(oODataModelInstance: any) {
        var iVersion;
        var sODataModelName;
        if (oODataModelInstance && oODataModelInstance.getMetadata) {
            sODataModelName = oODataModelInstance.getMetadata().getName();
        }
        switch (sODataModelName) {
            case "sap.ui.model.odata.ODataModel":
                iVersion = this.V1;
                break;
            case "sap.ui.model.odata.v2.ODataModel":
                iVersion = this.V2;
                break;
            default:
                iVersion = this.NONE;
                Log.info("AnalyticalVersionInfo.getVersion(...) - The given object is no instance of ODataModel V1 or V2!");
                break;
        }
        return iVersion;
    }
}