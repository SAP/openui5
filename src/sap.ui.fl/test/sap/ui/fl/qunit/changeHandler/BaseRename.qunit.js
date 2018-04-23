/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon"
],
function (
	BaseRename,
	Base,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	Button,
	VerticalLayout,
	sinon
) {
	'use strict';
	QUnit.start();

	jQuery.sap.registerModulePath("testComponent", "../testComponent");
	var sandbox = sinon.sandbox.create();
	var oComponent = sap.ui.getCore().createComponent({
						name : "testComponent",
						id : "testComponent"
					});

	var mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};

	QUnit.module("Given that rename change handlers for a button is created", {
		beforeEach: function() {
			this.oButton = new Button(oComponent.createId("myButton"));

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.oBaseHandler = Base;

			this.oDefaultRenameChangeHandler = BaseRename.createRenameChangeHandler({
				propertyName : "text",
				translationTextType : "XFLD"
			});
			this.oSpecialRenameChangeHandler = BaseRename.createRenameChangeHandler({
				propertyName : "text",
				changePropertyName : "buttonText",
				translationTextType : "XFLD"
			});

			var oChangeJson = {
				"selector": JsControlTreeModifier.getSelector(this.oButton, oComponent),
				"content": {},
				"texts": {}
			};

			this.oChange = new Change(oChangeJson);
			this.mSpecificChangeInfo = {
				value : "Button New Text"
			};

		},
		afterEach: function(){
			this.oButton.destroy();
			sandbox.restore();
		}
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler', function (assert) {
		this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oButton, mPropertyBag);

		assert.equal(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for default handler and then reverted', function (assert) {
		var originalText = this.oButton.getText();
		this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oButton, mPropertyBag);
		this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oButton, mPropertyBag);

		assert.equal(this.oButton.getText(), originalText, "then the button text doesn't change");
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler', function (assert) {
		this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oSpecialRenameChangeHandler.applyChange(this.oChange, this.oButton, mPropertyBag);

		assert.equal(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called for special handler and then reverted', function (assert) {
		var originalText = this.oButton.getText();
		this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oSpecialRenameChangeHandler.applyChange(this.oChange, this.oButton, mPropertyBag);
		this.oSpecialRenameChangeHandler.revertChange(this.oChange, this.oButton, mPropertyBag);

		assert.equal(this.oButton.getText(), originalText, "then the button text doesn't change");
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier and binding value are called', function (assert) {
		this.mSpecificChangeInfo.value = "{i18n>textKey}";

		this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oButton, mPropertyBag);

		var oBindingInfo = this.oButton.getBindingInfo("text");
		assert.equal(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");
	});

	QUnit.test('when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later', function (assert) {

		this.myLayoutId = "myLayout";
		this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId) ,{
			content : [this.oButton]
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

		this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);
		this.oDefaultRenameChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");

		this.oDefaultRenameChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlButton.getAttribute("text"), "Initial Text", "then the button text doesn't change");
	});


	QUnit.test('when completeChangeContent is called without a value', function (assert) {
		this.mSpecificChangeInfo.value = null;

		assert.throws(
			this.oDefaultRenameChangeHandler.completeChangeContent.bind(this, this.oChange, this.mSpecificChangeInfo, mPropertyBag),
			"then an error is thrown");
	});

	QUnit.test('when completeChangeContent for default is called', function (assert) {
		this.oDefaultRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);

		assert.equal(this.oChange.getContent().originalControlType, "sap.m.Button", "then the original control type is stored in the change");
		assert.equal(this.oChange.getText("newText"), this.mSpecificChangeInfo.value, "then text is stored with the default change property Name inside the translateable part of the change");
	});

	QUnit.test('when completeChangeContent for special is called', function (assert) {
		this.oSpecialRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, mPropertyBag);

		assert.equal(this.oChange.getContent().originalControlType, "sap.m.Button", "then the original control type is stored in the change");
		assert.equal(this.oChange.getText("buttonText"), this.mSpecificChangeInfo.value, "then text is stored with the default change property Name inside the translateable part of the change");
	});

	//TODO: Negative test to check if the error is properly raised when change is incomplete

});
