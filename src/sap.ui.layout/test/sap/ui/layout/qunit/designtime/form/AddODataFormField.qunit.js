/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Title",
	"sap/ui/core/mvc/View",
	"sap/ui/layout/changeHandler/AddFormField",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	Title,
	View,
	AddFieldChangeHandler,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout,
	JsControlTreeModifier,
	FlexTestAPI
) {
	'use strict';

	QUnit.module("AddField for Form", {
		beforeEach: function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};
		},
		afterEach: function () {
			if (this.oForm) {
				this.oForm.destroy();
			}
		}
	});

	QUnit.test('Add smart field to Form in different positions', function (assert) {
		var oTitle = new Title("NewGroup");

		this.oForm = new Form({
			id: "idForm",
			layout: new ResponsiveGridLayout(),
			formContainers: new FormContainer({
				id: "idFormContainer",
				formElements: [new FormElement()]
			}),
			title : oTitle
		});
		var oView = new View({content : [
			this.oForm
		]});

		assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 1, "the form has only one form element in the beginning");

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				"parentId": "idFormContainer",
				"newControlId": "addedFieldId",
				"index" : 1,
				"oDataServiceVersion" : "2.0",
				"bindingPath" : "BindingPath1",
				"changeType" : "addFormField"
			},
			selector: this.oForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			return AddFieldChangeHandler.applyChange(oChange, this.oForm,
				{
					modifier: JsControlTreeModifier,
					view : oView,
					appComponent : this.oMockedAppComponent
				}
			)
			.then(function() {
				var oFormContainer = this.oForm.getFormContainers()[0];
				var oFormElements = oFormContainer.getFormElements();
				var oNewFormElement = oFormElements[1];

				assert.equal(oFormElements.length, 2, "the form has now 2 form elements");
				assert.equal(oNewFormElement.getId(), "addedFieldId", "the new form element has a stable id");
				assert.equal(oNewFormElement.getLabel().getId(), "addedFieldId-field-label", "the new label was inserted for the first form element");

				var oFormField = oNewFormElement.getFields()[0];
				assert.equal(oFormField.getId(),"addedFieldId-field", "the field has a stable id");
				assert.equal(oFormField.getBindingPath("value"),"BindingPath1", "the field has the correct binding path");

				return FlexTestAPI.createFlexObject({
					changeSpecificData: {
						"parentId": "idFormContainer",
						"newControlId": "addedFieldId2",
						"index" : 0,
						"oDataServiceVersion" : "2.0",
						"bindingPath" : "BindingPath2",
						"changeType" : "addFormField"
					},
					selector: this.oForm,
					appComponent: this.oMockedAppComponent
				}).then(function(oChange2) {
					return AddFieldChangeHandler.applyChange(oChange2, this.oForm,
						{
							modifier: JsControlTreeModifier,
							view : oView,
							appComponent: this.oMockedAppComponent
						}
					);
					}.bind(this))
					.then(function() {
						assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 3, "the form has now 3 form elements");

						var oFormContainer = this.oForm.getFormContainers()[0];

						var oFormElement1 = oFormContainer.getAggregation("formElements")[0];
						assert.equal(oFormElement1.getLabel().getId(), "addedFieldId2-field-label", "the new label was inserted for the first form element");
						assert.equal(oFormElement1.getFields()[0].getBindingPath("value"),"BindingPath2", "the new field was inserted in the first form element");

						var oFormElement2 = oFormContainer.getAggregation("formElements")[2];
						assert.equal(oFormElement2.getLabel().getId(), "addedFieldId-field-label", "the previous label is now in the second form element");
						assert.equal(oFormElement2.getFields()[0].getBindingPath("value"),"BindingPath1", "the previous field is now in the second form element");
					}.bind(this));
				}.bind(this));
		}.bind(this));
	});

	QUnit.test('Add the same smart field to Form two times', function (assert) {
		var oTitle = new Title("NewGroup");

		this.oForm = new Form({
			id: "idForm",
			layout: new ResponsiveGridLayout(),
			formContainers: new FormContainer({
				id: "idFormContainer",
				formElements: [new FormElement()]
			}),
			title : oTitle
		});
		this.oForm.appComponent = this.oMockedAppComponent;
		var oView = new View({content : [
			this.oForm
		]});

		var oPropertyBag = {
			modifier : JsControlTreeModifier,
			view : oView,
			appComponent : this.oMockedAppComponent
		};

		return FlexTestAPI.createFlexObject({
			changeSpecificData: {
				"parentId": "idFormContainer",
				"newControlId": "addedFieldId",
				"index" : 1,
				"oDataServiceVersion" : "2.0",
				"bindingPath" : "BindingPath1",
				"changeType" : "addFormField"
			},
			selector: this.oForm,
			appComponent: this.oMockedAppComponent
		}).then(function(oChange) {
			assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 1,
				"the form has only one form element in the beginning");

			return AddFieldChangeHandler.applyChange(oChange, this.oForm, oPropertyBag)
			.then(function() {
				return AddFieldChangeHandler.applyChange(oChange, this.oForm, oPropertyBag);
			}.bind(this))
			.catch(function(oReturn) {
				assert.ok(oReturn.message.includes("Control to be created already exists"),
					"the second change to add the same field throws a not applicable info message");

				var oFormContainer = this.oForm.getFormContainers()[0];
				var oFormElements = oFormContainer.getFormElements();
				var oNewFormElement = oFormElements[1];

				assert.equal(oFormElements.length, 2, "the form has now 2 form elements");
				assert.equal(oNewFormElement.getId(), "addedFieldId", "the new form element has a stable id");
				assert.equal(oNewFormElement.getLabel().getId(), "addedFieldId-field-label", "the new label was inserted for the first form element");
			}.bind(this));
		}.bind(this));
	});
});
