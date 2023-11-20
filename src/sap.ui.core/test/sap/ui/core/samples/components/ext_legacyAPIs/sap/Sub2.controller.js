sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Log, Controller, JSONModel, MessageToast) {
	"use strict";

	var Sub2Controller = Controller.extend("samples.components.ext_legacyAPIs.sap.Sub2", {

		onInit: function() {
			Log.info("Sub2 Controller onInit()");


			// create some dummy JSON data
			var data = {
				number: 43,
				names:[
					{name: "Anton"},
					{name: "Karl"},
					{name: "Hermann"}
				]
			};

			// create a Model and assign it to the View
			var oModel = new JSONModel();
			oModel.setData(data);
			this.getView().setModel(oModel);
		},

		onExit: function() {
			Log.info("Sub2 Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub2 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub2 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			MessageToast.show("This is an original SAP Action");
		},

		formatNumber: function(iNumber) {
			return "000" + iNumber;
		},

		api : {
			showToast: function() {
				var that = this;
				this.getView().setBusy(true);
				sap.ui.require(["sap/m/MessageToast"], function(T) {
					var oData = that.getView().getModelProperty({path:'/number', formatter: that.formatNumber});
					oData = that.formatNumber(that.getView().getModel().getProperty("/number"));
					T.show("Hello " + oData);
					that.getView().setBusy(false);
				});
			}
		}
	});

	return Sub2Controller;

});
