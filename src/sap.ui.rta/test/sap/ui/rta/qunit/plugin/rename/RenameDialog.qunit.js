/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Lib,
	DesignTime,
	OverlayRegistry,
	nextUIUpdate,
	RenameDialog,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	async function openDialog(oRenameDialog, oOverlay, fnCallback, mCustomPropertyBag) {
		const oCreatePopupStub = sandbox.stub(oRenameDialog, "_createPopup");
		oCreatePopupStub.callsFake(async function(...args) {
			const oPopover = await oCreatePopupStub.wrappedMethod.apply(this, args);
			oPopover.attachAfterOpen(() => {
				fnCallback({
					oOkButton: oPopover.getBeginButton(),
					oCancelButton: oPopover.getEndButton(),
					oInput: oPopover.getContent()[0].getItems()[1],
					sTitle: oPopover.getTitle()
				});
			});
			return oPopover;
		});
		const mPropertyBag = {
			overlay: oOverlay,
			domRef: oOverlay.getDomRef(),
			action: {},
			...(mCustomPropertyBag || {})
		};
		const sNewLabel = await oRenameDialog.openDialogAndHandleRename(mPropertyBag);
		oCreatePopupStub.restore();
		return sNewLabel;
	}

	QUnit.module("Basic functionality", {
		async beforeEach(assert) {
			const fnDone = assert.async();
			this.oButton = new Button("button", { text: "My Button" });
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oRenameDialog = new RenameDialog();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oButton]
			});
			this.oDesignTime.attachEventOnce("synced", () => {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				fnDone();
			});
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oButton.destroy();
			this.oRenameDialog.destroy();
		}
	}, function() {
		QUnit.test("when opening the dialog", function(assert) {
			return openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oOkButton, oCancelButton, oInput }) => {
				assert.strictEqual(
					document.activeElement,
					oInput.getFocusDomRef(),
					"then the input is focused"
				);
				assert.strictEqual(
					window.getSelection().toString(),
					"My Button",
					"then the input content is selected"
				);
				assert.strictEqual(oInput.getValue(), "My Button", "then the input has the correct value");
				assert.strictEqual(oInput.getValueState(), "None", "then the input is valid");
				assert.strictEqual(oInput.getValueStateText(), "", "then the input has no error message");
				assert.strictEqual(oOkButton.getEnabled(), false, "then the OK button is initially disabled");
				oCancelButton.firePress();
			});
		});

		QUnit.test("when setting the acceptSameText property", async function(assert) {
			const sNewText = await openDialog(
				this.oRenameDialog,
				this.oButtonOverlay,
				({ oOkButton }) => {
					assert.strictEqual(oOkButton.getEnabled(), true, "then the OK button is initially enabled");
					oOkButton.firePress();
				},
				{
					acceptSameText: true
				}
			);
			assert.strictEqual(sNewText, "My Button", "then the same text is returned");
		});

		QUnit.test("when renaming to a valid text", async function(assert) {
			const sNewText = await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oOkButton, oInput }) => {
				oInput.setValue("New");
				oInput.fireLiveChange({ value: "New" });
				assert.strictEqual(oInput.getValueState(), "None", "then the input is valid");
				assert.strictEqual(oInput.getValueStateText(), "", "then the input has no error message");
				assert.strictEqual(oOkButton.getEnabled(), true, "then the OK button is enabled");
				oOkButton.firePress();
			});
			assert.strictEqual(sNewText, "New", "then the new text is returned");
		});

		QUnit.test("when cancel is pressed", async function(assert) {
			const sNewText = await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, oInput }) => {
				oInput.setValue("New");
				oInput.fireLiveChange({ value: "New" });
				oCancelButton.firePress();
			});
			assert.strictEqual(sNewText, undefined, "then no new text is returned");
		});

		QUnit.test("when renaming back to the original label", async function(assert) {
			const sNewText = await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oOkButton, oCancelButton, oInput }) => {
				oInput.setValue("New");
				oInput.fireLiveChange({ value: "New" });
				oInput.setValue("My Button");
				oInput.fireLiveChange({ value: "My Button" });
				assert.strictEqual(oInput.getValueState(), "None", "then the input is valid");
				assert.strictEqual(oInput.getValueStateText(), "", "then the input has no error message");
				assert.strictEqual(oOkButton.getEnabled(), false, "then the OK button is disabled");
				oCancelButton.firePress();
			});
			assert.strictEqual(sNewText, undefined, "then no new text is returned");
		});

		QUnit.test("when renaming to an invalid label", function(assert) {
			return openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oOkButton, oInput }) => {
				oInput.setValue("{someBinding}");
				oInput.fireLiveChange({ value: "{someBinding}" });
				assert.strictEqual(oInput.getValueState(), "Error", "then the input is invalid");
				assert.strictEqual(
					oInput.getValueStateText(),
					oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"),
					"then the input has an error message"
				);
				assert.strictEqual(oOkButton.getEnabled(), false, "then the OK button is disabled");
				oInput.setValue("New");
				oInput.fireLiveChange({ value: "New" });
				assert.strictEqual(oInput.getValueState(), "None", "then the input is valid");
				assert.strictEqual(oInput.getValueStateText(), "", "then the input has no error message");
				assert.strictEqual(oOkButton.getEnabled(), true, "then the OK button is enabled");
				oOkButton.firePress();
			});
		});

		QUnit.test("when renaming from an invalid label to the original label", function(assert) {
			return openDialog(
				this.oRenameDialog,
				this.oButtonOverlay,
				({ oOkButton, oCancelButton, oInput }) => {
					oInput.setValue("{someBinding}");
					oInput.fireLiveChange({ value: "{someBinding}" });
					assert.strictEqual(oInput.getValueState(), "Error", "then the input is invalid");
					assert.strictEqual(oOkButton.getEnabled(), false, "then the OK button is disabled");
					oInput.setValue("My Button");
					oInput.fireLiveChange({ value: "My Button" });
					assert.strictEqual(oInput.getValueState(), "None", "then the input is valid");
					assert.strictEqual(oInput.getValueStateText(), "", "then the input has no error message");
					assert.strictEqual(oOkButton.getEnabled(), true, "then the OK button is enabled");
					oCancelButton.firePress();
				},
				{
					acceptSameText: true
				});
		});

		QUnit.test("when getLabel and custom validators are registered", function(assert) {
			const oCustomValidator = {
				validatorFunction(someText) {
					return someText !== "Invalid";
				},
				errorMessage: "Custom error message"
			};
			const oAction = {
				getLabel: () => "My original label",
				validators: [oCustomValidator]
			};
			return openDialog(
				this.oRenameDialog,
				this.oButtonOverlay,
				({ oOkButton, oCancelButton, oInput }) => {
					assert.strictEqual(
						oInput.getValue(),
						"My original label",
						"then the initial label is retrieved via the designtime"
					);
					oInput.setValue("Invalid");
					oInput.fireLiveChange({ value: "Invalid" });
					assert.strictEqual(oInput.getValueState(), "Error", "then the input is invalid");
					assert.strictEqual(
						oInput.getValueStateText(),
						oCustomValidator.errorMessage,
						"then the input has an error message"
					);
					assert.strictEqual(oOkButton.getEnabled(), false, "then the OK button is disabled");
					oCancelButton.firePress();
				},
				{
					action: oAction
				}
			);
		});

		QUnit.test("when renaming to an empty label", async function(assert) {
			const sNewText = await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oOkButton, oInput }) => {
				oInput.setValue("");
				oInput.fireLiveChange({ value: "" });
				oOkButton.firePress();
			});
			assert.strictEqual(sNewText, "\xa0", "then a non-empty space is returned");
		});

		QUnit.test("when passing a predefined text", function(assert) {
			return openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, oInput }) => {
				assert.strictEqual(oInput.getValue(), "Predefined Text", "then the input has the initial value");
				oCancelButton.firePress();
			}, {
				currentText: "Predefined Text"
			});
		});

		QUnit.test("when passing a custom title", function(assert) {
			return openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, sTitle }) => {
				assert.strictEqual(
					sTitle,
					"Custom Title",
					"then the dialog has the custom title"
				);
				oCancelButton.firePress();
			}, {
				dialogSettings: {
					title: "Custom Title"
				}
			});
		});

		QUnit.test("when reopening the dialog", async function(assert) {
			await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, oInput }) => {
				oInput.setValue("abc");
				oInput.fireLiveChange({ value: "abc" });
				oCancelButton.firePress();
			});
			await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, oInput }) => {
				assert.strictEqual(oInput.getValue(), "My Button", "then the input has the initial value");
				oCancelButton.firePress();
			});
		});

		QUnit.test("when creating a second dialog (e.g. two plugins)", async function(assert) {
			await openDialog(this.oRenameDialog, this.oButtonOverlay, ({ oCancelButton, oInput }) => {
				oInput.setValue("abc");
				oInput.fireLiveChange({ value: "abc" });
				oCancelButton.firePress();
			});
			const oSecondRenameDialog = new RenameDialog();
			const sNewText = await openDialog(oSecondRenameDialog, this.oButtonOverlay, ({ oOkButton, oInput }) => {
				oInput.setValue("New");
				oInput.fireLiveChange({ value: "New" });
				oOkButton.firePress();
			});
			assert.strictEqual(sNewText, "New", "then the new text is returned");
			oSecondRenameDialog.destroy();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});