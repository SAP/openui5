jQuery.sap.require("sap.m.MessagePopover");

var oMessageTemplate = new sap.m.MessagePopoverItem({
	type: '{type}',
	title: '{title}',
	description: '{description}'
});


var oMessagePopover = new sap.m.MessagePopover({
	items: {
		path: '/',
		template: oMessageTemplate
	}
});

sap.ui.controller("sap.m.sample.MessagePopover.C", {
	onInit : function() {
		// create any data and a model and set it to the view

		var aMockMessages = [{
			type: 'Error',
			title: '1 Error message',
			description: 'First Error message description'
		}, {
			type: 'Warning',
			title: '1 Warning without description',
			description: ''
		}, {
			type: 'Success',
			title: '1 Success message',
			description: 'First Success message description'
		}, {
			type: 'Error',
			title: '2 Error message',
			description: 'Second Error message description'
		}, {
			type: 'Information',
			title: '1 Information message',
			description: 'First Information message description'
		}];

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(aMockMessages);

		oMessagePopover.setModel(oModel);

	},

	handleMessagePopoverPress: function(oEvent) {
		oMessagePopover.openBy(oEvent.getSource());
	}
});
