sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";
	return Controller.extend("sap.my.test.widget.wfviz.controller.SimpleFormTemplate", {
		onInit: function() {
		},
		handleUpload: function(oEvent){
			var sFieldId = oEvent.getSource().getId();
			sFieldId = sFieldId.substring(0, sFieldId.length - "_button".length);
			var oFileUploader = this.byId(sFieldId);
			oFileUploader.upload();
		},
		handleUploadComplete: function(oEvent){
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},
		handleCompleteForm: function(oEvent) {
			var oSource = oEvent.getSource();
			var iIndex = oSource.data("index");
			this.getView().getParent().getController().openComplexVStepContent(iIndex, oEvent.getSource());
		},
		takeOverAndClosePopover: function(oEvent) {
			var oData = this.getView().getModel("context").getData();
			this.getView().getParent().getParent().getController().updateContext(oData);
			this.getView().getParent().getParent().getController().oPopover.close();
		},
		closePopover: function(oEvent) {
			this.getView().getParent().getParent().getController().oPopover.close();
		}
	});
});
