sap.ui.jsview("view.App", {

	getControllerName: function () {
		return "view.App";
	},

	createContent : function (oController) {

		// to avoid scrollbars on desktop the root view must be set to block display
		this.setDisplayBlock(true);

		return new sap.m.SplitApp("splitApp", {});
	}

});