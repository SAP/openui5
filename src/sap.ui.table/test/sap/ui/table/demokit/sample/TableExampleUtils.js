sap.ui.define("sap/ui/table/sample/TableExampleUtils", [
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/FeedListItem"
], function (JSONModel, Popover, List, FeedListItem) {
	"use strict";

	var Utils = {};

	Utils.showInfo = function(aItems, oBy) {
		if (typeof(aItems) == "string") {
			jQuery.ajax(aItems, {
				dataType: "json",
				sync: true,
				success: function (oData) {
					Utils.showInfo(oData, oBy);
				}
			});
			return;
		}

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
	};

	return Utils;

}, true /* bExport */);