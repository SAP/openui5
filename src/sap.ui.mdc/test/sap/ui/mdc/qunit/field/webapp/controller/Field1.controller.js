sap.ui.define([
	"sap/ui/core/mvc/Controller"
 ], function(Controller) {
	"use strict";

	var FieldController = Controller.extend("test.sap.ui.mdc.field.Field.controller.Field1");

	FieldController.prototype.onInit = function(oEvent) {
		var oView = this.getView();
		oView.bindElement({
			path: "/Artists(artistUUID=00505691-8175-1ed8-9dbe-6512e332d26c)"
		});

		oView.attachEventOnce("modelContextChange", this.onModelContextChangeOnce, this);
	};

	FieldController.prototype.onModelContextChangeOnce = function(oEvent) {
		var oView = this.getView(),
			oMetaModel = oView && oView.getModel().getMetaModel();

		if (oMetaModel) {
			oView.setModel(oMetaModel, "meta");
		}
	};

	return FieldController;
});
