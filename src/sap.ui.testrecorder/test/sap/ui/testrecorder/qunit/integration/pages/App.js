sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/thirdparty/jquery",
	"sap/ui/testrecorder/qunit/integration/pages/Common",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function(Opa5, jQuery, Common, EnterText, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			baseClass: Common,
			actions: {
				iActOnControl:  function (mSelector, sAction) {
					this.waitFor(jQuery.extend({}, mSelector, {
						success: function (aControl) {
							var oControl = Array.isArray(aControl) ? aControl[0] : aControl;
							var oDom = oControl.$();
							return this.waitFor({
								matchers: [function () {
									// workaround for limitations for right click in iframe
									Opa5.getWindow().sap.ui.testrecorder.interaction.ContextMenu.show({
										domElementId: oControl.getId(),
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
									$item.trigger("click");
								},
								errorMessage: "Cannot find context menu item"
							});
						}
					}));
				},
				iEnterText: function (mSelector, sText) {
					this.waitFor(jQuery.extend({}, mSelector, {
						actions: new EnterText({
							text: sText
						}),
						errorMessage: "Cannot find control with selector " + JSON.stringify(mSelector)
					}));
				},
				iOpenTheDatePicker: function () {
					this.waitFor({
						id: "container-myComponent---main--DatePickerOne-icon",
						actions: new Press(),
						errorMessage: "Cannot find the sap.m.DatePicker"
					});
				}
			},
			assertions: {
				iShouldSeeTheSelectedControl: function (mSelector) {
					this.waitFor(jQuery.extend({}, mSelector, {
						success: function (aControl) {
							var oControl = Array.isArray(aControl) ? aControl[0] : aControl;
							var mControlRect = oControl.$()[0].getBoundingClientRect();
							var mHighlightRect = Opa5.getJQuery()("#ui5-test-recorder-highlighter > div")[0].getBoundingClientRect();
							var bMatch = true;
							["left", "top", "right", "bottom", "x", "y", "width", "height"].forEach(function (sSide) {
								if (mControlRect[sSide] && mHighlightRect[sSide] && bMatch) {
									bMatch = Math.round(mControlRect[sSide]) === Math.round(mHighlightRect[sSide]);
								}
							});
							Opa5.assert.ok(bMatch, "Should highlight the root element");
						}
					}));
				}
			}
		}
	});
});
