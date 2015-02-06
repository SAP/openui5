sap.ui.controller("sap.m.sample.ActionSelect.C", {

	onInit: function () {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);

		// add buttons with javaScript (yet not possible with XML views)
		var oHeaderSelect = this.getView().byId("select");
		var fnOnPress = function (oEvt) {
			sap.m.MessageToast.show("Executed " + oEvt.getSource().getText());
			oHeaderSelect.close();
		};
		oHeaderSelect.addButton(
			new sap.m.Button({
				text: "Action 1",
				press: fnOnPress
			})
		);
		oHeaderSelect.addButton(
			new sap.m.Button({
				text: "Action 2",
				press: fnOnPress
			})
		);
	}
});
