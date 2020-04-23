/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/m/Input",
	"sap/ui/rta/util/BindingsExtractor",
	"./TestUtils"
],
function(
	AdditionalElementsAnalyzer,
	JSONModel,
	SimpleForm,
	Form,
	ResponsiveGridLayout,
	FormContainer,
	FormElement,
	Input,
	BindingsExtractor,
	TestUtils
) {
	"use strict";

	function _createSimpleFormFakingFormElements(oView) {
		var oNewSimpleForm = new SimpleForm();
		var oSimpleForm = oView.byId("SimpleForm");
		var aFormElementActionObjects = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer) {
			return aAllFormElements.concat(oFormContainer.getFormElements());
		}, []).filter(function(oFormElement) {
			return oFormElement.isVisible() === false;
		}).map(function(oFormElement) {
			return {
				element : oFormElement,
				action : {
					//nothing relevant for the analyzer
				}
			};
		});
		return {
			simpleForm: oNewSimpleForm,
			formElementActionObjects: aFormElementActionObjects
		};
	}

	QUnit.module("Given test view", TestUtils.commonHooks(),
	function () {
		QUnit.test("when getting invisible elements with a control without model", function(assert) {
			var mTestData = _createSimpleFormFakingFormElements(this.oView);
			var oSimpleFormWithoutModel = mTestData.simpleForm;

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : mTestData.formElementActionObjects
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSimpleFormWithoutModel, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 5, "then there are 5 invisible Elements that are not enhanced with oDataProperty properties");
				assert.equal(aAdditionalElements[0].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[1].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[2].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[3].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[4].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[0].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[1].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[2].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[3].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[4].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
			});
		});

		QUnit.test("when getting invisible elements with an element with a json model", function(assert) {
			var mTestData = _createSimpleFormFakingFormElements(this.oView);
			var oSimpleFormWithJSONModel = mTestData.simpleForm;

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : mTestData.formElementActionObjects
				}
			};
			oSimpleFormWithJSONModel.setModel(new JSONModel({elements: "foo"}));


			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSimpleFormWithJSONModel, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 5, "then there are 5 invisible Elements that are not enhanced with oDataProperty properties");
				assert.equal(aAdditionalElements[0].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[1].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[2].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[3].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[4].originalLabel, "", "then the originalLabel is not set");
				assert.equal(aAdditionalElements[0].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[1].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[2].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[3].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
				assert.equal(aAdditionalElements[4].referencedComplexPropertyName, "", "then the referencedComplexPropertyName is not set");
			});
		});

		function givenAFormWithANamedModel(sModelName) {
			var oInvisibleElement = new FormElement({
				id : "invisible",
				label : "Some Label",
				visible : false,
				fields : [
					new Input({value: "{" + sModelName + ">Property02}"})
				]
			});
			var oForm = new Form({
				id : "SomeId",
				layout : new ResponsiveGridLayout(),
				formContainers : [
					new FormContainer({
						id : "SomeContainerId",
						formElements : []
					}),
					new FormContainer({
						id : "OtherContainerId",
						formElements : [
							new FormElement({
								id : "visible",
								fields : [
									new Input({value: "{" + sModelName + ">Property01}"})
								]
							}),
							oInvisibleElement
						]
					})
				]
				//not assigning delegate as it is not read anymore but passed upfront
			});
			oForm.setModel(new JSONModel({
				Property01: "foo",
				Property02: "bar"
			}), sModelName);
			oForm.bindElement({
				path: "/",
				model: sModelName
			});
			return {
				form : oForm,
				container : oForm.getFormContainers()[0],
				invisible : oInvisibleElement
			};
		}

		QUnit.test("when getting invisible elements with an element with a named model and delegate", function(assert) {
			var sModelName = "someModelName";
			var mTestData = givenAFormWithANamedModel(sModelName);

			var sOriginalLabel = "SomeOriginalLabel";
			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						action: {
							//reveal action, nothing relevant for the analyzer
						},
						element: mTestData.invisible
					}]
				},
				addViaDelegate : {
					action : {}, //not relevant for test,
					delegateInfo: {
						payload: {
							modelName :sModelName
						},
						delegate: {
							getPropertyInfo :function() {
								return Promise.resolve([{
									name : "Property01",
									bindingPath: "Property01"
								}, {
									name : "Property02",
									bindingPath: "Property02",
									label: sOriginalLabel
								}]);
							}
						}
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(mTestData.container, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 1, "then single invisible element is returned");
				assert.equal(aAdditionalElements[0].originalLabel, sOriginalLabel, "then the element is enhanced by metadata information like original label");
			}).then(function() {
				mTestData.form.destroy();
			});
		});

		QUnit.test("when getting unrepresented elements from delegate for an element with a named model", function(assert) {
			var sModelName = "someModelName";
			var mTestData = givenAFormWithANamedModel(sModelName, this.oView);

			var oActionsObject = {
				relevantContainer: mTestData.form,
				action : {
					aggregation: "formElements"
				},
				delegateInfo: {
					payload: {
						modelName :sModelName
					},
					delegate: {
						getPropertyInfo :function() {
							return Promise.resolve([{
								name : "Property01",
								bindingPath: "Property01"
							}, {
								name : "Property03",
								bindingPath: "Property03",
								label: "unrepresented property"
							}]);
						}
					}
				}
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(mTestData.container, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 1, "then single unrepresented property is returned");
				assert.equal(aAdditionalElements[0].name, "Property03", "then the element is enhanced by metadata information like original label");
			}).then(function() {
				mTestData.form.destroy();
			});
		});
	});
	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
