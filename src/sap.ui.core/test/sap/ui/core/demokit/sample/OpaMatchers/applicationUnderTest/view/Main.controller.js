sap.ui.controller("view.Main", {

	onInit : function () {
		var that = this;

		window.setTimeout(function () {
			that.byId("changingButton").setText("Changed text");
		},5000);
	}

});
