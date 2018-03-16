/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/dt/ElementUtil",
	"sap/ui/model/json/JSONModel"
],
function(
	AdditionalElementsAnalyzer,
	ElementUtil,
	JSONModel
) {
	"use strict";

	QUnit.start();

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
		afterEach : function(assert) {
			this.oView.getController().destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("when getting invisible elements with a control without model", function(assert) {
		var oSimpleFormWithoutModel = new sap.ui.layout.form.SimpleForm();
		var oSimpleForm = this.oView.byId("SimpleForm");
		var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer){
			return aAllFormElements.concat(oFormContainer.getFormElements());
		},[]).filter(function(oFormElement){
			return oFormElement.isVisible() === false;
		});

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : aFormElements,
				types : {
					"sap.ui.layout.form.FormElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
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
		var oSimpleFormWithJSONModel = new sap.ui.layout.form.SimpleForm();
		var oSimpleForm = this.oView.byId("SimpleForm");
		var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer){
			return aAllFormElements.concat(oFormContainer.getFormElements());
		},[]).filter(function(oFormElement){
			return oFormElement.isVisible() === false;
		});
		oSimpleFormWithJSONModel.setModel(new JSONModel({elements: "foo"}));

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : aFormElements,
				types : {
					"sap.ui.layout.form.FormElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
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

	function renderComplexView(assert) {
		var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
		oView.placeAt("test-view");
		sap.ui.getCore().applyChanges();
		return oView;
	}
});
