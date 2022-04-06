sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.XMLComposite.01.Component", {
		metadata : {
			manifest: "json"
		},

		init: function () {

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				placeholder: "my placeholder ...",
				searchText: "my button text ..."
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

		}
	});
});
