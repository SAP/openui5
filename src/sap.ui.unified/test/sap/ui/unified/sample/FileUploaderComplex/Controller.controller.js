sap.ui.controller("sap.ui.unified.sample.FileUploaderComplex.Controller", {
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
		if(!oFileUploader.getValue()) {
			sap.m.MessageToast.show("Choose a file first");
			return;
		}
		oFileUploader.upload();
	},

	handleTypeMissmatch: function(oEvent) {
		var aFileTypes = oEvent.getSource().getFileType();
		$.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
		var sSupportedFileTypes = aFileTypes.join(", ");
		sap.m.MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
								" is not supported. Choose one of the following types: " +
								sSupportedFileTypes);
	},

	handleValueChange: function(oEvent) {
		sap.m.MessageToast.show("Press 'Upload File' to upload file '" +
								oEvent.getParameter("newValue") + "'");
	}
});