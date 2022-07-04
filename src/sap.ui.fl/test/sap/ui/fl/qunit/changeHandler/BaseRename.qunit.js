/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	BaseRename,
	Base,
	Change,
	Utils,
	JsControlTreeModifier,
	XmlTreeModifier,
	Button,
	VerticalLayout,
	JSONModel,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComponent = oCore.createComponent({
		name: "testComponent",
		id: "testComponent"
	});

	var mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};

	QUnit.module("Given that a rename change handler for a button is created based on the BaseRename", {
		beforeEach: function() {
			this.oButton = new Button(oComponent.createId("myButton"));

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

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

			var oChangeJson = {
				selector: JsControlTreeModifier.getSelector(this.oButton, oComponent),
				content: {},
				texts: {}
			};

			this.oChange = new Change(oChangeJson);
			this.mSpecificChangeInfo = {
				value: "Button New Text"
			};
		},
		afterEach: function() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler', function (assert) {
			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oDefaultRenameChangeHandler.applyChange.bind(this.oDefaultRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(function() {
					assert.equal(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler and then reverted', function (assert) {
			var originalText = this.oButton.getText();

			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oDefaultRenameChangeHandler.applyChange.bind(this.oDefaultRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(this.oDefaultRenameChangeHandler.revertChange.bind(this.oDefaultRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(function() {
					assert.equal(this.oButton.getText(), originalText, "then the button text doesn't change");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler', function (assert) {
			return this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oSpecialRenameChangeHandler.applyChange.bind(this.oSpecialRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(function() {
					assert.equal(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler and then reverted', function (assert) {
			var originalText = this.oButton.getText();

			return this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oSpecialRenameChangeHandler.applyChange.bind(this.oSpecialRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(this.oSpecialRenameChangeHandler.revertChange.bind(this.oSpecialRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(function() {
					assert.equal(this.oButton.getText(), originalText, "then the button text doesn't change");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier and binding value are called', function (assert) {
			this.mSpecificChangeInfo.value = "{i18n>textKey}";

			return this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oSpecialRenameChangeHandler.applyChange.bind(this.oSpecialRenameChangeHandler, this.oChange, this.oButton, mPropertyBag))
				.then(function() {
					var oBindingInfo = this.oButton.getBindingInfo("text");
					assert.equal(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
					assert.equal(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later', function (assert) {
			this.myLayoutId = "myLayout";
			this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId), {
				content: [this.oButton]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
					'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m">' +
						'<layout:VerticalLayout id="' + this.oLayout.getId() + '">' +
							'<layout:content>' +
								'<Button id="' + this.oButton.getId() + '"' + ' text="Initial Text"' + '>' +
								'</Button>' +
							'</layout:content>' +
						'</layout:VerticalLayout>' +
					'</mvc:View>';

			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlButton = this.oXmlLayout.childNodes[0].childNodes[0];

			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oDefaultRenameChangeHandler.applyChange.bind(this.oDefaultRenameChangeHandler, this.oChange, this.oXmlButton, {modifier: XmlTreeModifier}))
				.then(function() {
					assert.equal(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");
					return this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
				}.bind(this))
				.then(function() {
					assert.equal(this.oXmlButton.getAttribute("text"), "Initial Text", "then the button text doesn't change");
					this.oLayout.destroy();
				}.bind(this));
		});

		QUnit.test('when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later in XML and JS (on button with binding)', function (assert) {
			this.myLayoutId = "myLayout";
			this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId), {
				content: [this.oButton]
			});
			var oModel = new JSONModel({
				text: "Initial Text"
			});
			this.oLayout.setModel(oModel);

			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m">' +
					'<layout:VerticalLayout id="' + this.oLayout.getId() + '">' +
						'<layout:content>' +
							'<Button id="' + this.oButton.getId() + '"' + ' text="{/text}"' + '>' +
							'</Button>' +
						'</layout:content>' +
					'</layout:VerticalLayout>' +
				'</mvc:View>';

			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlButton = this.oXmlLayout.childNodes[0].childNodes[0];

			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(this.oDefaultRenameChangeHandler.applyChange.bind(this.oDefaultRenameChangeHandler, this.oChange, this.oXmlButton, {modifier: XmlTreeModifier}))
				.then(function() {
					assert.equal(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");
					return this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
				}.bind(this))
				.catch(function() {
					assert.ok(true, "revert on XML throws an error");

					// the revert data are saved on the change; set button text also on button control
					this.oButton.setText(this.mSpecificChangeInfo.value);
					return this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
				}.bind(this))
				.then(function() {
					assert.equal(this.oButton.getText(), "Initial Text", "the text binding got reset and the value is correct");

					this.oLayout.destroy();
					oModel.destroy();
				}.bind(this));
		});

		QUnit.test('when completeChangeContent is called without a value', function (assert) {
			this.mSpecificChangeInfo.value = null;

			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.catch(function() {
					assert.ok(true, "then an error is thrown");
				});
		});

		QUnit.test('when completeChangeContent for default is called', function (assert) {
			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(function() {
					assert.equal(this.oChange.getContent().originalControlType, "sap.m.Button", "then the original control type is stored in the change");
					assert.equal(this.oChange.getText("newText"), this.mSpecificChangeInfo.value, "then text is stored with the default change property Name inside the translateable part of the change");
				}.bind(this));
		});

		QUnit.test('when completeChangeContent for special is called', function (assert) {
			return this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(function() {
					assert.equal(this.oChange.getContent().originalControlType, "sap.m.Button", "then the original control type is stored in the change");
					assert.equal(this.oChange.getText("buttonText"), this.mSpecificChangeInfo.value, "then text is stored with the default change property Name inside the translateable part of the change");
				}.bind(this));
		});

		QUnit.test('when getChangeVisualization is called', function (assert) {
			return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag)
				.then(function() {
					this.oChange.setRevertData("Button Old Text");
					return this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
				}.bind(this))
				.then(function() {
					var mVisualizationInfo = this.oDefaultRenameChangeHandler.getChangeVisualizationInfo(this.oChange);
					assert.equal(mVisualizationInfo.payload.originalLabel, "Button Old Text", "then the returned payload contains the original label");
					assert.equal(mVisualizationInfo.payload.newLabel, "Button New Text", "then the returned payload contains the new label");
				}.bind(this));
		});
	});

	//TODO: Negative test to check if the error is properly raised when change is incomplete

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
