jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBoxTypes.C", {

	defaultMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"Build enterprise-ready web applications, responsive to all devices and running on the browser of your choice. That´s OpenUI5.", {
					title: "OpenUI5",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	},

	informationMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"OpenUI5 lets you build enterprise-ready web applications, responsive to all devices, running on almost any browser of your choice.", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "For your information",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	},

	warningMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"Ruling the world is a time-consuming task. You will not have a lot of spare time.", {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "To your attention",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	},

	errorMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"The only error you can make is not even trying.", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	},

	successMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time.", {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Success",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	},

	questionMessageBoxClickHandler: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				"Ruling the world is a time-consuming task. You will not have a lot of spare time.", {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: "Still convinced to do it?",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
		);
	}

});
