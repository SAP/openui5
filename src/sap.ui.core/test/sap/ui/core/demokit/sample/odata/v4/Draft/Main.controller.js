/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.Main", {

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			this.oUIModel = new JSONModel({
				iMessages : 0,
				oProductsTable : null,
				bShowList : true,
				sShowListIcon : "sap-icon://close-command-field",
				sShowListTooltip : "Hide List"
			});
			this.getView().setModel(this.oUIModel, "ui");
		}
	});
});
