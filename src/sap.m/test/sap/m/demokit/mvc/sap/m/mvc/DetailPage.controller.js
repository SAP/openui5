sap.ui.controller("sap.m.mvc.DetailPage", {

	backTriggered : function(evt) { 
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "back");
	}

});