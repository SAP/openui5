/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/AddIFrame",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/ui/core/mvc/View",
	"sap/m/HBox",
	"sap/m/Button"
], function(
	jQuery,
	AddIFrame,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	View,
	HBox,
	Button
) {
	"use strict";

	var sUrl = "http://www.sap.com";

	QUnit.module("Given a AddIFrame Change Handler", {
		beforeEach : function() {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};

			this.oChangeHandler = AddIFrame;
			this.oHBox = new HBox("hbx", {
				items: [
					new Button()
				]
			});

			this.oView = new View({content : [
				this.oHBox
			]});

			var mExpectedSelector = {
				id: this.oHBox.getId(),
				type: "sap.m.HBox"
			};

			var oChangeJson = {
				reference: "sap.ui.fl.qunit.changeHander.AddIFrame",
				validAppVersions: {
					creation: "1.0.0"
				},
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
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			this.mPropertyBag = {
				modifier : JsControlTreeModifier,
				view : this.oView,
				appComponent : this.oMockedAppComponent
			};
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	}, function() {
		["targetAggregation", "baseId", "url"].forEach(function (sRequiredProperty) {
			QUnit.test("When calling 'completeChangeContent' without '" + sRequiredProperty + "'", function(assert) {
				delete this.mChangeSpecificContent[sRequiredProperty];
				assert.throws(
					function() {
						this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
					},
					Error("Attribute missing from the change specific content '" + sRequiredProperty + "'"),
					"without " + sRequiredProperty + " 'completeChangeContent' throws an error"
				);
			});
		});
	});

	QUnit.module("Given a AddIFrame Change Handler with JSTreeModifier", {
		beforeEach : function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
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
				reference: "sap.ui.fl.qunit.changeHander.AddIFrame",
				validAppVersions: {
					creation: "1.0.0"
				},
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
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			// JSTreeModifier specific beforeEach
			this.oButton = new Button();

			this.oHBox = new HBox(this.sHBoxId, {
				items: [this.oButton]
			});

			this.oHBox.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.mPropertyBag = {
				modifier : JsControlTreeModifier,
				view : {
					getController : function () {},
					getId : function () {},
					createId: function (sId) { return sId; }
				},
				appComponent: this.oMockedAppComponent
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
		},
		afterEach : function () {
			this.oHBox.destroy();
		}
	}, function () {
		QUnit.test("When applying the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(this.oHBox.getItems().length, 2, "after the change there are 2 items in the horizontal box");
			var oCreatedControl = this.oHBox.getItems()[1];
			assert.ok(oCreatedControl.getId().match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getUrl(), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a js control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(this.oHBox.getItems().length, 2, "after the change there are 2 items in the horizontal box");
			var oCreatedControl = this.oHBox.getItems()[0];
			assert.ok(oCreatedControl.getId().match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getUrl(), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);},
				Error,
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the horizontal box");
			assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
		});
	});

	QUnit.module("Given a AddIFrame Change Handler with XMLTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddIFrame;

			this.sHBoxId = "hbx";

			var mExpectedSelector = {
				id: this.sHBoxId,
				type: "sap.uxap.ObjectPageLayout"
			};

			var oChangeJson = {
				selector: mExpectedSelector,
				reference: "sap.ui.fl.qunit.changeHander.AddIFrame",
				validAppVersions: {
					creation: "1.0.0"
				},
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
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			// XMLTreeModifier specific beforeEach
			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				metadata: {
					manifest: "json"
				}
			});
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<HBox id="' + this.sHBoxId + '">' +
				'<items>' +
				'<Button />' +
				'</items>' +
				'</HBox>' +
				'</mvc:View>';
			this.oXmlView = jQuery.sap.parseXML(this.oXmlString, "application/xml").documentElement;
			this.oHBox = this.oXmlView.childNodes[0];

			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView,
				appComponent: this.oComponent
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
		},
		afterEach : function() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 2, "after the addXML there are two children in the horizontal box");
			var oCreatedControl = oHBoxItemsAggregation.childNodes[1];
			assert.ok(oCreatedControl.getAttribute("id").match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getAttribute("url"), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a xml control tree (index = 0)", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 2, "after the addXML there are two children in the horizontal box");
			var oCreatedControl = oHBoxItemsAggregation.childNodes[0];
			assert.ok(oCreatedControl.getAttribute("id").match(/test$/), "the created IFrame ends with the expected baseId");
			assert.strictEqual(oCreatedControl.getAttribute("url"), sUrl, "the created IFrame has the correct URL");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);},
				Error,
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			var oHBoxItemsAggregation = this.oHBox.childNodes[0];
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.mPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.mPropertyBag);
			assert.strictEqual(oHBoxItemsAggregation.childNodes.length, 1, "after reversal there is again only one child in the horizontal box");
			assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
