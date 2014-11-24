sap.ui.controller("sap.m.sample.UploadCollection.Page", {

	onInit: function () {
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/uploadCollection.json");
		this.getView().setModel(oModel);

		var aDataCB= {
				"items": [
				          {
				          	"key": "All",
				          	"text": "sap.m.ListSeparators.All"
									},
									{
										"key": "None",
										"text": "sap.m.ListSeparators.None"
									}
				],
				"selectedKey": "None"
		};

		var oModelCB = new sap.ui.model.json.JSONModel();
		oModelCB.setData(aDataCB);

		var oSelect=sap.ui.getCore().byId(this.getView().getId() + "--tbSelect");
		oSelect.setModel(oModelCB);
	},

	onFileDeleted: function(oEvent) {
		var oData = this.oView.getModel().getData();
		var aItems = oData.items;
		var sDocumentId = oEvent.getParameter("documentId");
		var bSetData = false;

		jQuery.each(aItems, function(index) {
			if (aItems[index] && aItems[index].documentId === sDocumentId) {
				aItems.splice(index, 1);
				bSetData = true;
			};
		});
		if (bSetData === true) {
			this.oView.getModel().setData(oData);
		};
	},


	onFileRenamed: function(oEvent) {
		var oData = this.oView.getModel().getData();
		var aItems = oData.items;
		var sDocumentId = oEvent.getParameter("documentId");
		var bSetData = false;

		jQuery.each(aItems, function(index) {
			if (aItems[index] && aItems[index].documentId === sDocumentId) {
				aItems[index].fileName = oEvent.getParameter("fileName");
			};
		});
		this.oView.getModel().setData(oData);
	},

	onUploadComplete: function(oEvent) {
		var fnCurrentDate = function() {
			var date = new Date();
			var day = date.getDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();

			if (day < 10) {
				day = '0' + day
			};
			if (month < 10) {
				month = '0' + month
			}
			return year + '-' + month + '-' + day;
		};

		if (oEvent) {
			var oData = this.oView.getModel().getData();
			var oItem = {};
			var sUploadedFiles = oEvent.getParameters().oSource.mProperties.value;
			sUploadedFiles = sUploadedFiles.substring(1, sUploadedFiles.length - 2);
			var aUploadedFiles = sUploadedFiles.split(/\" "/);
			for (var i = 0; i < aUploadedFiles.length; i++) {
				oItem = {
					"contributor" : "You",
					"documentId" : oData.items[1].documentId,
					"fileName" : aUploadedFiles[i],
					"fileSize" : 10, // TODO get file size
					"mimeType" : "",
					"thumbnailUrl" : "",
					"uploadedDate" : fnCurrentDate(),
					"url" : "myUrl"
				};
				oData.items.unshift(oItem);
			};
			this.oView.getModel().setData(oData);
			sap.m.MessageToast.show("Upload successful");
		}
	},

	onPress: function (oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show(oEvent.getSource().getId() + " Pressed");
	},

	onSelectChange:  function(oEvent) {
		var oUploadCollection=sap.ui.getCore().byId(this.getView().getId() + "--UploadCollection");
		oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
	}
});