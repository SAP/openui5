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
							return Opa5.getContext().recorderWindow.jQuery("tag:contains(" + sText + ")");
						},
						actions: function ($item) {
							$item.click();
						},
						errorMessage: "Cannot find tree item"
					});
				},
				iSelectActionWithItem: function (sText, sAction) {
					this.waitFor({
						matchers: [
							function () {
								return Opa5.getContext().recorderWindow.jQuery("tag:contains(" + sText + ")");
							},
							function ($item) {
								// workaround for limitations for right click in iframe
								Opa5.getContext().recorderWindow.sap.ui.testrecorder.interaction.ContextMenu.show({
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
								return true;
							},
							function () {
								return Opa5.getContext().recorderWindow.jQuery("div:contains(" + sAction + "):last");
							}
						],
						actions: function ($item) {
							$item.click();
						},
						errorMessage: "Cannot find context menu item"
					});
				}
			},

			assertions: {
				iShouldSeeTheHighlightedItem: function (sText) {
					this.waitFor({
						matchers: function () {
							var oTag = Opa5.getContext().recorderWindow.jQuery("tag:contains(" + sText + ")");
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
