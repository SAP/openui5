/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.View.async.Sample", {

		onInit: function() {
			var oView = this.getView();
			oView.setModel(new JSONModel({
				async: true
			}), "mode");
			oView.setModel(new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json")), "img");
		}
	});

});
