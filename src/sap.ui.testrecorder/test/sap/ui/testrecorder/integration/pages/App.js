sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/thirdparty/jquery",
	"sap/ui/testrecorder/integration/pages/Common"
], function(Opa5, jQuery, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			baseClass: Common,
			actions: {
				iActOnControl:  function (mSelector, sAction) {
					this.waitFor(jQuery.extend({}, mSelector, {
						success: function (aControl) {
							var oDom = aControl[0].$();
							return this.waitFor({
								matchers: [function () {
									// workaround for limitations for right click in iframe
									Opa5.getWindow().sap.ui.testrecorder.interaction.ContextMenu.show({
										domElementId: aControl[0].getId(),
										location: {
											x: oDom.offset().left,
											y: oDom.offset().top
										}
									});
									return true;
								}, function () {
									return Opa5.getJQuery()("div:contains(" + sAction + "):last");
								}],
								actions: function ($item) {
									$item.click();
								},
								errorMessage: "Cannot find context menu item"
							});
						}
					}));
				}
			},
			assertions: {
				iShouldSeeTheSelectedControl: function (mSelector) {
					this.waitFor(jQuery.extend({}, mSelector, {
						success: function (aControl) {
							var mControlRect = aControl[0].$()[0].getBoundingClientRect();
							var mHighlightRect = Opa5.getJQuery()("#ui5-test-recorder-highlighter > div")[0].getBoundingClientRect();
							Opa5.assert.deepEqual(mControlRect, mHighlightRect, "Should highlight the root element");
						}
					}));
				}
			}
		}
	});
});
