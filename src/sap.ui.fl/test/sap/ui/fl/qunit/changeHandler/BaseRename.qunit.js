/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	UIChange,
	BaseRename,
	Base,
	Utils,
	VerticalLayout,
	JSONModel,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	QUnit.module("Given that a rename change handler for a button is created based on the BaseRename", {
		before: async () => {
			this.oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.mPropertyBag = {modifier: JsControlTreeModifier, appComponent: this.oComponent};
		},
		beforeEach: () => {
			this.oButton = new Button(this.oComponent.createId("myButton"));

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);

			this.oBaseHandler = Base;

			this.oDefaultRenameChangeHandler = BaseRename.createRenameChangeHandler({
				propertyName: "text",
				translationTextType: "XFLD"
			});
			this.oSpecialRenameChangeHandler = BaseRename.createRenameChangeHandler({
				propertyName: "text",
				changePropertyName: "buttonText",
				translationTextType: "XFLD"
			});

			this.oChange = new UIChange({
				selector: JsControlTreeModifier.getSelector(this.oButton, this.oComponent)
			});
			this.mSpecificChangeInfo = {
				value: "Button New Text"
			};
		},
		afterEach: () => {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, () => {
		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler", async (assert) => {
			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oButton, this.mPropertyBag);
			assert.strictEqual(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler and then reverted", async (assert) => {
			const originalText = this.oButton.getText();

			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oButton, this.mPropertyBag);
			await this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oButton, this.mPropertyBag);
			assert.strictEqual(this.oButton.getText(), originalText, "then the button text doesn't change");
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler", async (assert) => {
			await this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oSpecialRenameChangeHandler.applyChange(this.oChange, this.oButton, this.mPropertyBag);
			assert.strictEqual(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler and then reverted", async (assert) => {
			const originalText = this.oButton.getText();

			await this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oSpecialRenameChangeHandler.applyChange(this.oChange, this.oButton, this.mPropertyBag);
			await this.oSpecialRenameChangeHandler.revertChange(this.oChange, this.oButton, this.mPropertyBag);
			assert.strictEqual(this.oButton.getText(), originalText, "then the button text doesn't change");
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier and binding value are called", async (assert) => {
			this.mSpecificChangeInfo.value = "{i18n>textKey}";

			await this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oSpecialRenameChangeHandler.applyChange(this.oChange, this.oButton, this.mPropertyBag);
			const oBindingInfo = this.oButton.getBindingInfo("text");
			assert.strictEqual(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
			assert.strictEqual(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");
		});

		QUnit.test("when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later", async (assert) => {
			this.myLayoutId = "myLayout";
			this.oLayout = new VerticalLayout(this.oComponent.createId(this.myLayoutId), {
				content: [this.oButton]
			});

			const oDOMParser = new DOMParser();
			const oXmlString =
					`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m">` +
						`<layout:VerticalLayout id="${this.oLayout.getId()}">` +
							`<layout:content>` +
								`<Button id="${this.oButton.getId()}"` + ` text="Initial Text"` + `>` +
								`</Button>` +
							`</layout:content>` +
						`</layout:VerticalLayout>` +
					`</mvc:View>`;

			const oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			[this.oXmlLayout] = this.oXmlView.childNodes;
			[this.oXmlButton] = this.oXmlLayout.childNodes[0].childNodes;

			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			await this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			assert.strictEqual(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");
			await this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			assert.strictEqual(this.oXmlButton.getAttribute("text"), "Initial Text", "then the button text doesn't change");
			this.oLayout.destroy();
		});

		QUnit.test("when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later in XML and JS (on button with binding)", async (assert) => {
			const fnDone = assert.async();
			this.myLayoutId = "myLayout";
			this.oLayout = new VerticalLayout(this.oComponent.createId(this.myLayoutId), {
				content: [this.oButton]
			});
			const oModel = new JSONModel({
				text: "Initial Text"
			});
			this.oLayout.setModel(oModel);

			const oDOMParser = new DOMParser();
			const oXmlString =
				`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m">` +
					`<layout:VerticalLayout id="${this.oLayout.getId()}">` +
						`<layout:content>` +
							`<Button id="${this.oButton.getId()}"` + ` text="{/text}"` + `>` +
							`</Button>` +
						`</layout:content>` +
					`</layout:VerticalLayout>` +
				`</mvc:View>`;

			const oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			[this.oXmlLayout] = this.oXmlView.childNodes;
			[this.oXmlButton] = this.oXmlLayout.childNodes[0].childNodes;

			try {
				await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
				await this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
				assert.strictEqual(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");
				await this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			} catch (oError) {
				assert.ok(oError, "revert on XML throws an error because XML only supports strings as properties");

				// the revert data are saved on the change; set button text also on button control
				this.oButton.setText(this.mSpecificChangeInfo.value);
				await this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
				assert.strictEqual(this.oButton.getText(), "Initial Text", "the text binding got reset and the value is correct");

				this.oLayout.destroy();
				oModel.destroy();
				fnDone();
			}
		});

		QUnit.test("when completeChangeContent is called without a value", async (assert) => {
			this.mSpecificChangeInfo.value = null;

			try {
				await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			} catch (oError) {
				assert.ok(oError, "then an error is thrown");
			}
		});

		QUnit.test("when completeChangeContent for default is called", async (assert) => {
			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			assert.strictEqual(
				this.oChange.getContent().originalControlType,
				"sap.m.Button",
				"then the original control type is stored in the change"
			);
			assert.strictEqual(
				this.oChange.getText("newText"),
				this.mSpecificChangeInfo.value,
				"then text is stored with the default change property Name inside the translateable part of the change"
			);
		});

		QUnit.test("when completeChangeContent for special is called", async (assert) => {
			await this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			assert.strictEqual(
				this.oChange.getContent().originalControlType,
				"sap.m.Button",
				"then the original control type is stored in the change"
			);
			assert.strictEqual(
				this.oChange.getText("buttonText"),
				this.mSpecificChangeInfo.value,
				"then text is stored with the default change property Name inside the translateable part of the change"
			);
		});

		QUnit.test("when getChangeVisualizationInfo is called", async (assert) => {
			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			this.oChange.setRevertData("Button Old Text");
			await this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
			const mVisualizationInfo = this.oDefaultRenameChangeHandler.getChangeVisualizationInfo(this.oChange);
			assert.strictEqual(
				mVisualizationInfo.descriptionPayload.originalLabel,
				"Button Old Text",
				"then the returned descriptionPayload contains the original label"
			);
			assert.strictEqual(
				mVisualizationInfo.descriptionPayload.newLabel,
				"Button New Text",
				"then the returned descriptionPayload contains the new label"
			);
		});

		QUnit.test("when revertChange is called before applyChange was called", async (assert) => {
			const fnDone = assert.async();
			try {
				await this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oButton, this.mPropertyBag);
			} catch (oError) {
				assert.ok(oError, "then an error is thrown");
				fnDone();
			}
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
