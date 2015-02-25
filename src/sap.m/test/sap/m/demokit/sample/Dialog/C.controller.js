sap.ui.controller("sap.m.sample.Dialog.C", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onDialogPress: function (oEvent) {
		var dialog = new sap.m.Dialog({
			title: 'Available Products',
			content: new sap.m.List({
				items: {
					path: '/ProductCollection',
					template: new sap.m.StandardListItem({
						title: "{Name}",
						counter: "{Quantity}"
					})
				}
			}),
			beginButton: new sap.m.Button({
				text: 'Close',
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});

		//to get access to the global model
		this.getView().addDependent(dialog);
		dialog.open();
	},

	onDialogWithSizePress: function (oEvent) {
		var dialog = new sap.m.Dialog({
			title: 'Available Products',
			contentWidth: "550px",
			contentHeight: "300px",
			content: new sap.m.List({
				items: {
					path: '/ProductCollection',
					template: new sap.m.StandardListItem({
						title: "{Name}",
						counter: "{Quantity}"
					})
				}
			}),
			beginButton: new sap.m.Button({
				text: 'Close',
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});

		//to get access to the global model
		this.getView().addDependent(dialog);
		dialog.open();
	}
});
