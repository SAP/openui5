/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (
	UIComponent,
	JSONModel
) {
	"use strict";
	var WidgetComponent = UIComponent.extend("sap.ui.integration.WidgetComponent");

	WidgetComponent.prototype.init = function() {
		var result = UIComponent.prototype.init.apply(this, arguments);
		this._applyWidgetModel();
		return result;
	};

	WidgetComponent.prototype._applyWidgetModel = function() {
		var oModel = new JSONModel();
		oModel.setData(this.getManifestEntry("sap.widget") || {});
		this.setModel(oModel, "sap.widget");
	};

	WidgetComponent.prototype.fireAction = function(mParameters) {
		this.oContainer.getParent().fireAction(mParameters);
	};

	WidgetComponent.prototype.getWidgetConfiguration = function(sPath) {
		return this.getModel("sap.widget").getProperty(sPath || "/");
	};

	/**
	 * Overwrite this method in your component to have access to the Widget instance.
	 * @virtual
	 * @param {sap.ui.integration.Widget} oWidget The widget instance.
	 */
	WidgetComponent.prototype.onWidgetReady = function(oWidget) {};

	//should be called from the Widget whenever configuration/parameters change
	WidgetComponent.prototype.update = function() {
	};

	return WidgetComponent;
});
