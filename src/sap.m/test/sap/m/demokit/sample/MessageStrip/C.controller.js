jQuery.sap.require("sap.m.MessageStrip");

sap.ui.controller("sap.m.sample.MessageStrip.C", {
	onMsgStripClose: function(oEvent) {
		// the ID of the label above the MessageStrip
		var sLabelId = oEvent.getSource().$().parent().prev().children().attr("id"),
			oLabel = sap.ui.getCore().byId(sLabelId);

		oLabel.destroy();
	}
});
