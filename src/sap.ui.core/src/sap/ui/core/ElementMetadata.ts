import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import Renderer from "sap/ui/core/Renderer";
var ElementMetadata = function (sClassName, oClassInfo) {
    ManagedObjectMetadata.apply(this, arguments);
};
ElementMetadata.prototype = Object.create(ManagedObjectMetadata.prototype);
ElementMetadata.prototype.constructor = ElementMetadata;
ElementMetadata.uid = ManagedObjectMetadata.uid;
ElementMetadata.prototype.getElementName = function () {
    return this._sClassName;
};
ElementMetadata.prototype.getRendererName = function () {
    return this._sRendererName;
};
ElementMetadata.prototype.getRenderer = function () {
    if (this._oRenderer) {
        return this._oRenderer;
    }
    var sRendererName = this.getRendererName();
    if (!sRendererName) {
        return undefined;
    }
    this._oRenderer = ObjectPath.get(sRendererName);
    if (this._oRenderer) {
        return this._oRenderer;
    }
    Log.warning("Synchronous loading of Renderer for control class '" + this.getName() + "', due to missing Renderer dependency.", "SyncXHR", null, function () {
        return {
            type: "SyncXHR",
            name: sRendererName
        };
    });
    this._oRenderer = sap.ui.requireSync(sRendererName.replace(/\./g, "/")) || ObjectPath.get(sRendererName);
    return this._oRenderer;
};
ElementMetadata.prototype.applySettings = function (oClassInfo) {
    var oStaticInfo = oClassInfo.metadata;
    this._sVisibility = oStaticInfo.visibility || "public";
    var vRenderer = oClassInfo.hasOwnProperty("renderer") ? (oClassInfo.renderer || "") : undefined;
    delete oClassInfo.renderer;
    ManagedObjectMetadata.prototype.applySettings.call(this, oClassInfo);
    var oParent = this.getParent();
    this._sRendererName = this.getName() + "Renderer";
    this.dnd = Object.assign({
        draggable: false,
        droppable: false
    }, oParent.dnd, (typeof oStaticInfo.dnd == "boolean") ? {
        draggable: oStaticInfo.dnd,
        droppable: oStaticInfo.dnd
    } : oStaticInfo.dnd);
    if (typeof vRenderer !== "undefined") {
        if (typeof vRenderer === "string") {
            this._sRendererName = vRenderer || undefined;
            return;
        }
        if (typeof vRenderer === "object" && typeof vRenderer.render === "function") {
            var oRenderer = ObjectPath.get(this.getRendererName());
            if (oRenderer === vRenderer) {
                this._oRenderer = vRenderer;
                return;
            }
            if (oRenderer === undefined && typeof vRenderer.extend === "function") {
                ObjectPath.set(this.getRendererName(), vRenderer);
                this._oRenderer = vRenderer;
                return;
            }
        }
        if (typeof vRenderer === "function") {
            vRenderer = { render: vRenderer };
        }
        var oBaseRenderer;
        if (oParent instanceof ElementMetadata) {
            oBaseRenderer = oParent.getRenderer();
        }
        this._oRenderer = Renderer.extend.call(oBaseRenderer || Renderer, this.getRendererName(), vRenderer);
    }
};
ElementMetadata.prototype.afterApplySettings = function () {
    ManagedObjectMetadata.prototype.afterApplySettings.apply(this, arguments);
    this.register && this.register(this);
};
ElementMetadata.prototype.isHidden = function () {
    return this._sVisibility === "hidden";
};
var fnMetaFactoryAggregation = ElementMetadata.prototype.metaFactoryAggregation;
function Aggregation(oClass, name, info) {
    fnMetaFactoryAggregation.apply(this, arguments);
    this.dnd = Object.assign({
        draggable: false,
        droppable: false,
        layout: "Vertical"
    }, (typeof info.dnd == "boolean") ? {
        draggable: info.dnd,
        droppable: info.dnd
    } : info.dnd);
}
Aggregation.prototype = Object.create(fnMetaFactoryAggregation.prototype);
Aggregation.prototype.constructor = Aggregation;
ElementMetadata.prototype.metaFactoryAggregation = Aggregation;
ElementMetadata.prototype.getDragDropInfo = function (sAggregationName) {
    if (!sAggregationName) {
        return this.dnd;
    }
    var oAggregation = this._mAllAggregations[sAggregationName] || this._mAllPrivateAggregations[sAggregationName];
    if (!oAggregation) {
        return {};
    }
    return oAggregation.dnd;
};