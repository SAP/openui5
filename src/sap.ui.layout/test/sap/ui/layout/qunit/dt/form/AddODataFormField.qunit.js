/*global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/core/Title",
		"sap/ui/core/mvc/View",
		"sap/ui/layout/changeHandler/AddFormField",
		"sap/ui/layout/form/Form",
		"sap/ui/comp/smartfield/SmartField",
		"sap/ui/fl/Change",
		"sap/ui/fl/changeHandler/JsControlTreeModifier",
		"sap/ui/fl/changeHandler/XmlTreeModifier",
		"sap/ui/fl/changeHandler/ChangeHandlerMediator",
		// should be last:
		'sap/ui/thirdparty/sinon',
		'sap/ui/thirdparty/sinon-ie',
		'sap/ui/thirdparty/sinon-qunit'
	],
	function (
		Title,
		View,
		AddFieldChangeHandler,
		Form,
		SmartField,
		Change,
		JsControlTreeModifier,
		XmlTreeModifier,
		ChangeHandlerMediator
	) {
		'use strict';

		QUnit.start();

		// Register an entry on the Change Handler Mediator (e.g. from SmartField)
		ChangeHandlerMediator.addChangeHandlerSettings({
			"scenario" : "addODataField",
			"oDataServiceVersion" : "2.0"}, {
			"requiredLibraries" : {
				"sap.ui.comp": {
					"minVersion": "1.48",
					"lazy": "false"
				}
			},

			//Function returning a set of SmartField + SmartLabel ready to be added
			"createFunction" : function(oModifier, mPropertyBag){
				var oSmartField = oModifier.createControl("sap.ui.comp.smartfield.SmartField",
					mPropertyBag.appComponent,
					mPropertyBag.view,
					mPropertyBag.fieldSelector,
					{value : "{" + mPropertyBag.bindingPath + "}"}
				);
				var sNewFieldId = oModifier.getId(oSmartField);
				var oSmartFieldLabel = oModifier.createControl("sap.ui.comp.smartfield.SmartLabel",
					mPropertyBag.appComponent,
					mPropertyBag.view,
					sNewFieldId + "-label",
					{labelFor: sNewFieldId}
				);
				return {
					"label" : oSmartFieldLabel,
					"control" : oSmartField
				};
			}
		});

		QUnit.module("AddField for Form", {
			beforeEach: function () {
				this.oAddFieldChangeHandler = AddFieldChangeHandler;
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

			this.oAddFieldChangeHandler.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});

			assert.ok(this.oAddFieldChangeHandler.applyChange(oChange, this.oForm,
				{modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent}),
				"the change to add a field was applied");

			var oFormContainer = this.oForm.getFormContainers()[0];
			var oFormElements = oFormContainer.getFormElements();
			var oNewFormElement = oFormElements[1];

			assert.equal(oFormElements.length, 2, "the form has now 2 form elements");

			assert.equal(oNewFormElement.getLabel().getId(), "addedFieldId-label", "the new label was inserted for the first form element");

			var oFormField = oNewFormElement.getFields()[0];
			assert.equal(oFormField.getBindingPath("value"),"BindingPath1", "the field was inserted in the empty form");

			var mSpecificChangeInfo2 = {
				"newControlId": "addedFieldId2",
				"parentId": "idFormContainer",
				"index" : 0,
				"bindingPath" : "BindingPath2",
				"oDataServiceVersion" : "2.0"
			};

			var oChange2 = new Change({"changeType" : "addFormField"});

			this.oAddFieldChangeHandler.completeChangeContent(oChange2, mSpecificChangeInfo2, {modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});

			assert.ok(this.oAddFieldChangeHandler.applyChange(oChange2, this.oForm,
				{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent}),
				"the change adding a field to index 0 was applied");

			assert.equal(this.oForm.getFormContainers()[0].getFormElements().length, 3, "the form has now 3 form elements");

			oFormContainer = this.oForm.getFormContainers()[0];

			var oFormElement1 = oFormContainer.getAggregation("formElements")[0];
			assert.equal(oFormElement1.getLabel().getId(), "addedFieldId2-label", "the new label was inserted for the first form element");
			assert.equal(oFormElement1.getFields()[0].getBindingPath("value"),"BindingPath2", "the new field was inserted in the first form element");

			var oFormElement2 = oFormContainer.getAggregation("formElements")[2];
			assert.equal(oFormElement2.getLabel().getId(), "addedFieldId-label", "the previous label is now in the second form element");
			assert.equal(oFormElement2.getFields()[0].getBindingPath("value"),"BindingPath1", "the previous field is now in the second form element");

		});

		QUnit.module("AddFormField for Form in XML", {
			beforeEach: function () {
				this.oAddFieldChangeHandler = AddFieldChangeHandler;
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

			var oXmlString =
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

			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");

			this.oAddFieldChangeHandler.completeChangeContent(oChangeXml, XMLSpecificChangeInfo, {modifier: XmlTreeModifier, view : oXmlDocument, appComponent: this.oMockedAppComponent});

			this.oXmlFormContainer = oXmlDocument.getElementById("container1");
			assert.ok(this.oAddFieldChangeHandler.applyChange(oChangeXml, this.oXmlFormContainer,
					{modifier: XmlTreeModifier, view: oXmlDocument, appComponent: this.oMockedAppComponent}),
					"the change was successfully applied");

			assert.equal(this.oXmlFormContainer.childElementCount, 2, "the formContainer has 2 elements after the change");

			assert.equal(this.oXmlFormContainer.getElementsByTagName("sap.ui.comp.smartfield.SmartLabel")[0].getAttribute("id"), sAddedFieldId + "-label", "the field's label was added in the right position");
			assert.equal(this.oXmlFormContainer.getElementsByTagName("sap.ui.comp.smartfield.SmartField")[0].getAttribute("id"), sAddedFieldId, "the field was added in the right position");
		});

	});