sap.ui.jsview("sap.ui.core.sample.View.async.Root", {

	getControllerName: function() {
		return "sap.ui.core.sample.View.async.Sample";
	},

	createContent: function(oController) {

		var oButton, oLabel, oSwitch, oView;

		oButton = new sap.m.Button({
			text: "RELOAD",
			icon: "sap-icon://refresh",
			press: function() {
				var oView = this.getParent();
				var sId = oView.createId("sampleView");
				var oSampleView = oView.byId(sId);
				var bSync = oView.byId("switch").getState();

				// remove the old view for refresh
				oView.removeContent(oSampleView);
				oSampleView.destroy();
				// delete the html view from cache to achieve a real refresh
				delete sap.ui.core.mvc.HTMLView._mTemplates["test-resources/sap/ui/core/demokit/sample/View/async/Async.view.html"];
				// add the newly loaded view
				oView.addContent(sap.ui.xmlview({
					id: sId,
					viewName: (bSync ? "sap.ui.core.sample.View.async.SyncSample" : "sap.ui.core.sample.View.async.Sample")
				}));
			}
		});

		oSwitch = new sap.m.Switch({
			id: this.createId("switch")
		});

		oLabel = new sap.m.Label({
			text: "SYNC:"
		});
		oLabel.addStyleClass("sapUiSmallMargin");

		oView = sap.ui.xmlview({
			id: this.createId("sampleView"),
			viewName: "sap.ui.core.sample.View.async.Sample"
		});

		return [oButton, oLabel, oSwitch, oView];
	}

});
