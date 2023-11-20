/*global QUnit*/
sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/layout/changeHandler/AddSimpleFormGroup",
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
	AddSimpleFormGroup,
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

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with title and having old index", {
		beforeEach: function () {
			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "addSimpleFormGroup",
					index: 5,
					newLabel: "New Control",
					newControlId: "newId"
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

	function testApplyChangeWithJsControlTreeModifier (oChange, sExpectedId, iIndex, assert){
		return AddSimpleFormGroup.applyChange(oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.equal(this.oSimpleForm.getContent()[iIndex].getId(), sExpectedId, "the FormContainer has the correct id");
				assert.equal(this.oSimpleForm.getContent()[iIndex].getText(), "New Control", "the FormContainer is added");
			}.bind(this));
	}

	function testApplyChangeWithXMLTreeModifier (oXmlString, oChange, sExpectedId, iIndex, assert){
		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];

		return AddSimpleFormGroup.applyChange(this.oChange, this.oXmlSimpleForm, {
			modifier: XmlTreeModifier,
			view: this.oXmlDocument,
			appComponent: this.oMockedComponent
		})
			.then(function() {
				this.testControl = this.oXmlSimpleForm.childNodes[0].childNodes[iIndex];
				assert.equal(this.testControl.getAttribute("text"), "New Control", "the FormContainer is added");
			}.bind(this));
	}

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 5, assert);
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

		return testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oLegacyChangeWrapper, "New Control", 5, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform without title and having old index", {
		beforeEach: function () {
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};

			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "addSimpleFormGroup",
					index: 0,
					newLabel: "New Control",
					newControlId: "newId"
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

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 0, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
			"<form:content>" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		return testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oChange, "New Control", 0, assert);
	});

	QUnit.test('when calling completeChangeContent with incomplete specificChangeInfo', function (assert) {
		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				changeType: "addSimpleFormGroup",
				index: 0,
				newControlId: "newId"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedComponent
		}).catch(function(oError) {
			assert.strictEqual(oError.message, "oSpecificChangeInfo.newLabel attribute required", "the undefined value raises an error message");
		});
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with title and having relative index", {
		beforeEach: function () {
			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "addSimpleFormGroup",
					index: 1,
					newLabel: "New Control",
					newControlId: "newId"
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

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 5, assert);
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

		return testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oChange, "New Control", 5, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform without title and having relative index", {
		beforeEach: function () {
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});
			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oLabel0, this.oInput0, this.oLabel1, this.oInput1]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "addSimpleFormGroup",
					index: 0,
					newLabel: "New Control",
					newControlId: "newId"
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

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change containing local ids", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 0, assert);
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:form='sap.ui.layout.form' xmlns='sap.m'>" +
			"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
			"<form:content>" +
			"<Label id='Label0' text='Label 0' visible='true' />" +
			"<Input id='Input0' visible='true' />" +
			"<Label id='Label1' text='Label 1' visible='true' />" +
			"<Input id='Input1' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		return testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oChange, "New Control", 0, assert);
	});

	QUnit.module("using sap.ui.layout.changeHandler.AddSimpleFormGroup on simpleform with two form containers having title and relative index", {
		beforeEach: function () {
			this.oTitle0 = new Title({id: "Title0", text: "Title 0"});
			this.oLabel0 = new Label({id: "Label0", text: "Label 0", visible: true});
			this.oLabel1 = new Label({id: "Label1", text: "Label 1"});
			this.oInput0 = new Input({id: "Input0", visible: true});
			this.oInput1 = new Input({id: "Input1"});

			this.oTitle1 = new Title({id: "Title1", text: "Title 1"});
			this.oLabel2 = new Label({id: "Label2", text: "Label 2", visible: true});
			this.oLabel3 = new Label({id: "Label3", text: "Label 3"});
			this.oInput2 = new Input({id: "Input2", visible: true});
			this.oInput3 = new Input({id: "Input3"});

			this.oSimpleForm = new SimpleForm({
				id: "SimpleForm", title: "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content: [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oTitle1, this.oLabel2, this.oInput2, this.oLabel3, this.oInput3]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oMockedComponent = {
				createId: function (sString) {
					return "component---" + sString;
				},
				getLocalId: function (sString) {
					return sString;
				}
			};

			this.mPropertyBag = {
				appComponent: this.oMockedComponent,
				modifier: JsControlTreeModifier
			};
			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					changeType: "addSimpleFormGroup",
					index: 1,
					newLabel: "New Control",
					newControlId: "newId"
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

	QUnit.test("when calling applyChange with JsControlTreeModifier twice with the same control to add", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 5, assert)
		// add the same change another time
		.then(AddSimpleFormGroup.applyChange.bind(AddSimpleFormGroup, this.oChange, this.oSimpleForm, this.mPropertyBag))
		.catch(function(oError) {
			assert.ok(oError.message.indexOf("Control to be created already exists") >= 0,
				"the second change to add the same group throws a not applicable info message");
			assert.equal(this.oSimpleForm.getContent()[5].getId(), "component---newId", "the FormContainer has the correct id");
			assert.equal(this.oSimpleForm.getContent()[5].getText(), "New Control", "the FormContainer is still available");
		}.bind(this));
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier with a change", function (assert) {
		return testApplyChangeWithJsControlTreeModifier.call(this, this.oChange, "component---newId", 5, assert);
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
			"<Title id='Title1' text='Title 1' visible='true' />" +
			"<Label id='Label2' text='Label 2' visible='true' />" +
			"<Input id='Input2' visible='true' />" +
			"<Label id='Label3' text='Label 3' visible='true' />" +
			"<Input id='Input3' visible='true' />" +
			"</form:content>" +
			"</form:SimpleForm>" +
			"</mvc:View>";

		return testApplyChangeWithXMLTreeModifier.call(this, oXmlString, this.oChange, "New Control", 5, assert);
	});
});