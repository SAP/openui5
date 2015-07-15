jQuery.sap.require("util.Formatter");

sap.ui.controller("view.Game", {
	
	onInit: function() {
		var oTeamModel = new sap.ui.model.json.JSONModel("data/players.json");
		this.getView().setModel(oTeamModel, "teams");
		
		
		var mPositions = {
			"1": "Goalkeeper",
			"2": "Defender",
			"3": "Midfielder",
			"4": "Forward"
		};
		
		var oNumberSorter = new sap.ui.model.Sorter("number", false);
		oNumberSorter.fnCompare = function(a, b) {
			var ia = parseInt(a,10), ib = parseInt(b, 10);
			if (ia+ib > 0) { // there might be no numbers for players
				if (ia < ib) {
					return -1;
				}
				if (ia > ib) {
					return 1;
				}
			}
			return 0;	
		};
		
		this.byId("teamTable").getBinding("items").sort(
			[
			new sap.ui.model.Sorter("positionCode", false, function (oContext) {
				var sPosition = mPositions[oContext.getProperty("positionCode")];
				return sPosition;
				}),
			oNumberSorter
		]);
		
		this.getView().addEventDelegate({
			onBeforeShow: jQuery.proxy(this.initTeamTable, this)
		});
		
	},
	
	initTeamTable: function(oEvent) {
		var sKey = this.byId("itb").getItems()[0].getKey(); // first tab is initially selected
		this.updateTeamTable(sKey);
	},
	
	handleTabClick: function(oEvt) {
		this.updateTeamTable(oEvt.getParameter("key"));
	},
	
	updateTeamTable: function(sKey) {
		this.byId("teamTable").bindElement("teams>/" + sKey);
	},
	
	handleBack : function (oEvent) {
		sap.ui.getCore().getEventBus().publish("nav","back");
	}
});