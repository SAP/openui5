/*globals QUnit, sinon*/

jQuery.sap.require("sap.ui.fl.changeHandler.BaseRename");
jQuery.sap.require("sap.ui.fl.changeHandler.Base");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.core.LayoutData");

(function (Base, BaseRename, Change, JsControlTreeModifier, XmlTreeModifier) {
	'use strict';

	jQuery.sap.registerModulePath("testComponent", "../testComponent");
	var sandbox = sinon.sandbox.create();
	var oComponent = new sap.ui.getCore().createComponent({
						name : "testComponent",
						id : "testComponent"
					});

	QUnit.module("Given that a rename change handler for a button is created", {
		beforeEach: function() {

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.oBaseHandler = Base;

			this.oButtonRenameChangeHandler = BaseRename.createRenameChangeHandler({
				propertyName : "text",
				changePropertyName : "buttonText",
				translationTextType : "XFLD"
			});
			var oChangeJson = {
				"selector": {
					"id": "key"
				},
				"content": {},
				"texts": {}
			};

			this.oChange = new Change(oChangeJson);
			this.mSpecificChangeInfo = {
				value : "Button New Text"
			};

			this.oButton = new sap.m.Button(oComponent.createId("myButton"));
		},
		afterEach: function(){
			this.oButton.destroy();
			sandbox.restore();
		}
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier are called', function (assert) {
		this.oButtonRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo);
		this.oButtonRenameChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});

		assert.equal(this.oButton.getText(), this.mSpecificChangeInfo.value, "then the button text changes");
	});

	QUnit.test('when completeChangeContent & applyChange with JsControlTreeModifier and binding value are called', function (assert) {
		this.mSpecificChangeInfo.value = "{i18n>textKey}";

		this.oButtonRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo);
		this.oButtonRenameChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});

		var oBindingInfo = this.oButton.getBindingInfo("text");
		assert.equal(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");
	});

	QUnit.test('when completeChangeContent & applyChange with XmlTreeModifier are called', function (assert) {

		this.myLayoutId = "myLayout";
		this.oLayout = new sap.ui.layout.VerticalLayout(oComponent.createId(this.myLayoutId) ,{
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
		this.oXmlView = oXmlDocument;
		this.oXmlLayout = oXmlDocument.childNodes[0].childNodes[0];
		this.oXmlButton = this.oXmlLayout.childNodes[0].childNodes[0];

		this.oButtonRenameChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo);
		this.oButtonRenameChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlButton.getAttribute("text"), this.mSpecificChangeInfo.value, "then the button text changes");
	});

	QUnit.test('when completeChangeContent is called without a value', function (assert) {
		this.mSpecificChangeInfo.value = null;

		assert.throws(
			this.oButtonRenameChangeHandler.completeChangeContent.bind(this, this.oChange, this.mSpecificChangeInfo),
			"then an error is thrown");
	});//

	//TODO: Negative test to check if the error is properly raised when change is incomplete

}(sap.ui.fl.changeHandler.Base,
	sap.ui.fl.changeHandler.BaseRename,
	sap.ui.fl.Change,
	sap.ui.fl.changeHandler.JsControlTreeModifier,
	sap.ui.fl.changeHandler.XmlTreeModifier));
