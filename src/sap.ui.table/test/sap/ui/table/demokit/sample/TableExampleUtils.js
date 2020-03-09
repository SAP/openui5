sap.ui.define("sap/ui/table/sample/TableExampleUtils", [
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/Button",
	"sap/m/FeedListItem"
], function(JSONModel, Popover, List, Button, FeedListItem) {
	"use strict";

	function showInfo(aItems, oBy) {
		var oPopover = new Popover({
			showHeader: false,
			placement: "Auto",
			afterClose: function(){
				oPopover.destroy();
			},
			content: [
				new List({
					items: {
						path: "/items",
						template: new FeedListItem({
							senderActive: false,
							sender: "{title}",
							showIcon: false,
							text: "{text}"
						})
					}
				})
			]
		});

		jQuery.sap.syncStyleClass("sapUiSizeCompact", oBy, oPopover);
		jQuery.sap.syncStyleClass("sapUiSizeCozy", oBy, oPopover);
		oPopover.setModel(new JSONModel({items: aItems}));
		oPopover.openBy(oBy, true);
	}

	var Utils = {};

	Utils.showInfo = function(aItems, oBy) {
		if (typeof (aItems) == "string") {
			jQuery.ajax(aItems, {
				dataType: "json",
				success: function(oData) {
					showInfo(oData, oBy);
				}
			});
		} else {
			showInfo(aItems, oBy);
		}
	};

	Utils.createInfoButton = function(sInfoFor) {
		return new Button({
			icon: "sap-icon://hint",
			tooltip: "Show information",
			press: function(oEvent){
				Utils.showInfo(sap.ui.require.toUrl(sInfoFor) + "/info.json", oEvent.getSource());
			}
		});
	};

	return Utils;

}, true /* bExport */);