/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/ui/core/mvc/View",
	"sap/ui/layout/changeHandler/AddSimpleFormField",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/m/Label",
	"sap/m/Input",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	Title,
	Toolbar,
	View,
	AddFieldChangeHandler,
	SimpleForm,
	JsControlTreeModifier,
	XmlTreeModifier,
	Label,
	Input,
	FlexTestAPI
) {
	"use strict";

	QUnit.module("AddField for SimpleForm", {
		beforeEach: function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};
		},
		afterEach: function () {
			if (this.oSimpleForm) {
				this.oSimpleForm.destroy();
			}
		}
	});

	QUnit.test('Add smart field to SimpleForm in different positions', function (assert) {
		var oTitle = new Title("NewGroup");
		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			oTitle
		]});
		var oView = new View({content : [
			this.oSimpleForm
		]});
		var oPropertyBag = {
			modifier: JsControlTreeModifier,
			view : oView,
			appComponent : this.oMockedAppComponent
		};

		assert.equal(this.oSimpleForm.getContent().length, 1, "the form only has the title in the beginning");
		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: "addedFieldId",
				parentId: oTitle.getParent().getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			assert.equal(oChange.getDependentControl("targetContainerHeader", {modifier: JsControlTreeModifier, appComponent: this.oMockedAppComponent}).getId(), oTitle.getId(), "parent is part of dependentSelector");

			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm, oPropertyBag);
		}.bind(this))
		.then(function() {
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			assert.equal(this.oSimpleForm.getContent().length, 3, "the form has now 3 content items");
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was inserted for the first form element");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the field was inserted in the empty form");

			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					bindingPath: "BindingPath2",
					changeType: "addSimpleFormField",
					index: 0,
					newControlId: "addedFieldId2",
					parentId: oTitle.getParent().getId(),
					oDataServiceVersion : "2.0"
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedAppComponent
			});
		}.bind(this))
		.then(function(oChange2) {
			return AddFieldChangeHandler.applyChange(oChange2, this.oSimpleForm, oPropertyBag);
		}.bind(this))
		.then(function() {
			assert.equal(this.oSimpleForm.getContent().length, 5, "the form has now 5 content items");
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId2-label", "the new label was inserted for the first form element");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath2", "the new field was inserted in the first form element");

			oFormElement = oFormContainer.getAggregation("formElements")[1];
			oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the previous label is now in the second form element");
			oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the previous field is now in the second form element");

			return FlexTestAPI.createFlexObject({
				changeSpecificData: {
					bindingPath: "BindingPath3",
					changeType: "addSimpleFormField",
					index: 1,
					newControlId: "addedFieldId3",
					parentId: oTitle.getParent().getId(),
					oDataServiceVersion : "2.0"
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedAppComponent
			});
		}.bind(this))
		.then(function(oChange3) {
			return AddFieldChangeHandler.applyChange(oChange3, this.oSimpleForm, oPropertyBag);
		}.bind(this))
		.then(function() {
			assert.equal(this.oSimpleForm.getContent().length, 7, "the form has now 7 content items");
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId2-label", "the new label 2 is still in the first form element");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath2", "the new field 2 is still in the first form element");

			oFormElement = oFormContainer.getAggregation("formElements")[1];
			oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId3-label", "the new label 3 was inserted for the second form element");
			oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath3", "the new field 3 was inserted as second form element");

			oFormElement = oFormContainer.getAggregation("formElements")[2];
			oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was moved to the third form element");
			oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the new field was moved to the third form element");
		}.bind(this));
	});

	QUnit.test('Add smart field to SimpleForm with toolbar instead of title', function (assert) {
		this.oToolbar = new Toolbar("NewGroup");
		this.oLabel0 = new Label({id : "Label0",  text : "Label 0"});
		this.oInput0 = new Input({id : "Input0"});

		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			this.oToolbar, this.oLabel0, this.oInput0
		]});
		var oView = new View({content : [
			this.oSimpleForm
		]});

		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: "addedFieldId",
				parentId: oFormContainer.getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: JsControlTreeModifier,
					view : oView,
					appComponent : this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			assert.equal(this.oSimpleForm.getContent().length, 5, "the form has 5 content items after field was added");
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was inserted for the first form element");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the field was inserted as first form element");
		}.bind(this));
	});

	QUnit.test('Add smart field to second group of SimpleForm', function (assert) {
		this.oToolbar = new Toolbar("NewGroup");
		this.oTitle = new Title("AnotherGroup");
		this.oLabel0 = new Label({id : "Label0",  text : "Label 0"});
		this.oInput0 = new Input({id : "Input0"});

		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			this.oToolbar, this.oLabel0, this.oInput0, this.oTitle
		]});

		var oView = new View({content : [
			this.oSimpleForm
		]});

		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[1];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: "addedFieldId",
				parentId: oFormContainer.getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: JsControlTreeModifier,
					view : oView,
					appComponent : this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[1];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			assert.equal(this.oSimpleForm.getContent().length, 6, "the form has 6 content items after field was added");
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was inserted for the field of the new group");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the field was inserted in the empty group");
		}.bind(this));
	});

	QUnit.test('Add smart field to first group of SimpleForm with two groups', function (assert) {
		this.oToolbar = new Toolbar("NewGroup");
		this.oTitle = new Title("AnotherGroup");
		this.oLabel0 = new Label({id : "Label0",  text : "Label 0"});
		this.oInput0 = new Input({id : "Input0"});

		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			this.oToolbar, this.oLabel0, this.oInput0, this.oTitle
		]});

		var oView = new View({content : [
			this.oSimpleForm
		]});

		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 2,
				newControlId: "addedFieldId",
				parentId: oFormContainer.getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: JsControlTreeModifier,
					view : oView,
					appComponent : this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[1];
			assert.equal(this.oSimpleForm.getContent().length, 6, "the form has 6 content items after field was added");
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was inserted for the new field");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the field was inserted in the right place");
		}.bind(this));
	});

	QUnit.test('Add smart field to group of SimpleForm twice', function (assert) {
		this.oToolbar = new Toolbar("NewGroup");
		this.oTitle = new Title("AnotherGroup");
		this.oLabel0 = new Label({id : "Label0",  text : "Label 0"});
		this.oInput0 = new Input({id : "Input0"});

		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			this.oToolbar, this.oLabel0, this.oInput0, this.oTitle
		]});

		var oView = new View({content : [
			this.oSimpleForm
		]});

		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
		var oPropertyBag = {
			modifier: JsControlTreeModifier,
			view : oView,
			appComponent : this.oMockedAppComponent
		};

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: "addedFieldId",
				parentId: oFormContainer.getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm, oPropertyBag)
			.then(function() {
				return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm, oPropertyBag)
				.catch(function(oReturn) {
					assert.ok(oReturn.message.includes("Control to be created already exists"),
					"the second change to add the same field throws a not applicable info message");
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('Add smart field to SimpleForm without title/toolbar', function (assert) {
		this.oLabel0 = new Label({id : "Label0",  text : "Label 0"});
		this.oInput0 = new Input({id : "Input0"});

		this.oSimpleForm = new SimpleForm("simpleForm", {content : [
			this.oLabel0, this.oInput0
		]});

		var oView = new View({content : [
			this.oSimpleForm
		]});

		var oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: "addedFieldId",
				parentId: oFormContainer.getId(),
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: JsControlTreeModifier,
					view : oView,
					appComponent : this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			oFormContainer = this.oSimpleForm.getAggregation("form").getFormContainers()[0];
			var oFormElement = oFormContainer.getAggregation("formElements")[0];
			assert.equal(this.oSimpleForm.getContent().length, 4, "the form has 4 content items after field was added");
			var oSmartFieldLabel = oFormElement.getLabel();
			assert.equal(oSmartFieldLabel.getId(), "addedFieldId-label", "the new label was inserted for the first form element");
			var oSmartField = oFormElement.getFields()[0];
			assert.equal(oSmartField.getBindingPath("value"),"BindingPath1", "the field was inserted in the empty form");
		}.bind(this));
	});

	// element action test does not work due to the complicated aggregation structure of the SimpleForm
	// the change needs the form container (which is not available in xml) to be created
	// Changes can't be created with xml controls since this is not a valid scenario
	// -> currently tests for XML are skipped
	QUnit.skip("AddField for SimpleForm in XML", {
		beforeEach: function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};
		}
	});

	QUnit.skip('Add smart field to SimpleForm xml tree in the end', function (assert) {
		var sAddedFieldId = "addedFieldId";
		var sValue = "{BindingPath1}";
		var sTitleId = "NewTitle";

		var oDOMParser = new DOMParser();
		var sSmartFieldId = "SmartField";
		var sSmartFieldLabelId = "SmartFieldLabel";
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:smartfield='sap.ui.comp.smartfield' xmlns:form='sap.ui.layout.form' xmlns:core='sap.ui.core'>" +
				"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
					"<form:content>" +
						'<core:Title id="' + sTitleId + '"/>' +
						'<smartfield:SmartLabel id="' + sSmartFieldLabelId + '" labelFor="' + sSmartFieldId  + '"/>' +
						'<smartfield:SmartField id="' + sSmartFieldId + '" value="' + sValue  + '"/>' +
					"</form:content>" +
				"</form:SimpleForm>" +
			"</mvc:View>";
		var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;
		this.oXmlSimpleForm = oXmlDocument.childNodes[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 10,
				newControlId: "addedFieldId",
				parentId: sTitleId,
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oXmlSimpleForm,
				{
					modifier: XmlTreeModifier,
					view: oXmlDocument,
					appComponent: this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			assert.equal(this.oXmlSimpleForm.childElementCount, 5, "the simpleform has 5 elements after the change");
			var aChildNodes = this.oXmlSimpleForm.childNodes;
			assert.equal(aChildNodes[1].getAttribute("id"), sSmartFieldLabelId);
			assert.equal(aChildNodes[2].getAttribute("id"), sSmartFieldId);
			assert.equal(aChildNodes[3].getAttribute("id"), sAddedFieldId + "-label");
			assert.equal(aChildNodes[4].getAttribute("id"), sAddedFieldId, "the field was added in position 1");
		}.bind(this));
	});

	QUnit.skip('Add smart field to SimpleForm xml tree in the beginning', function (assert) {
		var sAddedFieldId = "addedFieldId";
		var sValue = "{BindingPath1}";
		var sTitleId = "NewTitle";

		var oDOMParser = new DOMParser();
		var sSmartFieldId = "SmartField";
		var sSmartFieldLabelId = "SmartFieldLabel";
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:smartfield='sap.ui.comp.smartfield' xmlns:form='sap.ui.layout.form' xmlns:core='sap.ui.core'>" +
				"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
					"<form:content>" +
						'<core:Title id="' + sTitleId + '"/>' +
						'<smartfield:SmartLabel id="' + sSmartFieldLabelId + '" labelFor="' + sSmartFieldId  + '"/>' +
						'<smartfield:SmartField id="' + sSmartFieldId + '" value="' + sValue  + '"/>' +
					"</form:content>" +
				"</form:SimpleForm>" +
			"</mvc:View>";
		var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;
		this.oSimpleForm = oXmlDocument.childNodes[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 0,
				newControlId: sAddedFieldId,
				parentId: sTitleId,
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: XmlTreeModifier,
					view: oXmlDocument,
					appComponent: this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			assert.equal(this.oSimpleForm.childElementCount, 5, "the simpleform has 5 elements after the change");
			var aChildNodes = this.oSimpleForm.childNodes;
			assert.equal(aChildNodes[1].getAttribute("id"), sAddedFieldId + "-label");
			assert.equal(aChildNodes[2].getAttribute("id"), sAddedFieldId, "the field is added in position 0");
			assert.equal(aChildNodes[3].getAttribute("id"), sSmartFieldLabelId);
			assert.equal(aChildNodes[4].getAttribute("id"), sSmartFieldId);
		}.bind(this));
	});

	QUnit.skip('Add smart field to SimpleForm xml tree in the middle', function (assert) {
		var sAddedFieldId = "addedFieldId";
		var sTitleId = "NewTitle";

		var oDOMParser = new DOMParser();
		var sSmartFieldId = "SmartField";
		var sSmartFieldLabelId = "SmartFieldLabel";
		var sSmartFieldId2 = "SmartField2";
		var sSmartFieldLabelId2 = "SmartFieldLabel2";
		var oXmlString =
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:smartfield='sap.ui.comp.smartfield' xmlns:form='sap.ui.layout.form' xmlns:core='sap.ui.core'>" +
				"<form:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm'>" +
					"<form:content>" +
						'<core:Title id="' + sTitleId + '"/>' +
						'<smartfield:SmartLabel id="' + sSmartFieldLabelId + '" labelFor="' + sSmartFieldId  + '"/>' +
						'<smartfield:SmartField id="' + sSmartFieldId + '" value="{dummy}"/>' +
						'<smartfield:SmartLabel id="' + sSmartFieldLabelId2 + '" labelFor="' + sSmartFieldId2  + '"/>' +
						'<smartfield:SmartField id="' + sSmartFieldId2 + '" value="{dummy2}"/>' +
					"</form:content>" +
				"</form:SimpleForm>" +
			"</mvc:View>";
		var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;
		this.oSimpleForm = oXmlDocument.childNodes[0];

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				bindingPath: "BindingPath1",
				changeType: "addSimpleFormField",
				index: 1,
				newControlId: sAddedFieldId,
				parentId: sTitleId,
				oDataServiceVersion : "2.0"
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oSimpleForm,
				{
					modifier: XmlTreeModifier,
					view: oXmlDocument,
					appComponent: this.oMockedAppComponent
				}
			);
		}.bind(this))
		.then(function() {
			assert.equal(this.oSimpleForm.childElementCount, 7, "the simpleform has 7 elements after the change");
			var aChildNodes = this.oSimpleForm.childNodes;
			assert.equal(aChildNodes[1].getAttribute("id"), sSmartFieldLabelId);
			assert.equal(aChildNodes[2].getAttribute("id"), sSmartFieldId, "the first field stayed in position 0");
			assert.equal(aChildNodes[3].getAttribute("id"), sAddedFieldId + "-label");
			assert.equal(aChildNodes[4].getAttribute("id"), sAddedFieldId, "the field is added in position 1");
			assert.equal(aChildNodes[5].getAttribute("id"), sSmartFieldLabelId2);
			assert.equal(aChildNodes[6].getAttribute("id"), sSmartFieldId2, "the second field is moved to position 2");
		}.bind(this));
	});
});
