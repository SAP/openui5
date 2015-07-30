sap.ui.define([
		'sap/m/MessagePopover',
		'sap/m/MessagePopoverItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessagePopover, MessagePopoverItem, Controller, JSONModel) {

	var oMessageTemplate = new MessagePopoverItem({
		type: '{type}',
		title: '{title}',
		description: '{description}'
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