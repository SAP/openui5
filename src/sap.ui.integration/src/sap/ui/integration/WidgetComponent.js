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

	WidgetComponent.prototype.createContent = function() {
		var result = UIComponent.prototype.createContent.apply(this, arguments);
		this._applyWidgetModel();
		return result;
	};

	WidgetComponent.prototype._applyWidgetModel = function() {
		var oModel = new JSONModel();
		oModel.setData(this.getManifestEntry("sap.widget") || {});
		this.setModel(oModel, "sap.widget");
	};

	WidgetComponent.prototype.fireAction = function(mParameters) {
		this.oContainer.getParent().getParent().fireAction(mParameters);
	};

	WidgetComponent.prototype.getWidgetConfiguration = function(sPath) {
		return this.getModel("sap.widget").getProperty(sPath);
	};

	//should be called from the Widget whenever configuration/parameters change
	WidgetComponent.prototype.update = function() {
	};

	return WidgetComponent;
});