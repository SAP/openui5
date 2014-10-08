sap.ui.controller("serializer.view.TestHtml", {

	onInit : function () {
		var model = new sap.ui.model.json.JSONModel({
			name : "Skoda Fabia",
			price : "14000"
		});
		this.getView().setModel(model);
	},

	handleButtonPress : function () {
		this.getView().byId("buttonPressLabel").setText("Button Pressed!");
	},

	formatPrice : function (sValue) {
		return sValue + " EUR";
	}
});