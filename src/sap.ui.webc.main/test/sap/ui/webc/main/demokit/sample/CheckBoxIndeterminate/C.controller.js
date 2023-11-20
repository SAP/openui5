sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.CheckBoxIndeterminate.C", {

		onInit: function() {
			this.oModel = new JSONModel({
				child1: true,
				child2: false,
				child3: true
			});
			this.getView().setModel(this.oModel);
		},

		onParentChanged: function (oEvent) {
			var bChecked = oEvent.getSource().getChecked();
			this.oModel.setData({ child1: bChecked, child2: bChecked, child3: bChecked });
		}
	});
});