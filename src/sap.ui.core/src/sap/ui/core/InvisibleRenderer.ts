export class InvisibleRenderer {
    static PlaceholderPrefix = "sap-ui-invisible-";
    static createInvisiblePlaceholderId(oControl: any) {
        return this.PlaceholderPrefix + oControl.getId();
    }
    static getDomRef(oControl: any) {
        return document.getElementById(this.createInvisiblePlaceholderId(oControl));
    }
    static render(oRm: any, oElement: any, sTagName: any) {
        var sPlaceholderId = this.createInvisiblePlaceholderId(oElement);
        sTagName = sTagName || "span";
        oRm.openStart(sTagName, sPlaceholderId);
        oRm.attr("data-sap-ui", sPlaceholderId);
        oRm.attr("aria-hidden", "true");
        oRm.class("sapUiHiddenPlaceholder");
        oRm.openEnd(true);
        oRm.close(sTagName);
    }
}