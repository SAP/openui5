sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var Sub2Controller = Controller.extend("samples.components.ext.sap.Sub2", {

		onInit: function() {
			jQuery.sap.log.info("Sub2 Controller onInit()");


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
			jQuery.sap.log.info("Sub2 Controller onExit()");
		},

		onBeforeRendering: function() {
			jQuery.sap.log.info("Sub2 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			jQuery.sap.log.info("Sub2 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			alert("This is an original SAP Action");
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
