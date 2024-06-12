sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/qunit/integration/pages/Common"
], function(Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheIFrameTreePage: {
			baseClass: Common,
			actions: {
				iSelectItem: function (sText) {
					this.waitFor({
						matchers: function () {
							return Opa5.getContext().recorderWindow.sap.ui.require("sap/ui/thirdparty/jquery")("tag:contains(" + sText + ")");
						},
						actions: function ($item) {
							$item.trigger("click");
						},
						errorMessage: "Cannot find tree item"
					});
				},
				iSelectActionWithItem: function (sText, sAction) {
					this.iShowContextMenuItem(sText);
					this.iPressContextMenuAction(sAction);
				},
				iShowContextMenuItem: function(sText) {
					this.waitFor({
						matchers: [
							function () {
								return Opa5.getContext().recorderWindow.sap.ui.require("sap/ui/thirdparty/jquery")("tag:contains(" + sText + ")");
							}
						],
						success: function ($item) {
							var mOffset = $item.offset();
							if (!mOffset) {
								Opa5.assert.ok(mOffset, "Cannot get offset of item " + $item + ". Maybe the recorder is not loaded?");
							}
							// workaround for limitations for right click in iframe
							this.iWaitForPromise(new Promise(function (success) {
								Opa5.getContext().recorderWindow.sap.ui.require(["sap/ui/testrecorder/interaction/ContextMenu"],
									function (ContextMenu) {
										ContextMenu.show({
											domElementId: $item.parent().attr("data-id"),
											location: {
												x: $item.offset().left,
												y: $item.offset().top
											},
											withEvents: true,
											items: {
												highlight: false
											}
										});
									success();
								});
							}));
						},
						errorMessage: "Cannot find context menu item"
					});
				},
				iPressContextMenuAction: function(sAction) {
					this.waitFor({
						matchers: [
							function () {
								return Opa5.getContext().recorderWindow.sap.ui.require("sap/ui/thirdparty/jquery")("div:contains(" + sAction + "):last");
							}
						],
						actions: function ($item) {
							$item.trigger("click");
						},
						errorMessage: "Cannot find context menu item"
					});
				  }
			},

			assertions: {
				iShouldSeeTheHighlightedItem: function (sText) {
					this.waitFor({
						matchers: function () {
							var oTag = Opa5.getContext().recorderWindow.sap.ui.require("sap/ui/thirdparty/jquery")("tag:contains(" + sText + ")");
							return oTag.parent().attr("selected");
						},
						success: function (bSelected) {
							Opa5.assert.ok(bSelected, "Item should be highlighted");
						},
						errorMessage: "Cannot find tree item"
					});
				}
			}
		}
	});
});
