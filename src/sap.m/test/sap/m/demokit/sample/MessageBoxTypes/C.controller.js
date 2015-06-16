sap.ui.define(['sap/m/MessageBox','sap/ui/core/mvc/Controller'],
	function(MessageBox, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxTypes.C", {

		defaultMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"Build enterprise-ready web applications, " +
					"responsive on all devices and running on a modern browser of your choice. " +
					"That`s OpenUI5.",
					{
						title: "OpenUI5",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		},

		informationMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"OpenUI5 lets you build enterprise-ready web applications, " +
					"responsive on all devices and running on a modern browser of your choice.",
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "For your information",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		},

		warningMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"Ruling the world is a time-consuming task. You will not have a lot of spare time.",
					{
						icon: MessageBox.Icon.WARNING,
						title: "To your attention",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		},

		errorMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"The only error you can make is not even trying.",
					{
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		},

		successMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"One of the keys to success is creating realistic goals that can be achieved" +
					" in a reasonable amount of time.",
					{
						icon: MessageBox.Icon.SUCCESS,
						title: "Success",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		},

		questionMessageBoxClickHandler: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					"Ruling the world is a time-consuming task. You will not have a lot of spare time.",
					{
						icon: MessageBox.Icon.QUESTION,
						title: "Still convinced to do it?",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						styleClass: bCompact? "sapUiSizeCompact" : ""
					}
			);
		}

	});


	return CController;

});
