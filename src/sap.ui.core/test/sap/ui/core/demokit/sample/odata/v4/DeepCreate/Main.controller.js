/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DeepCreate.Main", {

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			var oView = this.getView();

			this.oUIModel = new JSONModel({
				oContext : null,
				iMessages : 0
			});
			oView.setModel(this.oUIModel, "ui");
		}
	});
});
