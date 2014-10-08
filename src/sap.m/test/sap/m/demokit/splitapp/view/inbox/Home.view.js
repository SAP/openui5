// This is the first view in master area and tapping on the list items leads to a page navigation in master area.
// The tap event handler is called when user taps the list item.
sap.ui.jsview("view.inbox.Home", {
	getControllerName: function(){
		return "view.inbox.Home";
	},
	createContent : function(oController) {
		var oInboxList = new sap.m.List({
			inset: true,
			headerText: "Inbox",
			items: [
				new sap.m.StandardListItem({
					title : "All",
					icon : "{img>/icon/INBOX}",
					activeIcon: "{img>/icon/INBOX_ACTIVE}",
					type : sap.m.ListType.Active,
					counter: 3,
					press : [oController.onListItemTap, oController]
				}),
				new sap.m.StandardListItem({
					title : "Unread",
					icon : "{img>/icon/UNREAD}",
					activeIcon: "{img>/icon/UNREAD_ACTIVE}",
					type : sap.m.ListType.Active,
					counter: 2,
					press : [oController.onListItemTap, oController]
				}),
				new sap.m.StandardListItem({
					title : "Important",
					icon : "{img>/icon/IMPORTANT}",
					activeIcon: "{img>/icon/IMPORTANT_ACTIVE}",
					type : sap.m.ListType.Active,
					counter: 2,
					press : [oController.onListItemTap, oController] 
				})
			]
		});
		
		var oRestList = new sap.m.List({
			inset: true,
			items: [
				new sap.m.StandardListItem({
					title : "Drafts (Inactive)",
					type : sap.m.ListType.Inactive,
					counter: 8
				}),
				new sap.m.StandardListItem({
					title : "Sent Items (Inactive)",
					type : sap.m.ListType.Inactive
				}),
				new sap.m.StandardListItem({
					title : "Deleted Items (Inactive)",
					type : sap.m.ListType.Inactive
				})
			]
		});
		
		var oPage = new sap.m.Page({
			icon: "{img>/icon/UI5}",
			title: "Mail",
			content: [oInboxList, oRestList]
		});
		
		if(!sap.ui.Device.system.phone){
			//Footer is added to show the switch between SplitApp modes.
			oPage.setFooter(new sap.m.Toolbar({
				content: [
					new sap.m.ToolbarSpacer(),
					new sap.m.Select({
						items: [new sap.ui.core.Item({
							key: "showhide",
							text: "ShowHideMode"
						}), new sap.ui.core.Item({
							key: "stretch",
							text: "StretchCompressMode"
						}),new sap.ui.core.Item({
							key: "hide",
							text: "HideMode"
						}),new sap.ui.core.Item({
							key: "popover",
							text: "PopoverMode"
						})],
						change: function(oControlEvent) {
							oController.onSelectChange(oControlEvent);
						}
					}),
					new sap.m.ToolbarSpacer()
				]
			}));
		}
		
		return oPage;
	}
});