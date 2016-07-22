/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.layout.changeHandler.HideSimpleForm");
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.layout.form.FormElement");
jQuery.sap.require("sap.ui.layout.form.FormContainer");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function() {
	"use strict";

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with old change format", {
		beforeEach: function () {

			this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input0", visible : true});
			this.oInput1 = new sap.m.Input({id : "Input1"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form", class : "editableForm",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			var oChange = {
					"selector": {
						"id": "SimpleForm"
					},
					"content": {
						"sHideId": this.oFormElement.getLabel().getId()
					},
					"changeType": "hideSimpleFormField"
				};
				this.oChangeWrapper = new sap.ui.fl.Change(oChange);

				this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
				this.oJsControlTreeModifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
				this.oXmlTreeModifier = sap.ui.fl.changeHandler.XmlTreeModifier;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.oJsControlTreeModifier), "no errors occur");
		assert.notOk(this.oFormElement.getLabel().getVisible(), "the FormElement is hidden");
	});

	QUnit.module("using sap.ui.layout.changeHandler.HideSimpleForm with a new change format", {
		beforeEach: function () {

			this.oTitle0 = new sap.ui.core.Title({id : "Title0",  text : "Title 0"});
			this.oLabel0 = new sap.m.Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new sap.m.Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new sap.m.Input({id : "Input0", visible : true});
			this.oInput1 = new sap.m.Input({id : "Input1"});
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				id : "SimpleForm", title : "Simple Form", class : "editableForm",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			var oChange = {
					"selector": {
						"id": "SimpleForm"
					},
					"content": {
						"removedElement": {
							id : this.oFormElement.getLabel().getId()
						}
					},
					"changeType": "hideSimpleFormField"
				};
				this.oChangeWrapper = new sap.ui.fl.Change(oChange);

				this.oChangeHandler = sap.ui.layout.changeHandler.HideSimpleForm;
				this.oJsControlTreeModifier = sap.ui.fl.changeHandler.JsControlTreeModifier;
				this.oXmlTreeModifier = sap.ui.fl.changeHandler.XmlTreeModifier;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.oJsControlTreeModifier), "no errors occur");
		assert.notOk(this.oFormElement.getLabel().getVisible(), "the FormElement is hidden");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
		"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<layout:content>" +
		"<Title id='Title0' text='Title 0' visible='true' />" +
		"<Label id='Label0' text='Label 0' visible='true' />" +
		"<Input id='Input0' visible='true' />" +
		"<Label id='Label1' text='Label 1' visible='true' />" +
		"<Input id='Input1' visible='true' />" +
		"</layout:content>" +
		"</layout:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0].childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oXmlSimpleForm, this.oXmlTreeModifier, this.oXmlDocument), "no errors occur");
		assert.ok(this.oXmlLabel0.getAttribute("visible"), "the FormElement is hidden");
	});

	QUnit.test("applyChange shall raise an exception if the control does not have the required methods", function (assert) {
		var exception, oControl;

		oControl = {};

		//Call CUT
		try {
			this.oChangeHandler.applyChange(this.oChangeWrapper, oControl, this.JsControlTreeModifier);
		} catch (ex) {
			exception = ex;
		}
		assert.ok(exception, "Shall raise an exception");
	});

	QUnit.test('when calling completeChangeContent', function (assert) {
		var oChange = {
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "hideSimpleFormField",
			"content": {
			}
		};
		var oChangeWrapper = new sap.ui.fl.Change(oChange);
		var oSpecificChangeInfo = { removedElement: { id : "Label1" } };

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo);

		assert.equal(oChange.content.removedElement.id, "Label1", "removedElement.id has been added to the change");
	});

	QUnit.test('when calling completeChangeContent without removedElement.id', function (assert) {
		var oChangeWrapper = new sap.ui.fl.Change({
			"selector": {
				"id": "SimpleForm"
			},
			"changeType": "hideSimpleFormField",
			"content": {
			}
		});

		assert.throws(function() {
			this.oChangeHandler.completeChangeContent(oChangeWrapper, this.oSimpleForm, this.oJsControlTreeModifier);
			},
			new Error("oSpecificChangeInfo.removedElement.id attribute required"),
			"the undefined value raises an error message"
		);
	});

})();