sap.ui.define([
		'sap/m/MessagePopover',
		'sap/m/MessagePopoverItem',
		'sap/m/Link',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessagePopover, MessagePopoverItem, Link, Controller, JSONModel) {


	oLink = new Link({
		text: "Show more information",
		href: "http://sap.com",
		target: "_blank"
	});

	var oMessageTemplate = new MessagePopoverItem({
		type: '{type}',
		title: '{title}',
		description: '{description}',
		subtitle: '{subtitle}',
		counter: '{counter}',
		link: oLink
	});

	var oMessagePopover1 = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});

	var oMessagePopover2 = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});

	var oMessagePopover3 = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		},
		initiallyExpanded: false
	});

	var CController = Controller.extend("sap.m.sample.MessagePopover.C", {
		onInit: function () {
			// create any data and a model and set it to the view

			var sErrorDescription = 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
				'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
				'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
				'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
				'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
				'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				description: sErrorDescription,
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

			var viewModel = new JSONModel()
			viewModel.setData({
				messagesLength: aMockMessages.length + ''
			});

			this.getView().setModel(viewModel);

			oMessagePopover1.setModel(oModel);
			oMessagePopover2.setModel(oModel);
			oMessagePopover3.setModel(oModel);
		},

		handleMessagePopoverPress1: function (oEvent) {
			oMessagePopover1.openBy(oEvent.getSource());
		},

		handleMessagePopoverPress2: function (oEvent) {
			oMessagePopover2.openBy(oEvent.getSource());
		},

		handleMessagePopoverPress3: function (oEvent) {
			oMessagePopover3.openBy(oEvent.getSource());
		}
	});

	return CController;

});