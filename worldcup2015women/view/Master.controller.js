sap.ui.controller("view.Master", {

	baseUrl:"http://footballdb.herokuapp.com/api/v1/event/world.2014",
	localBaseUrl:"data", // fallback
	callbackString: "?callback=?",

	onInit: function() {
		jQuery.sap.require("sap.ui.model.json.JSONModel");

		var oRoundsModel = new sap.ui.model.json.JSONModel();
		
		// fallback to local data
		if (jQuery.sap.getUriParameters().get("responderOff") !== "true") {
			this.callbackString = ""; // no JSONP
			this.baseUrl = this.localBaseUrl;
		}

		// Load data using JSONP
		$.getJSON(this.baseUrl + "/rounds" + this.callbackString, function(json) {
			oRoundsModel.setData(json);
		});

		sap.ui.getCore().setModel(oRoundsModel, "rounds");
	},

	onSelectionChange: function(oEvent){
		var oListItem = oEvent.getParameter("listItem");
		var oContext = oListItem.getBindingContext("rounds");
		var path = oContext.getPath();

		// Start loading additional game data if not yet done
		if(!oContext.getProperty("games")){
			// Load data using JSONP
			$.getJSON(this.baseUrl + "/round/" + oContext.getProperty("pos") + this.callbackString, function(json) {
				oListItem.getModel("rounds").setProperty(path + "/games", json.games);
			});
		}
		// Trigger the navigation via the event bus
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav","to",{id:"Detail", context:oContext});
	}

});