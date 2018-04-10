/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/dt/ElementUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/ResponsiveGridLayout"
],
function(
	AdditionalElementsAnalyzer,
	ElementUtil,
	JSONModel,
	SimpleForm,
	ResponsiveGridLayout
) {
	"use strict";

	var oView = renderComplexView();
	var oGroup;
	var mAddODataPropertyAction;
	oView.getController().isDataReady().then(function () {
		oGroup = oView.byId("GroupEntityType01");
		return oGroup.getMetadata().loadDesignTime().then(function(oDesignTime) {
			mAddODataPropertyAction = oDesignTime.aggregations.formElements.actions.addODataProperty;
			QUnit.start();
		});
	});

	QUnit.done(function () {
		oGroup.destroy();
		oView.destroy();
	});

	QUnit.module("Given a test view");

	QUnit.test("checks if navigation and absolute binding works", function(assert) {
		var oGroupElement1 = oView.byId("EntityType02.NavigationProperty"); // With correct navigation binding
		var oGroupElement2 = oView.byId("EntityType02.IncorrectNavigationProperty"); // With incorrect navigation binding
		var oGroupElement3 = oView.byId("EntityType02.AbsoluteBinding"); // Absolute binding
		sap.ui.getCore().applyChanges();

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : [
					oGroupElement1,
					oGroupElement2,
					oGroupElement3
				],
				types : {
					"sap.ui.comp.smartform.GroupElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
			},
			addODataProperty : {
				action : {
					//not relevant for test
				}
			}
		};

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject).then(function(aAdditionalElements) {
			// We expect only one element to be returned with a correct navigation property
			assert.equal(aAdditionalElements.length, 2, "then there are 1 additional Elements available");
			assert.equal(aAdditionalElements[0].label, oGroupElement1.getLabelText(), "the element with correct navigation binding should be in the list");
			assert.equal(aAdditionalElements[0].tooltip, oGroupElement1.getLabelText(), "the label is used as tooltip for elements with navigation binding");
			assert.equal(aAdditionalElements[1].label, oGroupElement3.getLabelText(), "the element with absolute binding should be in the list");
			assert.equal(aAdditionalElements[1].tooltip, oGroupElement3.getLabelText(), "the label is used as tooltip for elements with absolute binding");
		});
	});

	QUnit.test("when asking for the invisible sections of an object page layout", function(assert) {
		var oObjectPageLayout = oView.byId("ObjectPageLayout");

		var oActionsObject = {
			aggregation: "sections",
			reveal : {
				elements : [
					oView.byId("idMain1--ObjectPageSectionInvisible"),
					oView.byId("idMain1--ObjectPageSectionStashed1"),
					oView.byId("idMain1--ObjectPageSectionStashed2")
				],
				types : {
					"sap.ui.core._StashedControl" :{
						action : {
							//nothing relevant for the analyzer
						}
					},
					"sap.uxap.ObjectPageSection" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
			}
		};
		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oObjectPageLayout, oActionsObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 3, "then 3 additional sections are available");
			assertElementsEqual(aAdditionalElements[0], {
				selected : false,
				label : "Invisible ObjectPage Section",
				tooltip : "Invisible ObjectPage Section",
				type : "invisible",
				elementId : "idMain1--ObjectPageSectionInvisible",
				bindingPaths: []
			}, "the invisible section is found", assert);
			assertElementsEqual(aAdditionalElements[1], {
				selected : false,
				label : "idMain1--ObjectPageSectionStashed1",
				tooltip : "idMain1--ObjectPageSectionStashed1",
				type : "invisible",
				elementId : "idMain1--ObjectPageSectionStashed1",
				bindingPaths: undefined
			}, "the 1. stashed section is found", assert);
			assertElementsEqual(aAdditionalElements[2], {
				selected : false,
				label : "idMain1--ObjectPageSectionStashed2",
				tooltip : "idMain1--ObjectPageSectionStashed2",
				type : "invisible",
				elementId : "idMain1--ObjectPageSectionStashed2",
				bindingPaths: undefined
			}, "the 2. stashed section is found", assert);
		});
	});

	QUnit.test("when getting unbound elements for EntityType01 Group,", function(assert) {
		var oGroup = oView.byId("GroupEntityType01");
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel
			},
			relevantContainer: mAddODataPropertyAction.relevantContainer
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements){
			assert.equal(aAdditionalElements.length, 3, "then 3 additional properties are available");
			assert.deepEqual(aAdditionalElements[0], {
				selected : false,
				label : "Entity1-Property06-Unbound",
				tooltip : "Unbound Property6",
				type : "odata",
				entityType : "EntityType01",
				name : "Property06",
				bindingPath : "Property06",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the unbound property is found");
			assert.deepEqual(aAdditionalElements[1], {
				selected : false,
				label : "Entity1-Property07-ignored-unbound",
				tooltip : "Unbound Property7",
				type : "odata",
				entityType : "EntityType01",
				name : "Property07",
				bindingPath : "Property07",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the 2nd unbound property is found");
			assert.deepEqual(aAdditionalElements[2], {
				selected : false,
				label : "Property08",
				tooltip : "Property without sap:label",
				type : "odata",
				entityType : "EntityType01",
				name : "Property08",
				bindingPath : "Property08",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the 3rd unbound property without sap:label is returned with technical name as label");
		});
	});

	QUnit.test("when getting unbound elements for EntityType01 Group with a filter function,", function(assert) {
		var oGroup = oView.byId("GroupEntityType01");
		var oSmartForm = oView.byId("MainForm");
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel,
				filter: mAddODataPropertyAction.filter
			},
			relevantContainer: oSmartForm
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements){
			assert.equal(aAdditionalElements.length, 2, "then 2 additional properties are available");
			assert.deepEqual(aAdditionalElements[0], {
				selected : false,
				label : "Entity1-Property06-Unbound",
				tooltip : "Unbound Property6",
				type : "odata",
				entityType : "EntityType01",
				name : "Property06",
				bindingPath : "Property06",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the unbound property is found");
		});
	});

	QUnit.test("when getting unbound elements for EntityType01 Group without a relevant container,", function(assert) {
		var oGroup = oView.byId("GroupEntityType01");
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel
			}
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements){
			assert.equal(aAdditionalElements.length, 3, "then all properties of EntityType01 are available, because the GroupElements are not bound to any of them");
			assert.deepEqual(aAdditionalElements[0], {
				selected : false,
				label : "Entity1-Property06-Unbound",
				tooltip : "Unbound Property6",
				type : "odata",
				entityType : "EntityType01",
				name : "Property06",
				bindingPath : "Property06",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the unbound property is found");
			assert.deepEqual(aAdditionalElements[1], {
				selected : false,
				label : "Entity1-Property07-ignored-unbound",
				tooltip : "Unbound Property7",
				type : "odata",
				entityType : "EntityType01",
				name : "Property07",
				bindingPath : "Property07",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the 2nd unbound property is found");
		});
	});

	QUnit.test("when getting unbound elements for EntityType02 with complex properties and field control properties", function(assert) {
		var oGroup = oView.byId("GroupEntityType02");
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel
			},
			relevantContainer: mAddODataPropertyAction.relevantContainer
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements){
			assert.equal(aAdditionalElements.length, 10, "then 10 additional properties are available");
			assert.deepEqual(aAdditionalElements[0], {
				selected : false,
				label : "Entity2-Property01-Label",
				tooltip : "Entity2-Property01-QuickInfo",
				type : "odata",
				entityType : "EntityType02",
				name : "EntityType02_Property01",
				bindingPath : "EntityType02_Property01",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: ""
			}, "the unbound normal property is found");
			assert.deepEqual(aAdditionalElements[1], {
				selected : false,
				label : "ComplexProperty 03",
				tooltip : "ComplexProperty 03-QuickInfo",
				type : "odata",
				entityType : "EntityType02",
				name : "ComplexProperty03",
				bindingPath : "EntityType02_Complex/ComplexProperty03",
				originalLabel: "",
				duplicateComplexName: true,
				referencedComplexPropertyName: "EntityType02_Complex"
			}, "the unbound complex property is found");
			assert.deepEqual(aAdditionalElements[2], {
				selected : false,
				label : "ComplexProperty 01",
				tooltip : "ComplexProperty 01-QuickInfo",
				type : "odata",
				entityType : "EntityType02",
				name : "ComplexProperty01",
				bindingPath : "EntityType02_SameComplexType/ComplexProperty01",
				originalLabel: "",
				duplicateComplexName: true,
				referencedComplexPropertyName: "Same Complex Type Property with label"
			}, "the unbound complex property with a custom name is found");
			assert.deepEqual(aAdditionalElements[8], {
				selected : false,
				label : "ComplexProperty 05",
				tooltip : "ComplexProperty 05-QuickInfo",
				type : "odata",
				entityType : "EntityType02",
				name : "ComplexProperty05",
				bindingPath : "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty05",
				originalLabel: "",
				duplicateComplexName: false,
				referencedComplexPropertyName: "EntityType02_OtherComplexTypeSameComplexProperties"
			}, "the unbound complex property with a custom name is found");
		});
	});

	QUnit.test("when getting unbound elements for EntityTypeNav (which doesn't contain navigation properties)", function(assert) {
		var oGroup = oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[0];
		var oActionObject = {
			action: {
				aggregation: "formContainers",
				getLabel: mAddODataPropertyAction.getLabel
			},
			relevantContainer: mAddODataPropertyAction.relevantContainer
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements){
			assert.ok(aAdditionalElements.length > 0, "then the properties are found");
		});
	});

	QUnit.test("when checking group elements to find original label in add dialog, after renaming custom label and removing group elements", function(assert) {
		var oGroup = oView.byId("GroupEntityType02");
		var oGroupElement1 = oView.byId("ComplexBindingCase");
		oGroupElement1.setLabel("Renamed Label");
		oGroupElement1.setVisible(false);
		var oGroupElement2 = oView.byId("EntityType02.CompProp1");
		oGroupElement2.setVisible(false);
		sap.ui.getCore().applyChanges();

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : [oGroupElement1, oGroupElement2],
				types : {
					"sap.ui.comp.smartform.GroupElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
			},
			addODataProperty : {
				action : {
					//not relevant for test
				}
			}
		};

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 2, "then the 2 invisible elements with oData are returned");
			assert.equal(aAdditionalElements[0].label, "Renamed Label", "element with custom label renamed");
			assert.equal(aAdditionalElements[0].originalLabel, "EntityType02_Property03", "element contains original label from oData and not custom label");
			assert.equal(aAdditionalElements[0].type, "invisible", "element made invisible");
			assert.equal(aAdditionalElements[0].tooltip, "Entity2-EntityType02_Property03-QuickInfo (from annotation)", "quickinfo annotation is used as tooltip also for hidden elements, if available");
			assert.equal(aAdditionalElements[1].originalLabel, "", "element contains original label blank as it was not renamed");
			assert.equal(aAdditionalElements[1].type, "invisible", "element made invisible");
			assert.equal(aAdditionalElements[1].tooltip, "ComplexProperty 01-QuickInfo", "sap:quickinfo is used as tooltip");
		});
	});

	QUnit.test("when getting invisible elements of a bound group containing a removed field with absolute binding pointing to another entity", function(assert) {
		var oGroup = oView.byId("OtherGroup");
		var oGroupElement1 = oView.byId("NavForm.EntityType01.Prop1");
		oGroupElement1.setVisible(false);
		sap.ui.getCore().applyChanges();

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : [oGroupElement1],
				types : {
					"sap.ui.comp.smartform.GroupElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
			},
			addODataProperty : {
				action : {
					//not relevant for test
				}
			}
		};

		function fnIsFieldPresent(oElement) {
			return oElement.label === oGroupElement1.getLabelText();
		}

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
			assert.ok(aAdditionalElements.some(fnIsFieldPresent), "then the field is available on the dialog");
		});
	});

	QUnit.test("when getting invisible elements of a bound group containing a field with the same property name as the one of an invisible field in a different entity", function(assert) {
		var oGroup = oView.byId("GroupEntityType01");
		var oGroupElement1 = oView.byId("EntityType02.CommonProperty");

		var oActionsObject = {
			aggregation: "formElements",
			reveal : {
				elements : [oGroupElement1],
				types : {
					"sap.ui.comp.smartform.GroupElement" : {
						action : {
							//nothing relevant for the analyzer
						}
					}
				}
			},
			addODataProperty : {
				action : {
					//not relevant for test
				}
			}
		};

		function fnIsFieldPresent(oElement) {
			return oElement.label === oGroupElement1.getLabelText();
		}

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
			assert.notOk(aAdditionalElements.some(fnIsFieldPresent), "then the other field is not available on the dialog");
		});
	});

	QUnit.test("when renaming a smart element", function(assert) {
		var oGroup = oView.byId("GroupEntityType02");
		var oGroupElement1 = oGroup.getGroupElements()[3];
		oGroupElement1.setVisible(false);
		oGroupElement1.setLabel("RenamedLabel");
		//ComplexType binding element
		var oGroupElement2 = oGroup.getGroupElements()[0];
		oGroupElement2.setVisible(false);
		oGroupElement2.getLabelControl().setText("RenamedLabel");
		sap.ui.getCore().applyChanges();

		var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [oGroupElement1, oGroupElement2],
					types : {
						"sap.ui.comp.smartform.GroupElement" : {
							action : {
								//nothing relevant for the analyzer
							}
						}
					}
				},
				addODataProperty : {
					action : {
						//not relevant for test
					}
				}
			};

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 2, "then there are 2 additional Elements available");
			assert.equal(aAdditionalElements[0].label, "RenamedLabel", "the unbound normal property is found");
			assert.equal(aAdditionalElements[1].label, "RenamedLabel", "the unbound complex property is found");
		});
	});

	QUnit.test("when asking for the invisible fields of a simpleForm", function(assert) {
		var oSimpleForm = oView.byId("SimpleForm");
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
			},
			addODataProperty : {
				action : {
					//not relevant for test
				}
			}
		};

		return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSimpleForm, oActionsObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 4, "then the 3 invisible elements with oData + the element without binding are returned");
			assert.equal(aAdditionalElements[0].label, "Invisible 1", "then the label is set correctly");
			assert.equal(aAdditionalElements[1].label, "Complex Invisible oData Property", "then the label is set correctly");
			assert.ok(typeof aAdditionalElements[2].label === 'string', "the element without binding is assigned a label");
			assert.equal(aAdditionalElements[3].label, "Invisible Property04", "then the label is set correctly");
			assert.equal(aAdditionalElements[0].type, "invisible", "then the type is set correctly");
			assert.equal(aAdditionalElements[1].type, "invisible", "then the type is set correctly");
			assert.equal(aAdditionalElements[2].type, "invisible", "then the type is set correctly");
			assert.equal(aAdditionalElements[3].type, "invisible", "then the type is set correctly");
		});
	});

	QUnit.test("when getting unbound elements for EntityType01 Group with a function to filter ignored SmartForm Fields", function(assert) {
		var oGroup = oView.byId("GroupEntityType01");
		var oSmartForm = oView.byId("MainForm");
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel,
				filter: mAddODataPropertyAction.filter
			},
			relevantContainer: oSmartForm
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 2, "then the ignored property is not part of the additional elements");
		});
	});

	QUnit.test("when getting unbound elements with an element without model", function(assert) {
		var oGroup = new sap.ui.comp.smartform.Group();
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel,
				filter: mAddODataPropertyAction.filter
			},
			relevantContainer: mAddODataPropertyAction.relevantContainer
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 0, "then there are no ODataProperties");
		});
	});

	QUnit.test("when getting unbound elements with an element with a json model", function(assert) {
		var oGroup = new sap.ui.comp.smartform.Group();
		oGroup.setModel(new JSONModel({elements: "foo"}));
		var oActionObject = {
			action: {
				aggregation: "formElements",
				getLabel: mAddODataPropertyAction.getLabel,
				filter: mAddODataPropertyAction.filter
			},
			relevantContainer: mAddODataPropertyAction.relevantContainer
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 0, "then there are no ODataProperties");
		});
	});

	QUnit.test("when asking for the unbound elements of a simpleForm", function(assert) {
		var oSimpleForm = oView.byId("SimpleForm");

		var oActionObject = {
			action : {
				aggregation: "form",
				oRelevantContainer: mAddODataPropertyAction.relevantContainer
			}
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(oSimpleForm, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 5, "then 5 unbound elements are available");
		});
	});


	QUnit.module("Given a test view with bound Table", {
		beforeEach : function() {
			this.oTable = oView.byId("table");
			this.oColumn = this.oTable.getColumns()[0];
		}
	});

	QUnit.test("when getting unbound elements for table", function(assert) {
		var oActionObject = {
			action : {},
			relevantContainer: this.oTable
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(this.oTable, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 3, "then the correct amount of ODataProperties has been returned");
		});
	});


	QUnit.module("Given a test view with bound Empty Table", {
		beforeEach : function(assert) {
			this.oTable = oView.byId("emptyTable");
			this.oColumn = this.oTable.getColumns()[0];
		}
	});

	QUnit.test("when getting unbound elements for table", function(assert) {
		var oActionObject = {
			action : {},
			relevantContainer: this.oTable
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(this.oTable, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 4, "then the correct amount of ODataProperties has been returned");
		});
	});


	QUnit.module("Given a test view with absolute bindings", {
		beforeEach: function(assert) {
			this.oList = oView.byId("listWithAbsoluteBinding");
			this.oTable = oView.byId("tableWithAbsoluteBinding");
		}
	});

	QUnit.test("when getting unbound elements for the list", function(assert) {
		var oActionObject = {
			action : {
				aggregation: "items"
			},
			relevantContainer: this.oList
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(this.oList, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 16, "then the correct amount of ODataProperties has been returned");
		});
	});

	QUnit.test("when getting unbound elements for the table", function(assert) {
		var oActionObject = {
			action : {
				aggregation: "items"
			},
			relevantContainer: this.oTable
		};

		return AdditionalElementsAnalyzer.getUnboundODataProperties(this.oTable, oActionObject).then(function(aAdditionalElements) {
			assert.equal(aAdditionalElements.length, 16, "then the correct amount of ODataProperties has been returned");
		});
	});

	function assertElementsEqual(mActualAdditionalElement, mExpected, msg, assert) {
		assert.equal(mActualAdditionalElement.selected, mExpected.selected, msg + " -selected");
		assert.equal(mActualAdditionalElement.label, mExpected.label, msg + " -label");
		assert.equal(mActualAdditionalElement.tooltip, mExpected.tooltip, msg + " -tooltip");
		assert.equal(mActualAdditionalElement.type, mExpected.type, msg + " -type");
		assert.equal(mActualAdditionalElement.element.getId(), mExpected.elementId, msg + " -element id");
		assert.deepEqual(mActualAdditionalElement.bindingPaths, mExpected.bindingPaths, msg + " -bindingPaths");
	}

	function renderComplexView(assert) {
		var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
		oView.placeAt("test-view");
		sap.ui.getCore().applyChanges();
		return oView;
	}
});
