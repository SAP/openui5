/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"./waitForVariantManager",
	"./waitForVariantManagerOverlay",
	"./waitForVariantManagerButton",
	"./waitForVariantManagerItem",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	Ancestor,
	Press,
	EnterText,
	waitForVariantManager,
	waitForVariantManagerOverlay,
	waitForVariantManagerButton,
	waitForVariantManagerItem,
	TestUtil
) {
    "use strict";

    return {
		iPressOnTheVariantManagerButton: function(sVariantName) {
			return waitForVariantManager.call(this, {
				text: sVariantName,
				actions: new Press(),
				success: function onVariantManagerButtonPressed(oVariantManagerButton) {
					Opa5.assert.ok(true, "The variant manager button was pressed");
				}
			});
		},

		iPressOnTheVariantManagerSaveAsButton: function() {

			// "Save As"
			var REORDER_BUTTON_TEXT = TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEAS");

			return waitForVariantManagerButton.call(this, {
				properties: {
					text: REORDER_BUTTON_TEXT
				},
				ancestorProperties: {

					// title: "My Views"
					title: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_VARIANTS")
				},
				actions: new Press(),
				success: function onVariantManagerSaveAsButtonFound(oSaveAsButton) {
					Opa5.assert.ok(true, 'The variant manager "' + REORDER_BUTTON_TEXT + '" button was pressed');
				},
				errorMessage: 'The variant manager "' + REORDER_BUTTON_TEXT + '" button was not found'
			});
		},

		iSaveVariantAs: function(sVariantCurrentName, sVariantNewName) {
			var SAVE_VARIANT_TITLE = TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEDIALOG");

			return waitForVariantManagerOverlay.call(this, {
				controlType: "sap.m.Dialog",
				properties: {

					// title: Save View
					title: SAVE_VARIANT_TITLE
				},
				matchers: undefined, // FIXME: default ancestor matcher does not work, but it should
				success: onSaveVariantViewFound
			});

			function onSaveVariantViewFound(oVariantManagerOverlay) {
				this.waitFor({
					controlType: "sap.m.Input",
					properties: {
						value: sVariantCurrentName,
						editable: true,
						enabled: true,
						type: "Text"
					},
					matchers: new Ancestor(oVariantManagerOverlay),
					actions: new EnterText({
						text: sVariantNewName
					}),
					success: onVariantChanged,
					errorMessage: 'The "Save View" input field was found or the text could not be entered'
				});
			}

			function onVariantChanged(aInputFields) {
				var sMessage = 'The "Save View/Variant" input field was found and it value was changed to ' + sVariantNewName;
				Opa5.assert.strictEqual(aInputFields.length, 1, sMessage);

				var SAVE_BUTTON = TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVE");

				this.waitFor({
					controlType: "sap.m.Button",
					properties: {
						text: SAVE_BUTTON,
						enabled: true
					},
					actions: new Press(),
					success: onVariantSaved,
					errorMessage: 'The "Save View/Variant" button was not found'
				});
			}

			function onVariantSaved(aSaveButtons) {
				var sMessage = 'The "Save View/Variant" button was found and activated (the new variant should be saved)';
				Opa5.assert.strictEqual(aSaveButtons.length, 1, sMessage);
			}
		},

		iSelectVariant: function(sVariantName) {
			waitForVariantManagerItem.call(this, {
				itemText: sVariantName,
				actions: new Press()
			});
		}
	};
});
