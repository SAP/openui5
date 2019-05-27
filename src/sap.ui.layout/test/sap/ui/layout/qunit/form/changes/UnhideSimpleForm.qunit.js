/*global QUnit*/
sap.ui.define([
	"sap/ui/layout/changeHandler/UnhideSimpleForm",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input"
], function(
	UnhideSimpleForm,
	SimpleForm,
	FormElement,
	FormContainer,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	Title,
	Label,
	Input
) {
	"use strict";


	QUnit.module("using sap.ui.layout.changeHandler.UnhideSimpleForm with legacy change format", {
		beforeEach: function () {

			this.oTitle0 = new Title({id : "Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "Label0", text : "Label 0", visible : false});
			this.oLabel1 = new Label({id : "Label1", text : "Label 1"});
			this.oInput0 = new Input({id : "Input0", visible : false});
			this.oInput1 = new Input({id : "Input1"});

			this.oSimpleForm = new SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oLegacyChange = {
				selector : {
					id : "SimpleForm"
				},
				content : {
					sUnhideId : this.oFormElement.getLabel().getId()
				},
				changeType : "unhideSimpleFormField"
			};
			this.oChangeWrapper = new Change(oLegacyChange);

			this.oChangeHandler = UnhideSimpleForm;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier and a legacy change", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
		"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<form:content>" +
		"<Title id='Title0' text='Title 0' visible='true' />" +
		"<Label id='Label0' text='Label 0' visible='false' />" +
		"<Input id='Input0' visible='true' />" +
		"<Label id='Label1' text='Label 1' visible='true' />" +
		"<Input id='Input1' visible='true' />" +
		"</form:content>" +
		"</form:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : XmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.strictEqual(this.oXmlLabel0.getAttribute("visible"), null, "the FormElement is visible");
	});

	QUnit.module("using sap.ui.layout.changeHandler.UnhideSimpleForm with new change format", {
		beforeEach: function () {

			this.oTitle0 = new Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "component---Label0", text : "Label 0", visible : false});
			this.oLabel1 = new Label({id : "component---Label1", text : "Label 1"});
			this.oInput0 = new Input({id : "component---Input0", visible : false});
			this.oInput1 = new Input({id : "component---Input1"});

			this.oSimpleForm = new SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return "component---" + sString;},
				getLocalId: function (sString) {return sString.substring("component---".length);}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};

			var oChange = {
				selector : {
					id : "component---SimpleForm"
				},
				content : {
					elementSelector : this.oFormElement.getLabel().getId()
				},
				changeType : "unhideSimpleFormField"
			};
			this.oChangeWrapper = new Change(oChange);

			var oChangeWithLocalId = {
				selector : {
					id : "SimpleForm"
				},
				content : {
					elementSelector : {
						id : "Label0",
						idIsLocal : true
					}
				},
				changeType : "unhideSimpleFormField"
			};
			this.oChangeWithLocalIdWrapper = new Change(oChangeWithLocalId);

			var oChangeWithGlobalId = {
				selector : {
					id : "component---SimpleForm"
				},
				content : {
					elementSelector : {
						id : this.oFormElement.getLabel().getId(),
						idIsLocal : false
					}
				},
				changeType : "unhideSimpleFormField"
			};
			this.oChangeWithGlobalIdWrapper = new Change(oChangeWithGlobalId);

			this.oChangeHandler = UnhideSimpleForm;

		},

		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing a local Id", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithLocalIdWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a change containing a global Id", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		//Call CUT
		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, this.oSimpleForm, this.mPropertyBag), "no errors occur");
		assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
		"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
		"<form:content>" +
		"<Title id='component---Title0' text='Title 0' visible='true' />" +
		"<Label id='component---Label0' text='Label 0' visible='false' />" +
		"<Input id='component---Input0' visible='true' />" +
		"<Label id='component---Label1' text='Label 1' visible='true' />" +
		"<Input id='component---Input1' visible='true' />" +
		"</form:content>" +
		"</form:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		assert.ok(this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : XmlTreeModifier,
			view : this.oXmlDocument
		}), "no errors occur");
		assert.strictEqual(this.oXmlLabel0.getAttribute("visible"), null, "the FormElement is visible");
	});

	QUnit.test("applyChange shall raise an exception if the control does not have the required methods", function (assert) {
		var exception, oControl;
		oControl = {};
		this.mPropertyBag.modifier = JsControlTreeModifier;
		//Call CUT
		try {
			this.oChangeHandler.applyChange(this.oChangeWithGlobalIdWrapper, oControl, this.mPropertyBag);
		} catch (ex) {
			exception = ex;
		}
		assert.ok(exception, "Shall raise an exception");
	});

	QUnit.test('when calling completeChangeContent', function (assert) {
		var oChange = {
			selector : {
				id: "SimpleForm",
				idIsLocal : true
			},
			changeType : "unhideSimpleFormField",
			content : {
			}
		};
		var oChangeWrapper = new Change(oChange);

		var oSpecificChangeInfo = { revealedElementId: sap.ui.getCore().byId("component---Label0").getParent().getId() };

		this.mPropertyBag.modifier = JsControlTreeModifier;

		this.oChangeHandler.completeChangeContent(oChangeWrapper, oSpecificChangeInfo, this.mPropertyBag);

		assert.equal(oChange.content.elementSelector.id, "Label0", "sUnhideId has been added to the change");
		assert.ok(oChange.content.elementSelector.idIsLocal, "the id is a local id");
		assert.equal(oChangeWrapper.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oLabel0.getId(), "elementSelector is part of dependent selector");
	});

	QUnit.test('when calling completeChangeContent without sUnhideId', function (assert) {
		var oChangeWrapper = new Change({
			selector : {
				id : "SimpleForm"
			},
			changeType : "unhideSimpleFormField",
			content : {
			}
		});

		assert.throws(function() {
			this.oChangeHandler.completeChangeContent(oChangeWrapper, this.oSimpleForm, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.revealedElementId attribute required"),
			"the undefined value raises an error message"
		);
	});
});