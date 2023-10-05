/*global QUnit*/
sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/layout/changeHandler/RenameSimpleForm",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/core/Element"
], function(
	layoutLibrary,
	RenameSimpleForm,
	SimpleForm,
	JsControlTreeModifier,
	XmlTreeModifier,
	Title,
	Label,
	Input,
	JSONModel,
	oCore,
	FlexTestAPI,
	Element
) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	QUnit.module("using sap.ui.layout.changeHandler.RenameSimpleForm with a new change format", {
		beforeEach: function () {
			this.sNewValue = "new label";

			this.oTitle0 = new Title({id : "component---Title0",  text : "Title 0"});
			this.oLabel0 = new Label({id : "component---Label0",  text : "Label 0"});
			this.oLabel1 = new Label({id : "component---Label1",  text : "Label 1"});
			this.oLabel2 = new Label({id : "component---Label2",  text : "{/BindingPath}"});
			this.oInput0 = new Input({id : "component---Input0"});
			this.oInput1 = new Input({id : "component---Input1"});
			this.oInput2 = new Input({id : "component---Input2"});

			this.oModel = new JSONModel({
				BindingPath: "Binding Value"
			});

			this.oSimpleForm = new SimpleForm({
				id : "component---SimpleForm", title : "Simple Form",
				layout: SimpleFormLayout.ColumnLayout,
				content : [
					this.oTitle0,
					this.oLabel0, this.oInput0,
					this.oLabel1, this.oInput1,
					this.oLabel2, this.oInput2
				]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			this.oSimpleForm.setModel(this.oModel);

			oCore.applyChanges();

			this.oFormContainer = this.oSimpleForm.getAggregation("form").getAggregation("formContainers")[0];
			this.oFormElement = this.oFormContainer.getAggregation("formElements")[0];
			this.oFormElementBinding = this.oFormContainer.getAggregation("formElements")[2];

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
					value: this.sNewValue,
					changeType: "renameLabel",
					renamedElement: {id: this.oFormElement.getId()}
				},
				selector: this.oSimpleForm,
				appComponent: this.oMockedComponent
			}).then(function(oChange) {
				this.oChangeWrapper = oChange;
				this.oChangeHandler = RenameSimpleForm;
			}.bind(this));
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
		}
	});

	QUnit.test("when calling applyChange with JsControlTreeModifier", function (assert) {
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return this.oChangeHandler.applyChange(this.oChangeWrapper, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.equal(this.oFormElement.getLabel().getText(), this.sNewValue, "the label has changed");
			}.bind(this));
	});

	QUnit.test("when calling applyChange with XmlTreeModifier", function (assert) {
		var oXmlString =
		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.m'>" +
		"<layout:SimpleForm id='SimpleForm' editable='true' title='Simple Form' class='editableForm' layout='ColumnLayout'>" +
		"<layout:content>" +
		"<Title id='component---Title0' text='oldTitle' />" +
		"<Label id='component---Label0' text='oldLabel0' />" +
		"<Input id='component---Input0'/>" +
		"<Label id='component---Label1' text='oldLabel1' />" +
		"<Input id='component---Input1'/>" +
		"</layout:content>" +
		"</layout:SimpleForm>" +
		"</mvc:View>";

		var oDOMParser = new DOMParser();
		this.oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

		this.oXmlSimpleForm = this.oXmlDocument.childNodes[0];
		this.oXmlLabel0 = this.oXmlSimpleForm.childNodes[0].childNodes[1];

		return this.oChangeHandler.applyChange(this.oChangeWrapper, this.oXmlSimpleForm, {
			appComponent: this.oMockedComponent,
			modifier : XmlTreeModifier,
			view : this.oXmlDocument
		})
			.then(function() {
				assert.equal(this.oXmlLabel0.getAttribute("text"), this.sNewValue, "the label has changed");
				var oExpectedChangeVizInfo = {
					affectedControls: [
						// as the FormElements in a SimpeForm don't get stable IDs, we have to cheat
						Element.registry.get("component---Label0").getParent().getId()
					],
					updateRequired: true,
					descriptionPayload: {
						originalLabel: "oldLabel0",
						newLabel:  this.sNewValue
					}
				};
				assert.deepEqual(this.oChangeHandler.getChangeVisualizationInfo(this.oChangeWrapper, this.oMockedComponent), oExpectedChangeVizInfo);
			}.bind(this));
	});

	QUnit.test("applyChange shall raise an error if the control is invalid", function (assert) {
		var oControl;
		this.mPropertyBag.modifier = JsControlTreeModifier;
		return this.oChangeHandler.applyChange(this.oChangeWrapper, oControl, this.mPropertyBag)
			.catch(function(oError) {
				assert.ok(oError, "Shall raise an error");
		});
	});

	QUnit.test('when calling completeChangeContent for FormContainer', function (assert) {
		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				value: this.sNewValue,
				changeType: "renameTitle",
				renamedElement: {id: this.oFormContainer.getId()}
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedComponent
		}).then(function(oChange) {
			assert.equal(oChange.getText("formText"), this.sNewValue, "the new value has been added to the change");
			assert.equal(oChange.getContent().elementSelector.id, "Title0", "stableRenamedElementId has been added to the change");
			assert.ok(oChange.getContent().elementSelector.idIsLocal, "the id is a local one");
			assert.equal(oChange.getDependentControl("elementSelector", this.mPropertyBag).getId(), this.oTitle0.getId(), "elementSelector is part of dependent selector");
		}.bind(this));
	});

	QUnit.test('when calling applyChange with an empty string as value', function (assert) {
		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				value: "",
				changeType: "renameLabel",
				renamedElement: {id: this.oFormElement.getId()}
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedComponent
		}).then(function(oChange) {
			return this.oChangeHandler.applyChange(oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.equal(this.oFormElement.getLabel().getText(), "", "the label has changed");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('when calling applyChange and revertChange with a binding', function (assert) {
		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				value: "New Value",
				changeType: "renameLabel",
				renamedElement: {id: this.oFormElementBinding.getId()}
			},
			selector: this.oSimpleForm,
			appComponent: this.oMockedComponent
		}).then(function(oChange) {
			return this.oChangeHandler.applyChange(oChange, this.oSimpleForm, this.mPropertyBag)
			.then(function() {
				assert.equal(
					oChange.getRevertData().parts[0].path,
					"/BindingPath",
					"the revert data is properly saved on the change"
				);
				assert.equal(this.oFormElementBinding.getLabel().getText(), "New Value", "the label has changed");
				this.oChangeHandler.revertChange(oChange, this.oSimpleForm, this.mPropertyBag);
				assert.equal(this.oFormElementBinding.getLabel().getText(), "Binding Value", "the change was reverted");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('when calling completeChangeContent with an undefined value', function (assert) {
		var oChange = {
			addDependentControl : function() {}
		};

		var oSpecificChangeInfo = {
			renamedElement :{
				id: this.oFormContainer.getId()
			},
			changeType: "renameTitle",
			value: undefined
		};

		assert.throws(
			function() {
				this.oChangeHandler.completeChangeContent(oChange, oSpecificChangeInfo, {});
			},
			new Error("oSpecificChangeInfo.value attribute required"),
			"the undefined value raises an error message"
		);
	});

	QUnit.test('when calling completeChangeContent without renamedElementId', function (assert) {
		var oSpecificChangeInfo = {
			changeType: "renameTitle",
			value: this.sNewValue
		};

		assert.throws(
			function() {
				this.oChangeHandler.completeChangeContent({}, oSpecificChangeInfo, {});
			},
			new Error("oSpecificChangeInfo.renamedElement attribute required"),
			"the undefined value raises an error message"
		);
	});
});