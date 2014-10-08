sap.ui.jsview("view.detail.Empty", {

	createContent : function(oController) {
		return new sap.m.Page({
			content: [
				new sap.m.Text({
					text: "This demo application shows you how to use the sap.m.SplitApp control with basic route based navigation handling."
				}).addStyleClass("welcomeText")
			]
		});
	}
});
