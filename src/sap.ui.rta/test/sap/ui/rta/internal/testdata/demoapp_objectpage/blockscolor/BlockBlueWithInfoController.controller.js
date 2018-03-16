sap.ui.controller("sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlueWithInfoController", {
	onInit: function () {
		"use strict";
	},

	onAfterRendering: function() {
		"use strict";
		var oText = this.byId("moreContentText");
		var sMode = this.getView().getParent().getMode();
		(sMode === "Expanded") ? oText.setText("...More Content") :  oText.setText("");
	},

	onParentBlockModeChange: function () {
		"use strict";
	}
});
