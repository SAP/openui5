/*global sinon*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("testdata.xml-require.view.XMLTemplateProcessorAsync_require_bind_controller", {
		onInit: function () {
			const oModel = new JSONModel();
			oModel.setData({
				buttonText: "Click Me!",
				alternativeText: "Hidden Text!"
			});
			this.getView().setModel(oModel);
		},
		formatter: function(text) {
			sinon.assert.pass("btn_4: Correct formatter ($controller) called.");
			return `${text} formatted by $controller`;
		}
	});
});
