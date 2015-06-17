jQuery.sap.require("sap.m.MessageStrip");


sap.ui.controller("sap.m.sample.DynamicMessageStripGenerator.C", {
	showMsgStrip: function() {
		var oMs = sap.ui.getCore().byId("msgStrip");
		
		if (oMs) {
			oMs.destroy();
		}
		this._generateMsgStrip();
	},
	_generateMsgStrip: function() {
		var aTypes = ["Information", "Warning", "Error", "Success"],
			oVC = this.getView().byId("oVerticalContent"),

			oMsgStrip = new sap.m.MessageStrip("msgStrip", {
				text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam, quis nostrud exercitation ullamco.",
				showCloseButton: !(Math.round(Math.random())),
				showIcon: !(Math.round(Math.random())),
				type: aTypes[Math.round(Math.random() * 4)]
			});

		oVC.addContent(oMsgStrip);
	}
});
