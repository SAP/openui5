export class EnabledPropagator {
    constructor(bDefault: any, bLegacy: any) {
        if (!this.isA || !this.isA("sap.ui.core.Control")) {
            throw new Error("EnabledPropagator only supports subclasses of Control");
        }
        this._bUseEnabledPropagator = true;
        var fnOrigGet = this.getEnabled;
        if (fnOrigGet === undefined) {
            this.getEnabled = function () {
                return (this._bUseEnabledPropagator && hasDisabledAncestor(this)) ? false : this.getProperty("enabled");
            };
            bDefault = (bDefault === undefined) ? true : Boolean(bDefault);
            if (bLegacy) {
                this.getMetadata().addProperty("Enabled", { type: "boolean", group: "Behavior", defaultValue: bDefault });
            }
            this.getMetadata().addProperty("enabled", { type: "boolean", group: "Behavior", defaultValue: bDefault });
            this.getMetadata().addPublicMethods("getEnabled");
        }
        else {
            this.getEnabled = function () {
                return (this._bUseEnabledPropagator && hasDisabledAncestor(this)) ? false : fnOrigGet.apply(this, arguments);
            };
        }
        if (this.setEnabled === undefined) {
            this.setEnabled = function (bEnabled) {
                checkAndMoveFocus(this, bEnabled);
                return this.setProperty("enabled", bEnabled);
            };
            this.getMetadata().addPublicMethods("setEnabled");
        }
        else {
            var fnOrigSet = this.setEnabled;
            this.setEnabled = function (bEnabled) {
                checkAndMoveFocus(this, bEnabled);
                return fnOrigSet.apply(this, arguments);
            };
        }
        this.useEnabledPropagator = function (bUseEnabledPropagator) {
            this._bUseEnabledPropagator = bUseEnabledPropagator;
        };
        this.getMetadata().addPublicMethods("useEnabledPropagator");
    }
}
function hasDisabledAncestor(oControl) {
    for (var oParent = oControl.getParent(); oParent && !oParent.getEnabled && oParent.getParent; oParent = oParent.getParent()) { }
    return oParent && oParent.getEnabled && !oParent.getEnabled();
}
function checkAndMoveFocus(oControl, bEnabled) {
    var oDomRef = oControl.getDomRef();
    if (!bEnabled && oDomRef && oDomRef.contains(document.activeElement)) {
        var oFocusableAncestor = oControl.$().parent().closest(":focusable")[0];
        if (oFocusableAncestor) {
            oFocusableAncestor.focus({
                preventScroll: true
            });
        }
    }
}