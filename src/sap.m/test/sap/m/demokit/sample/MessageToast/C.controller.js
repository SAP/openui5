sap.ui.controller("sap.m.sample.MessageToast.C", {

	handleMessageToastPress: function(oEvent) {
		var msg = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.';
		sap.m.MessageToast.show(msg);
	}
});
