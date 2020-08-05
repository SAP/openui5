/*global QUnit*/
sap.ui.define([
		"sap/ui/core/Title",
		"sap/ui/core/mvc/View",
		"sap/ui/layout/changeHandler/AddFormField",
		"sap/ui/layout/form/Form",
		"sap/ui/fl/Change",
		"sap/ui/core/util/reflection/JsControlTreeModifier",
		"sap/ui/core/util/reflection/XmlTreeModifier",
		"sap/base/util/includes"
	],
	function (
		Title,
		View,
		AddFieldChangeHandler,
		Form,
		Change,
		JsControlTreeModifier,
		XmlTreeModifier,
		fnBaseIncludes
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
				layout: new sap.ui.layout.form.ResponsiveGridLayout(),
				formContainers: new sap.ui.layout.form.FormContainer({
					id: "idFormContainer",
					formElements: [new sap.ui.layout.form.FormElement()]
				}),
				title : oTitle
			});
			var oView = new View({content : [
				this.oForm
			]});

			var mSpecificChangeInfo = {
				"newControlId": "addedFieldId",
				"parentId": "idFormContainer",
				"index" : 1,
				"bindingPath" : "BindingPath1",
				"oDataServiceVersion" : "2.0"
			};
			var oChange = new Change({"changeType" : "addFormField"});

			assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 1, "the form has only one form element in the beginning");

			AddFieldChangeHandler.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});

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

				var mSpecificChangeInfo2 = {
					"newControlId": "addedFieldId2",
					"parentId": "idFormContainer",
					"index" : 0,
					"bindingPath" : "BindingPath2",
					"oDataServiceVersion" : "2.0"
				};

				var oChange2 = new Change({"changeType" : "addFormField"});

				AddFieldChangeHandler.completeChangeContent(oChange2, mSpecificChangeInfo2, {modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
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
		});

		QUnit.test('Add the same smart field to Form two times', function (assert) {
			var oTitle = new Title("NewGroup");

			this.oForm = new Form({
				id: "idForm",
				layout: new sap.ui.layout.form.ResponsiveGridLayout(),
				formContainers: new sap.ui.layout.form.FormContainer({
					id: "idFormContainer",
					formElements: [new sap.ui.layout.form.FormElement()]
				}),
				title : oTitle
			});
			var oView = new View({content : [
				this.oForm
			]});

			var mSpecificChangeInfo = {
				"newControlId": "addedFieldId",
				"parentId": "idFormContainer",
				"index" : 1,
				"bindingPath" : "BindingPath1",
				"oDataServiceVersion" : "2.0"
			};
			var oChange = new Change({"changeType" : "addFormField"});
			var oPropertyBag = {
				modifier : JsControlTreeModifier,
				view : oView,
				appComponent : this.oMockedAppComponent
			};

			AddFieldChangeHandler.completeChangeContent(oChange, mSpecificChangeInfo, oPropertyBag);

			assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 1,
				"the form has only one form element in the beginning");

			return AddFieldChangeHandler.applyChange(oChange, this.oForm, oPropertyBag)
			.then(function() {
				return AddFieldChangeHandler.applyChange(oChange, this.oForm, oPropertyBag);
			}.bind(this))
			.catch(function(oReturn) {
				assert.ok(fnBaseIncludes(oReturn.message, "Control to be created already exists"),
					"the second change to add the same field throws a not applicable info message");

				var oFormContainer = this.oForm.getFormContainers()[0];
				var oFormElements = oFormContainer.getFormElements();
				var oNewFormElement = oFormElements[1];

				assert.equal(oFormElements.length, 2, "the form has now 2 form elements");
				assert.equal(oNewFormElement.getId(), "addedFieldId", "the new form element has a stable id");
				assert.equal(oNewFormElement.getLabel().getId(), "addedFieldId-field-label", "the new label was inserted for the first form element");
			}.bind(this));
		});

		QUnit.module("AddFormField for Form in XML", {
			beforeEach: function () {
				this.oMockedAppComponent = {
					getLocalId: function () {
						return undefined;
					}
				};
			}
		});


		QUnit.test('Add smart field to Form xml tree', function (assert) {

			var sAddedFieldId = "addedFieldId";
			var sValue = "{BindingPath1}";

			var oChangeDefinitionXml = {
				"changeType" : "addFormField",
				"content" : {
					"bindingPath" : sValue,
					"newFieldIndex" : 1,
					"newFieldSelector" : {
						"id" : sAddedFieldId,
						"idIsLocal" : false
					},
					"oDataServiceVersion" : "2.0"
				}
			};

			var XMLSpecificChangeInfo = {
				"newControlId": "addedFieldId",
				"parentId": "container1",
				"index" : 1,
				"bindingPath" : "BindingPath1",
				"oDataServiceVersion" : "2.0"
			};

			var oChangeXml = new Change(oChangeDefinitionXml);
			var oDOMParser = new DOMParser();

			var sXmlString =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m" xmlns:core="sap.ui.core">' +
					'<f:Form id="idForm">' +
						'<f:layout>' +
							'<f:ResponsiveGridLayout/>' +
						'</f:layout>' +
						'<f:formContainers>' +
							'<f:FormContainer id="container1">' +
								'<f:title>' +
									'<core:Title/>' +
								'</f:title>' +
								'<f:formElements>' +
									'<f:FormElement label="label">' +
										'<f:fields>' +
										'<m:Input/>' +
										'</f:fields>' +
									'</f:FormElement>' +
									'<f:FormElement>' +
										'<f:fields>' +
										'<m:Input/>' +
										'</f:fields>' +
									'</f:FormElement>' +
								'</f:formElements>' +
							'</f:FormContainer>' +
						'</f:formContainers>' +
					'</f:Form>' +
				'</mvc:View>';

			var oXmlDocument = oDOMParser.parseFromString(sXmlString, "application/xml").documentElement;

			AddFieldChangeHandler.completeChangeContent(oChangeXml, XMLSpecificChangeInfo, {modifier: XmlTreeModifier, view : oXmlDocument, appComponent: this.oMockedAppComponent});

			var oXmlFormContainer = oXmlDocument.childNodes[0].childNodes[1].childNodes[0];
			return AddFieldChangeHandler.applyChange(oChangeXml, oXmlFormContainer,
				{
					modifier: XmlTreeModifier,
					view: oXmlDocument,
					appComponent: this.oMockedAppComponent
				}
			)
			.then(function() {
				assert.equal(oXmlFormContainer.childElementCount, 2, "the formContainer has 2 elements after the change");
				assert.equal(oXmlFormContainer.getElementsByTagNameNS("sap.ui.comp.smartfield","SmartLabel")[0].getAttribute("id"), sAddedFieldId + "-field-label", "the field's label was added in the right position");
				assert.equal(oXmlFormContainer.getElementsByTagNameNS("sap.ui.comp.smartfield","SmartField")[0].getAttribute("id"), sAddedFieldId + "-field", "the field was added in the right position");
			});
		});

	});
