sap.ui.controller("sap.ui.unified.sample.FileUploaderBasic.Controller", {
	handleUploadComplete: function(oEvent) {
		var sResponse = oEvent.getParameter("response");
		if (sResponse) {
			var sMsg = "";
			var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
			if (m[1] == "200") {
				sMsg = "Return Code: " + m[1] + "\n" + m[2], "SUCCESS", "Upload Success";
				oEvent.getSource().setValue("");
			} else {
				sMsg = "Return Code: " + m[1] + "\n" + m[2], "ERROR", "Upload Error";
			}

			sap.m.MessageToast.show(sMsg);
		}
	},

	handleUploadPress: function(oEvent) {
		var oFileUploader = this.getView().byId("fileUploader");
		oFileUploader.upload();
	}
});