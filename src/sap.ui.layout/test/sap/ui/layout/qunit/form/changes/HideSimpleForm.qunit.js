/*global QUnit*/

sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/layout/changeHandler/HideSimpleForm",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Toolbar",
	"sap/m/Title",
	"sap/ui/core/Core",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	layoutLibrary,
	HideSimpleForm,
	SimpleForm,
	JsControlTreeModifier,
	XmlTreeModifier,
	Title,
	Label,
	Input,
	Toolbar,
	MobileTitle,
	oCore,
	FlexTestAPI
) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	QUnit.module("using HideSimpleForm with old change format", {
		beforeEach: function () {
			this.oTitle0 = new Title({id : "Title0", text : "Title 0"});
			this.oLabel0 = new Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new Input({id : "Input0", visible : true});
			this.oInput1 = new Input({id : "Input1"});
			this.oSimpleForm = new SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "hideSimpleFormField",
					removedElement: {id: this.oLabel0.getId()}
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedComponent
			}).then(function(oChange) {
				var oContent = oChange.getContent();
				oContent.sHideId = oContent.elementSelector;
				delete oContent.elementSelector;
				oChange.setContent(oContent);
				this.oChange = oChange;
			}.bind(this));
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier and a legacy change", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return HideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function(){
				assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
			}.bind(this));
	});

	QUnit.module("using HideSimpleForm with a new change format", {
		beforeEach: function () {
			this.oTitle0 = new Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "component---Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new Label({id : "component---Label1",  text : "Label 1"});
			this.oInput0 = new Input({id : "component---Input0", visible : true});
			this.oInput1 = new Input({id : "component---Input1"});
			this.oSimpleForm = new SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return "component---" + sString;},
				getLocalId: function (sString) {return sString.substring(12);}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "hideSimpleFormField",
					removedElement: {id: this.oLabel0.getId()}
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
		return HideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag)
		.then(function(){
			assert.equal(this.oChange.getContent().elementSelector.id, "Label0", "elementSelector.id has been added to the change");
			assert.ok(this.oChange.getContent().elementSelector.idIsLocal, "elementSelector.idIsLocal has been added to the change");
			assert.equal(this.oChange.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oLabel0.getId(), "elementSelector is part of dependent selector");
			assert.notOk(this.oLabel0.getVisible(), "the FormElement is hidden");
		}.bind(this));
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
		"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
		"<form:content>" +
		"<Title id='Title0' text='Title 0' visible='true' />" +
		"<Label id='Label0' text='Label 0' visible='true' />" +
		"<Input id='Input0' visible='true' />" +
		"<Label id='Label1' text='Label 1' visible='true' />" +
		"<Input id='Input1' visible='true' />" +
		"</form:content>" +
		"</form:SimpleForm>" +
		"</mvc:View>";

		this.oMockedComponent = {
			createId: function (sString) {return "component---" + sString;},
			getLocalId: function (sString) {return sString;}
		};

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		return HideSimpleForm.applyChange(this.oChange, this.oXmlSimpleForm, {
			modifier : XmlTreeModifier,
			appComponent: this.oMockedComponent,
			view : this.oXmlDocument
		})
		.catch(function (vError){
			assert.strictEqual(vError.message, "Change cannot be applied in XML. Retrying in JS.");
		});
	});

	QUnit.test('when calling completeChangeContent without removedElement.id', function (assert) {
		assert.throws(function() {
			HideSimpleForm.completeChangeContent({}, this.oSimpleForm, this.mPropertyBag);
			},
			new Error("oSpecificChangeInfo.removedElement.id attribute required"),
			"the undefined value raises an error message"
		);
	});

	QUnit.module("using HideSimpleForm with a simpleform with toolbar", {
		beforeEach: function () {
			this.oToolbar0 = new Toolbar({id : "Toolbar0"});
			var oTitle0 = new MobileTitle("Title0", {text : "Title 0"});
			this.oToolbar0.addContent(oTitle0);
			this.oLabel0 = new Label({id : "Label0",  text : "Label 0", visible : true});
			this.oLabel1 = new Label({id : "Label1",  text : "Label 1"});
			this.oInput0 = new Input({id : "Input0", visible : true});
			this.oInput1 = new Input({id : "Input1"});

			this.oToolbar1 = new Toolbar({id : "Toolbar1"});
			var oTitle1 = new MobileTitle("Title1", {text : "Title 1"});
			this.oToolbar1.addContent(oTitle1);
			this.oLabel10 = new Label({id : "Label10",  text : "Label 10", visible : true});
			this.oLabel11 = new Label({id : "Label11",  text : "Label 11"});
			this.oInput10 = new Input({id : "Input10", visible : true});
			this.oInput11 = new Input({id : "Input11"});

			this.oSimpleForm = new SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oToolbar0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oToolbar1, this.oLabel10, this.oInput10, this.oLabel11, this.oInput11]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "removeSimpleFormGroup",
					removedElement: {id: this.oToolbar1.getId()}
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

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars", function(assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return HideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function(){
				assert.ok(this.oLabel0.getVisible(), "the label of first FormElement is visible");
				assert.ok(this.oLabel1.getVisible(), "the label of first FormElement is visible");
				assert.ok(this.oInput0.getVisible(), "the input of first FormElement is visible");
				assert.ok(this.oInput1.getVisible(), "the input of first FormElement is visible");
				assert.notOk(this.oLabel10.getVisible(), "the label of second FormElement is hidden");
				assert.notOk(this.oLabel11.getVisible(), "the label of second FormElement is hidden");
				assert.notOk(this.oInput10.getVisible(), "the input of second FormElement is hidden");
				assert.notOk(this.oInput11.getVisible(), "the input of second FormElement is hidden");
				assert.equal(this.oChange.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oSimpleForm.getDependents()[0].getId(), "then removed element was added to the dependents aggregation");
			}.bind(this));
	});

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars using XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
				"<form:content>" +
					"<Toolbar id='Toolbar0' text='Title 0' visible='true' />" +
					"<Label id='Label0' text='Label 0' visible='true' />" +
					"<Input id='Input0' visible='true' />" +
					"<Label id='Label1' text='Label 1' visible='true' />" +
					"<Input id='Input1' visible='true' />" +
					"<Toolbar id='Toolbar1' text='Title 1' visible='true' />" +
					"<Label id='Label10' text='Label 10' visible='true' />" +
					"<Input id='Input10' visible='true' />" +
					"<Label id='Label11' text='Label 11' visible='true' />" +
					"<Input id='Input11' visible='true' />" +
				"</form:content>" +
			"</form:SimpleForm>" +
		"</mvc:View>";

		this.oMockedComponent = {
			createId: function (sString) {return "component---" + sString;},
			getLocalId: function (sString) {return sString;}
		};

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];
		var mPropertyBag = {
			modifier: XmlTreeModifier,
			appComponent: this.oMockedComponent,
			view: this.oXmlDocument
		};

		return HideSimpleForm.applyChange(this.oChange, this.oXmlSimpleForm, mPropertyBag )
		.catch(function (vError){
			assert.strictEqual(vError.message, "Change cannot be applied in XML. Retrying in JS.");
		});
	});

	QUnit.module("using HideSimpleForm with a simpleform with toolbar", {
		beforeEach: function () {
			this.oLabel0 = new Label({id : "Label30",  text : "Label 0", visible : true});
			this.oLabel1 = new Label({id : "Label31",  text : "Label 1"});
			this.oInput0 = new Input({id : "Input30", visible : true});
			this.oInput1 = new Input({id : "Input31"});

			this.oToolbar1 = new Toolbar({id : "Toolbar31"});
			var oTitle1 = new MobileTitle("Title31", {text : "Title 1"});
			this.oToolbar1.addContent(oTitle1);
			this.oLabel10 = new Label({id : "Label130",  text : "Label 10", visible : true});
			this.oLabel11 = new Label({id : "Label311",  text : "Label 11"});
			this.oInput10 = new Input({id : "Input310", visible : true});
			this.oInput11 = new Input({id : "Input311"});

			this.oSimpleForm = new SimpleForm({
				id : "SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oToolbar1, this.oLabel10, this.oInput10, this.oLabel11, this.oInput11]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {return sString;},
				getLocalId: function (sString) {return sString;}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent
			};
			return Promise.all([
				FlexTestAPI.createFlexObject({
					changeSpecificData: {
						changeType: "removeSimpleFormGroup",
						removedElement: {id: this.oToolbar1.getId()}
					},
					selector: this.oSimpleForm,
					appComponent: this.oMockedComponent
				}),
				FlexTestAPI.createFlexObject({
					changeSpecificData: {
						changeType: "removeSimpleFormGroup",
						removedElement: {id: this.oToolbar1.getId()}
					},
					selector: this.oSimpleForm,
					appComponent: this.oMockedComponent
				})]
			).then(function(aChanges) {
				this.oChange = aChanges[0];
				this.oChange1 = aChanges[1];
				this.oChange1.setContent({
					elementSelector: null
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
			this.oToolbar1.destroy();
		}
	});

	QUnit.test("when removing a FormContainer in SimpleForm with Toolbars, and the first FormContainer has no Toolbar", function(assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return HideSimpleForm.applyChange(this.oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.ok(this.oLabel0.getVisible(), "the label of first FormElement is visible");
				assert.ok(this.oLabel1.getVisible(), "the label of first FormElement is visible");
				assert.ok(this.oInput0.getVisible(), "the input of first FormElement is visible");
				assert.ok(this.oInput1.getVisible(), "the input of first FormElement is visible");
				assert.notOk(this.oLabel10.getVisible(), "the label of second FormElement is hidden");
				assert.notOk(this.oLabel11.getVisible(), "the label of second FormElement is hidden");
				assert.notOk(this.oInput10.getVisible(), "the input of second FormElement is hidden");
				assert.notOk(this.oInput11.getVisible(), "the input of second FormElement is hidden");
			}.bind(this));
	});

	QUnit.test("when removing the first FormContainer (without Toolbar) in SimpleForm with Toolbars", function(assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return HideSimpleForm.applyChange(this.oChange1, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.notOk(this.oLabel0.getVisible(), "the label of first FormElement is hidden");
				assert.notOk(this.oLabel1.getVisible(), "the label of first FormElement is hidden");
				assert.notOk(this.oInput0.getVisible(), "the input of first FormElement is hidden");
				assert.notOk(this.oInput1.getVisible(), "the input of first FormElement is hidden");
				assert.ok(this.oLabel10.getVisible(), "the label of second FormElement is visible");
				assert.ok(this.oLabel11.getVisible(), "the label of second FormElement is visible");
				assert.ok(this.oInput10.getVisible(), "the input of second FormElement is visible");
				assert.ok(this.oInput11.getVisible(), "the input of second FormElement is visible");
			}.bind(this));
	});
});