import Log from "sap/base/Log";
import isPlainObject from "sap/base/util/isPlainObject";
import ObjectPath from "sap/base/util/ObjectPath";
import assert from "sap/base/assert";
import extend from "sap/base/util/extend";
export class Renderer {
    static extend(vName: any, oRendererInfo: any) {
        if (typeof vName === "string") {
            return createExtendedRenderer.call(this, vName, oRendererInfo);
        }
        else if (this === Renderer) {
            var oChildRenderer = Object.create(vName || null);
            oChildRenderer._super = vName;
            oChildRenderer.extend = createExtendedRenderer;
            return oChildRenderer;
        }
        else {
            throw new TypeError("The signature extend(BaseRenderer) without a name can only be called on sap.ui.core.Renderer");
        }
    }
    static getTextAlign(oTextAlign: any, oTextDirection: any) {
        sapUiCore = sap.ui.require("sap/ui/core/library");
        if (!sapUiCore) {
            Log.warning("Synchronous loading of a library.js. Ensure that 'sap/ui/core/library.js' is loaded" + " before sap.ui.core.Renderer#getTextAlign is called.", "SyncXHR", null, function () {
                return {
                    type: "SyncXHR",
                    name: "renderer-getTextAlign"
                };
            });
            sapUiCore = sap.ui.requireSync("sap/ui/core/library");
        }
        var TextAlign = sapUiCore.TextAlign;
        var TextDirection = sapUiCore.TextDirection;
        var sTextAlign = "", bRTL = sap.ui.getCore().getConfiguration().getRTL();
        switch (oTextAlign) {
            case TextAlign.End:
                switch (oTextDirection) {
                    case TextDirection.LTR:
                        sTextAlign = "right";
                        break;
                    case TextDirection.RTL:
                        sTextAlign = "left";
                        break;
                    default:
                        sTextAlign = bRTL ? "left" : "right";
                        break;
                }
                break;
            case TextAlign.Begin:
                switch (oTextDirection) {
                    case TextDirection.LTR:
                        sTextAlign = "left";
                        break;
                    case TextDirection.RTL:
                        sTextAlign = "right";
                        break;
                    default:
                        sTextAlign = bRTL ? "right" : "left";
                        break;
                }
                break;
            case TextAlign.Right:
                if (!bRTL || oTextDirection == TextDirection.LTR) {
                    sTextAlign = "right";
                }
                break;
            case TextAlign.Center:
                sTextAlign = "center";
                break;
            case TextAlign.Left:
                if (bRTL || oTextDirection == TextDirection.RTL) {
                    sTextAlign = "left";
                }
                break;
        }
        return sTextAlign;
    }
}
var sapUiCore;
function createExtendedRenderer(sName, oRendererInfo) {
    assert(this != null, "BaseRenderer must be a non-null object");
    assert(typeof sName === "string" && sName, "Renderer.extend must be called with a non-empty name for the new renderer");
    assert(oRendererInfo == null || (isPlainObject(oRendererInfo) && Object.keys(oRendererInfo).every(function (key) { return oRendererInfo[key] !== undefined; })), "oRendererInfo can be omitted or must be a plain object without any undefined property values");
    var oChildRenderer = Object.create(this);
    oChildRenderer.extend = createExtendedRenderer;
    extend(oChildRenderer, oRendererInfo);
    ObjectPath.set(sName, oChildRenderer);
    return oChildRenderer;
}