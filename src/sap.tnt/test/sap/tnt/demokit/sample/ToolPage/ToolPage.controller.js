sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.tnt.sample.ToolPage.ToolPage", {
		model : new sap.ui.model.json.JSONModel(),
		data : {
			navigation: [{
				title: 'Root Item',
				icon: 'sap-icon://employee',
				expanded: true,
				items: [{
					title: 'Child Item 1',
					key: 'page1'
				}, {
					title: 'Child Item 2',
					enabled: false
				}, {
					title: 'Child Item 3',
					key: 'page2'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://building',
				enabled: false
			}, {
				title: 'Root Item',
				icon: 'sap-icon://card',
				expanded: false,
				items: [{
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}, {
					title: 'Child Item'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://action',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://action-settings',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://activate',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://activities',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://add',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://arobase',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://attachment',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://badge',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://basket',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://bed',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}, {
				title: 'Root Item',
				icon: 'sap-icon://bookmark',
				expanded: false,
				items: [{
					title: 'Child Item 1'
				}, {
					title: 'Child Item 2'
				}, {
					title: 'Child Item 3'
				}]
			}
			],
			fixedNavigation: [{
				title: 'Fixed Item 1',
				icon: 'sap-icon://employee'
			}, {
				title: 'Fixed Item 2',
				icon: 'sap-icon://building'
			}, {
				title: 'Fixed Item 3',
				icon: 'sap-icon://card'
			}],
			headerItems: [
			{
					text: "File"
			}, {
				text: "Edit"
			}, {
				text: "View"
			}, {
				text: "Settings"
			}, {
				text: "Help"
			}
			]
		},
		onInit : function() {
			this.model.setData(this.data);
			this.getView().setModel(this.model)
		},

		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey());
		},

		//onSideNavButtonPress : function() {
		//	var viewId = this.getView().getId();
		//	var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
        //
		//	toolPage.setSideExpanded(!toolPage.getSideExpanded());
		//}

	});


	return CController;

});
