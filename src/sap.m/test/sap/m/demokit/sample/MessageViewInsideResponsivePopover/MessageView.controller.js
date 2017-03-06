sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, JSONModel) {
	"use strict";


	return Controller.extend("sap.m.sample.MessageViewInsideResponsivePopover.MessageView", {

		onInit: function () {

			var that = this;
			var	oLink = new sap.m.Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			var oMessageTemplate = new sap.m.MessageItem({
				type: '{type}',
				title: '{title}',
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				markupDescription: "{markupDescription}",
				link: oLink
			});

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				description: 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Warning',
				title: 'Warning without description',
				description: ''
			}, {
				type: 'Success',
				title: 'Success message',
				description: 'First Success message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Error',
				title: 'Error message',
				description: 'Second Error message description',
				subtitle: 'Example of subtitle',
				counter: 2
			}, {
				type: 'Information',
				title: 'Information message',
				description: 'First Information message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}];

			var oModel = new JSONModel();
			oModel.setData(aMockMessages);

			this._oMessageView = new sap.m.MessageView({
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});

			this._oMessageView.setModel(oModel);

			var oCloseButton =  new sap.m.Button ({
				text: "Close",
				press: function () {
					that._oPopover.close();
				}
			});

			var oPopoverToolbar = new sap.m.Toolbar({
				content: [
					new sap.m.ToolbarSpacer(),
					new sap.ui.core.Icon({
						color: "#bb0000",
						src: "sap-icon://message-error"}),
					new sap.m.Text({
						text: "Messages"
					}),
					new sap.m.ToolbarSpacer()
				]
			});

			this._oPopover = new sap.m.ResponsivePopover({
				showHeader: true,
				customHeader: oPopoverToolbar,
				contentWidth: "440px",
				contentHeight: "440px",
				verticalScrolling: false,
				modal: true,
				content: [
					this._oMessageView
				],
				endButton:oCloseButton
			});
		},

		handlePopoverPress: function (oEvent) {
			this._oPopover.openBy(oEvent.getSource());
		}

	});

});
