sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileAsLaunchTile.Page", {
		press : function(evt) {
			MessageToast.show("The GenericTile is pressed.");
		},

		onFormSubmit: function(evt) {
			var iMiliSeconds = parseInt(this.byId("loadingMinSeconds").getValue()) || 0;
			var content = this.oView.getAggregation('content');
			for (var i = 1; i < content.length; i++) {
				content[i].setState("Loading");
			}
			setTimeout(function() {
				for (var j = 1; j < content.length; j++) {
					content[j].setState("Loaded");
				}
			}, iMiliSeconds * 1000);
		}
	});

	return PageController;
});