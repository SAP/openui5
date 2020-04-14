/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/rta/util/BindingsExtractor",
	"./TestUtils"
],
function(
	AdditionalElementsAnalyzer,
	JSONModel,
	SimpleForm,
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

	QUnit.module("enhanceInvisibleElements tests with OData", TestUtils.commonHooks(),
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
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
