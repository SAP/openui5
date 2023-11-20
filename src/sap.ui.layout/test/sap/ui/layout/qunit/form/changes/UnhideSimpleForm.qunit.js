/*global QUnit*/
sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/layout/changeHandler/UnhideSimpleForm",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/core/Core",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	layoutLibrary,
	UnhideSimpleForm,
	SimpleForm,
	JsControlTreeModifier,
	XmlTreeModifier,
	Title,
	Label,
	Input,
	oCore,
	FlexTestAPI
) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	QUnit.module("using sap.ui.layout.changeHandler.UnhideSimpleForm with legacy change format", {
		beforeEach: function () {
			this.oTitle0 = new Title({id : "Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "Label0", text : "Label 0", visible : false});
			this.oLabel1 = new Label({id : "Label1", text : "Label 1"});
			this.oInput0 = new Input({id : "Input0", visible : false});
			this.oInput1 = new Input({id : "Input1"});

			this.oSimpleForm = new SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");

			oCore.applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "unhideSimpleFormField",
					sUnhideId: this.oFormElement.getLabel().getId()
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedComponent
			}).then(function(oChange) {
				this.oChange = oChange;
			}.bind(this));
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return UnhideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag).then(function() {
			assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
		}.bind(this));
	});

	QUnit.test("when calling applyChange with XmlTreeModifier and a legacy change", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
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

		return UnhideSimpleForm.applyChange(this.oChange, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : XmlTreeModifier,
			view : this.oXmlDocument
		})
		.catch(function (vError){
			assert.strictEqual(vError.message, "Change cannot be applied in XML. Retrying in JS.");
		});
	});

	QUnit.module("using sap.ui.layout.changeHandler.UnhideSimpleForm with new change format", {
		beforeEach: function () {
			this.oTitle0 = new Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "component---Label0", text : "Label 0", visible : false});
			this.oInput0 = new Input({id : "component---Input0", visible : false});
			this.oLabel1 = new Label({id : "component---Label1", text : "Label 1"});
			this.oInput1 = new Input({id : "component---Input1"});
			this.oLabel2 = new Label({id : "component---Label2", text : "Label 2", visible : false});
			this.oInput2 = new Input({id : "component---Input2", visible : false});

			this.oSimpleForm = new SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oLabel2, this.oInput2]
			});
			this.oSimpleForm.placeAt("qunit-fixture");

			oCore.applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];

			this.oMockedComponent = {
				createId: function (sString) {return "component---" + sString;},
				getLocalId: function (sString) {return sString.substring("component---".length);}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "unhideSimpleFormField",
					revealedElementId: this.oFormElement.getId()
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedComponent
			}).then(function(oChange) {
				this.oChange = oChange;
			}.bind(this));
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return UnhideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag)
		.then(function() {
			assert.strictEqual(this.oChange.getContent().elementSelector.id, "Label0", "sUnhideId has been added to the change");
			assert.ok(this.oChange.getContent().elementSelector.idIsLocal, "the id is a local id");
			assert.strictEqual(this.oChange.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oLabel0.getId(), "elementSelector is part of dependent selector");
			assert.ok(this.oFormElement.getLabel().getVisible(), "the FormElement is visible");
		}.bind(this));
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
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
		this.mPropertyBag.view = this.oXmlDocument;
		this.mPropertyBag.modifier = XmlTreeModifier;

		return UnhideSimpleForm.applyChange(this.oChange, this.oXmlSimpleForm, this.mPropertyBag)
		.catch(function (vError){
			assert.strictEqual(vError.message, "Change cannot be applied in XML. Retrying in JS.");
		});
	});

	QUnit.test('when calling completeChangeContent without sUnhideId or revealedElementId', function (assert) {
		assert.throws(
			function() {
				UnhideSimpleForm.completeChangeContent({}, {}, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.revealedElementId attribute required"),
			"the undefined value raises an error message"
		);
	});
});