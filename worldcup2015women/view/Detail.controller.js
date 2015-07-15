jQuery.sap.require("util.Formatter");

sap.ui.controller("view.Detail", {

	onInit: function() {
		if (sap.ui.Device.system.phone) {
			this.byId("detailPage").setShowNavButton(true);
		};
	},
	
	onPress:function(oEvent){
		var oContext = oEvent.oSource.getBindingContext("rounds");
		// Trigger the navigation via the event bus
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav","to",{id:"Game", context:oContext});
	},
	
	handleBack : function (oEvent) {
		sap.ui.getCore().getEventBus().publish("nav","back");
	}
	
});