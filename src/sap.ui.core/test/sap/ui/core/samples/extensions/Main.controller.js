sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller','sap/ui/core/mvc/ControllerExtension'],
	function(jQuery, Controller, ControllerExtension/*DraftHandling, Routing*/) {
	"use strict";
	var Routing = {
		metadata: {
			name: "sap.ui.routing.Util"
		},
		_navTo : function (sRouteId) {
			alert("routing to " + sRouteId);
		},
		navTo : function (sRouteId) {
			this._navTo(sRouteId);
		}
	};
	var DraftHandling = {
		metadata: {
			name: "sap.ui.draft.Util"
		}
	};

	var MainController = Controller.extend("sample.Main", {
		onInit : function () {
			var oModel = new sap.ui.model.json.JSONModel({
				txt: "Button Text"
			});
			this.getView().setModel(oModel);
		},
		draft: ControllerExtension.extend("sap.ui.draft.Util", DraftHandling), //adding utilities for draft
		routing: ControllerExtension.extend("sap.ui.routing.Util", Routing),     //adding utilities for routing

		_sayHello: function(oEvent) {
			alert(this.provideText() || sText || "SAP says Hello");
		},
		sayHello2: function(sText, oObject, sBindingResult, sId, sSourceText, oEvent) {
			alert(sText + ", " + JSON.stringify(oObject) + ", " + sBindingResult + ", " + sId + ", " + sSourceText || "SAP says Hello");
			this.ext.com.sap.industry.oil._sayHello();
		},
		provideText : function() {return "base"},
		formatButtonText : function(sTxt) {
			return "SAP " + sTxt;
		}
	});
	return MainController;
});