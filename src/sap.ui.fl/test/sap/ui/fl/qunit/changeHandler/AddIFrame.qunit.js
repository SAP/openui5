/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/HBox",
	"sap/ui/core/mvc/View",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/AddIFrame",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/util/XMLHelper"
], function(
	Button,
	HBox,
	View,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	FlexObjectFactory,
	AddIFrame,
	nextUIUpdate,
	XMLHelper
) {
	"use strict";

	var sUrl = "testURL";

	QUnit.module("Given a AddIFrame Change Handler", {
		beforeEach() {
			this.oMockedAppComponent = {
				getLocalId() {
					return undefined;
				}
			};

			this.oChangeHandler = AddIFrame;
			this.oHBox = new HBox("hbx", {
				items: [
					new Button()
				]
			});

			this.oView = new View({content: [
				this.oHBox
			]});

			var mExpectedSelector = {
				id: this.oHBox.getId(),
				type: "sap.m.HBox"
			};

			var oChangeJson = {
				reference: "sap.ui.fl.qunit.changeHandler.AddIFrame",
				selector: mExpectedSelector,
				changeType: "addIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "items",
				baseId: "test",
				url: sUrl
			};

			this.mSpecificChangeData = {
				selector: mExpectedSelector,
				changeType: "addIFrame",
				content: this.mChangeSpecificContent
			};

			this.oChange = FlexObjectFactory.createFromFileContent(oChangeJson);

			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				view: this.oView,
				appComponent: this.oMockedAppComponent
			};
		},
		afterEach() {
			this.oHBox.destroy();
		}
	}, function() {
		["targetAggregation", "baseId", "url"].forEach(function(sRequiredProperty) {
			QUnit.test(`When calling 'completeChangeContent' without '${sRequiredProperty}'`, function(assert) {
				delete this.mChangeSpecificContent[sRequiredProperty];
				assert.throws(
					function() {
						this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
					},
					Error(`Attribute missing from the change specific content '${sRequiredProperty}'`),
					`without ${sRequiredProperty} 'completeChangeContent' throws an error`
				);
			});
		});
	});

	QUnit.module("Given a AddIFrame Change Handler with JSTreeModifier", {
		async beforeEach() {
			this.oMockedAppComponent = {
				getLocalId() {
					return undefined;
				}
			};

			this.oChangeHandler = AddIFrame;

			this.sHBoxId = "hbx";

			var mExpectedSelector = {
				id: this.sHBoxId,
				type: "sap.m.HBox"
			};

			var oChangeJson = {
				selector: mExpectedSelector,
				reference: "sap.ui.fl.qunit.changeHandler.AddIFrame",
				changeType: "addIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "items",
				baseId: "test",
				url: sUrl
			};

			this.mSpecificChangeData = {
				selector: mExpectedSelector,
				changeType: "addIFrame",
				content: this.mChangeSpecificContent
			};

			this.oChange = FlexObjectFactory.createFromFileContent(oChangeJson);

			// JSTreeModifier specific beforeEach
			this.oButton = new Button();

			this.oHBox = new HBox(this.sHBoxId, {
				items: [this.oButton]
			});

			this.oHBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				view: {
					getController() {},
					getId() {},
					createId(sId) { return sId; }
				},
				appComponent: this.oMockedAppComponent
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
		},
		afterEach() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("When applying the change on a js control tree", async function(assert) {
			await this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(this.oHBox.getItems().length, 2, "after the change there are 2 items in the horizontal box");
			const oCreatedControl = this.oHBox.getItems()[1];
			assert.ok(oCreatedControl.getId().match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getUrl(), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a js control tree (index = 0)", async function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			await this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(this.oHBox.getItems().length, 2, "after the change there are 2 items in the horizontal box");
			const oCreatedControl = this.oHBox.getItems()[0];
			assert.ok(oCreatedControl.getId().match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getUrl(), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.catch(function(vError) {
				assert.equal(
					vError.message,
					`The given Aggregation is not available in the given control: ${this.oHBox.getId()}`,
					"then apply change throws an error");
			}.bind(this));
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oHBox, this.mPropertyBag))
			.then(function() {
				assert.strictEqual(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the horizontal box");
				assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
			}.bind(this));
		});
	});

	QUnit.module("Given a AddIFrame Change Handler with XMLTreeModifier", {
		beforeEach() {
			this.oChangeHandler = AddIFrame;
			this.sHBoxId = "hbx";
			var mExpectedSelector = {
				id: this.sHBoxId,
				type: "sap.uxap.ObjectPageLayout"
			};
			var oChangeJson = {
				selector: mExpectedSelector,
				reference: "sap.ui.fl.qunit.changeHandler.AddIFrame",
				changeType: "AddIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};
			this.mChangeSpecificContent = {
				targetAggregation: "items",
				baseId: "test",
				url: sUrl
			};

			this.mSpecificChangeData = {
				selector: mExpectedSelector,
				changeType: "addIFrame",
				content: this.mChangeSpecificContent
			};

			this.oChange = FlexObjectFactory.createFromFileContent(oChangeJson);

			// XMLTreeModifier specific beforeEach
			return Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oXmlString =
					`<mvc:View id="testComponentAsync---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">` +
					`<HBox id="${this.sHBoxId}">` +
					`<items>` +
					`<Button />` +
					`</items>` +
					`</HBox>` +
					`</mvc:View>`;
				this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;
				[this.oHBox] = this.oXmlView.childNodes;

				this.mPropertyBag = {
					modifier: XmlTreeModifier,
					view: this.oXmlView,
					appComponent: this.oComponent
				};

				this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			}.bind(this));
		},
		afterEach() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 2, "after the addXML there are two children in the horizontal box");
				var oCreatedControl = oHBoxItemsAggregation.childNodes[1];
				assert.ok(oCreatedControl.getAttribute("id").match(/test$/), "the created IFrame ends with the expected baseId");
				assert.strictEqual(oCreatedControl.getAttribute("url"), sUrl, "the created IFrame has the correct URL");
			});
		});

		QUnit.test("When applying the change on a xml control tree (index = 0)", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 2, "after the addXML there are two children in the horizontal box");
				var oCreatedControl = oHBoxItemsAggregation.childNodes[0];
				assert.ok(oCreatedControl.getAttribute("id").match(/test$/), "the created IFrame ends with the expected baseId");
				assert.strictEqual(oCreatedControl.getAttribute("url"), sUrl, "the created IFrame has the correct URL");
			});
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.catch(function(vError) {
				assert.equal(
					vError.message,
					`The given Aggregation is not available in the given control: ${this.oHBox.id}`,
					"then apply change throws an error");
			}.bind(this));
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			return this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag)
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oHBox, this.mPropertyBag))
			.then(function() {
				assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 1, "after reversal there is again only one child in the horizontal box");
				assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
