/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/dt/ElementUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm"
],
function(
	AdditionalElementsAnalyzer,
	ElementUtil,
	JSONModel,
	SimpleForm
) {
	"use strict";

	QUnit.module("enhanceInvisibleElements tests with OData", {
		beforeEach : function(assert) {
			this.oView = renderComplexView(assert);
			var oGroup = this.oView.byId("GroupEntityType01");
			return Promise.all([
				this.oView.getController().isDataReady(),
				oGroup.getMetadata().loadDesignTime().then(function(oDesignTime) {
					this.mAddODataPropertyAction = oDesignTime.aggregations.formElements.actions.addODataProperty;
				}.bind(this))
			]);
		},
		afterEach : function () {
			this.oView.getController().destroy();
			this.oView.destroy();
		}
	}, function () {
		QUnit.test("when getting invisible elements with a control without model", function(assert) {
			var oSimpleFormWithoutModel = new SimpleForm();
			var oSimpleForm = this.oView.byId("SimpleForm");
			var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer){
				return aAllFormElements.concat(oFormContainer.getFormElements());
			},[]).filter(function(oFormElement){
				return oFormElement.isVisible() === false;
			}).map(function(oFormElement){
				return {
					element : oFormElement,
					action : {
						//nothing relevant for the analyzer
					}
				};
			});

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : aFormElements
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
			var oSimpleFormWithJSONModel = new SimpleForm();
			var oSimpleForm = this.oView.byId("SimpleForm");
			var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer){
				return aAllFormElements.concat(oFormContainer.getFormElements());
			},[]).filter(function(oFormElement){
				return oFormElement.isVisible() === false;
			}).map(function(oFormElement){
				return {
					element : oFormElement,
					action : {
						//nothing relevant for the analyzer
					}
				};
			});
			oSimpleFormWithJSONModel.setModel(new JSONModel({elements: "foo"}));

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : aFormElements
				}
			};

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

	function renderComplexView() {
		var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
		oView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		return oView;
	}

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
