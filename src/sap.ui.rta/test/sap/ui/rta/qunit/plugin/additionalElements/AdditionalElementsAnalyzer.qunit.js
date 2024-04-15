/* global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/comp/designtime/smartfield/SmartField.designtime",
	"./TestUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	AdditionalElementsAnalyzer,
	BindingsExtractor,
	DesignTime,
	DelegateMediatorAPI,
	SmartFieldDesignTime,
	TestUtils,
	nextUIUpdate
) {
	"use strict";

	function registerTestOverlaysWithRelevantContainer(oElement) {
		return new Promise(function(resolve) {
			this.oDesignTime = new DesignTime({
				rootElements: [oElement]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				resolve();
			});
		}.bind(this));
	}

	QUnit.module("Given a test view", TestUtils.commonHooks(), function() {
		[true, false].forEach(function(bUseDepthOfRelevantBindings) {
			let sName = "checks if navigation and absolute binding work (form example)";
			if (bUseDepthOfRelevantBindings) {
				sName += " with depthOfRelevantBindings";
			}
			QUnit.test(sName, async function(assert) {
				const oGroupElement1 = this.oView.byId("EntityType02.NavigationProperty"); // With correct navigation binding
				const oGroupElement2 = this.oView.byId("EntityType02.IncorrectNavigationProperty"); // With incorrect navigation binding
				const oGroupElement3 = this.oView.byId("EntityType02.AbsoluteBinding"); // Absolute binding
				const oGroupElement4 = this.oView.byId("EntityType02.technicalInvisibleProp"); // UI.Hidden Annotation binding
				await nextUIUpdate();
				const oGroup = oGroupElement4.getParent();
				await registerTestOverlaysWithRelevantContainer.call(this, oGroup);
				const oActionsObject = {
					aggregation: "formElements",
					reveal: {
						elements: [{
							element: oGroupElement1,
							action: {depthOfRelevantBindings: bUseDepthOfRelevantBindings ? 0 : null}
						}, {
							element: oGroupElement2,
							action: {depthOfRelevantBindings: bUseDepthOfRelevantBindings ? 0 : null}
						}, {
							element: oGroupElement3,
							action: {depthOfRelevantBindings: bUseDepthOfRelevantBindings ? 0 : null}
						}, {
							element: oGroupElement4,
							action: {depthOfRelevantBindings: bUseDepthOfRelevantBindings ? 0 : null}
						}]
					},
					addViaDelegate: {
						delegateInfo: {
							delegate: this.oDelegate
						}
					}
				};
				const aAdditionalElements = await AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject);
				if (!bUseDepthOfRelevantBindings) {
					// We expect only one element to be returned with a correct navigation property
					assert.deepEqual(
						aAdditionalElements.length, 2,
						"then there are 2 additional Elements available"
					);
					assert.deepEqual(
						aAdditionalElements[0].label, oGroupElement1.getLabelText(),
						"the element with correct navigation binding should be in the list"
					);
					assert.deepEqual(
						aAdditionalElements[0].tooltip, oGroupElement1.getLabelText(),
						"the label is used as tooltip for elements with navigation binding"
					);
					assert.deepEqual(
						aAdditionalElements[1].label, oGroupElement3.getLabelText(),
						"the element with absolute binding should be in the list"
					);
					assert.deepEqual(
						aAdditionalElements[1].tooltip, oGroupElement3.getLabelText(),
						"the label is used as tooltip for elements with absolute binding"
					);
				} else {
					assert.deepEqual(
						aAdditionalElements.length, 4,
						"then there are 4 additional Elements available"
					);
				}
				this.oDesignTime.destroy();
			});
		});

		QUnit.test("checks if navigation and absolute binding work (object page layout example)", async function(assert) {
			var oSection1 = this.oView.byId("ObjectPageSectionWithForm");
			var oSection2 = this.oView.byId("DelegateObjectPageSectionWithForm");
			var oSection3 = this.oView.byId("ObjectPageSectionAbsoluteBindingList");
			await nextUIUpdate();
			var oElementWithHideFromRevealProperty = this.oView.byId("EntityType01.technicalInvisibleProp");
			return registerTestOverlaysWithRelevantContainer.call(this, oElementWithHideFromRevealProperty)
			.then(function() {
				var oActionsObject = {
					aggregation: "sections",
					reveal: {
						elements: [{
							element: oSection1,
							action: {} // nothing relevant for the analyzer tests
						}, {
							element: oSection2,
							action: {} // nothing relevant for the analyzer tests
						}, {
							element: oSection3,
							action: {} // nothing relevant for the analyzer tests
						}]
					},
					addViaDelegate: {
						delegateInfo: {
							delegate: this.oDelegate
						}
					}
				};
				return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSection1.getParent(), oActionsObject).then(function(aAdditionalElements) {
					// We expect only two elements to be returned with a correct navigation property
					assert.equal(aAdditionalElements.length, 2, "then there are 2 additional Elements available");
					assert.equal(aAdditionalElements[0].label, oSection1.getTitle(), "the element with correct navigation binding should be in the list");
					assert.equal(aAdditionalElements[0].tooltip, oSection1.getTitle(), "the label is used as tooltip for elements with navigation binding");
					assert.equal(aAdditionalElements[1].label, oSection2.getTitle(), "the element with absolute binding should be in the list");
					assert.equal(aAdditionalElements[1].tooltip, oSection2.getTitle(), "the label is used as tooltip for elements with absolute binding");
				});
			}.bind(this))
			.then(function() {
				this.oDesignTime.destroy();
			}.bind(this));
		});

		QUnit.test("skip adding oData information if AddViaDelegate is not available", async function(assert) {
			var oSection1 = this.oView.byId("ObjectPageSectionForNavigation");

			await nextUIUpdate();
			return registerTestOverlaysWithRelevantContainer.call(this, oSection1)
			.then(function() {
				var oActionsObject = {
					aggregation: "sections",
					reveal: {
						elements: [{
							element: oSection1,
							action: {} // nothing relevant for the analyzer tests
						}]
					}
				};
				return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSection1.getParent(), oActionsObject).then(function(aAdditionalElements) {
					assert.notOk(aAdditionalElements[0].originalLabel, "the section does not have an original label");
				});
			})
			.then(function() {
				this.oDesignTime.destroy();
			}.bind(this));
		});

		QUnit.test("checks if navigation and absolute binding work with delegate", async function(assert) {
			var oGroupElement1 = this.oView.byId("DelegateEntityType02.NavigationProperty"); // With correct navigation binding
			var oGroupElement2 = this.oView.byId("DelegateEntityType02.IncorrectNavigationProperty"); // With incorrect navigation binding
			var oGroupElement3 = this.oView.byId("DelegateEntityType02.AbsoluteBinding"); // Absolute binding
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // nothing relevant for the analyzer tests
					}, {
						element: oGroupElement2,
						action: {} // nothing relevant for the analyzer tests
					}, {
						element: oGroupElement3,
						action: {} // nothing relevant for the analyzer tests
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject).then(function(aAdditionalElements) {
				// We expect only one element to be returned with a correct navigation property
				assert.equal(aAdditionalElements.length, 2, "then there are 2 additional Elements available");
				assert.equal(aAdditionalElements[0].label, oGroupElement1.getLabel(), "the element with correct navigation binding should be in the list");
				assert.equal(aAdditionalElements[0].tooltip, oGroupElement1.getLabel(), "the label is used as tooltip for elements with navigation binding");
				assert.equal(aAdditionalElements[1].label, oGroupElement3.getLabel(), "the element with absolute binding should be in the list");
				assert.equal(aAdditionalElements[1].tooltip, oGroupElement3.getLabel(), "the label is used as tooltip for elements with absolute binding");
			});
		});

		QUnit.test("check the label of an invisible field that should come from OData", function(assert) {
			var fnDone = assert.async();
			var oGroupElement1 = this.oView.byId("EntityType01.CommonProperty");
			var oSmartField = oGroupElement1.getFields()[0];
			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // nothing relevant for the analyzer tests
					}]
				}
			};

			// Because "start" is not part of a promise chain, we need to use setTimeout to wait for its execution
			setTimeout(function() {
				AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject)
				.then(function(aAdditionalElements) {
					assert.equal(aAdditionalElements[0].label, oGroupElement1.getDataSourceLabel(), "the displayed label is the data source label");
					fnDone();
				});
			});

			// The method inside the "start" property is where the label is retrieved from oData (SmartField.designtime.js)
			SmartFieldDesignTime.tool.start(oSmartField);
		});

		QUnit.test("when asking for the invisible sections of an object page layout", function(assert) {
			var oObjectPageLayout = this.oView.byId("ObjectPageLayout");

			var oActionsObject = {
				aggregation: "sections",
				reveal: {
					elements: [
						{
							element: this.oView.byId("idMain1--ObjectPageSectionInvisible"),
							action: {} // not relevant for test
						}, {
							element: this.oView.byId("idMain1--ObjectPageSectionStashed1"),
							action: {} // not relevant for test
						},
						{
							element: this.oView.byId("idMain1--ObjectPageSectionStashed2"),
							action: {} // not relevant for test
						},
						{
							element: this.oView.byId("idMain1--ObjectPageSectionForNavigationWithoutOtherGroup"),
							action: {} // not relevant for test
						}
					]
				}
			};
			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oObjectPageLayout, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 4, "then 4 additional sections are available");
				TestUtils.assertElementsEqual(aAdditionalElements[0], {
					selected: false,
					label: "Invisible ObjectPage Section",
					tooltip: "Invisible ObjectPage Section",
					type: "invisible",
					elementId: "idMain1--ObjectPageSectionInvisible",
					bindingPath: undefined
				}, "the invisible section is found", assert);
				TestUtils.assertElementsEqual(aAdditionalElements[1], {
					selected: false,
					label: "Stashed ObjectPage Section 1",
					tooltip: "Stashed ObjectPage Section 1",
					type: "invisible",
					elementId: "idMain1--ObjectPageSectionStashed1",
					bindingPath: undefined
				}, "the 1. stashed section is found", assert);
				TestUtils.assertElementsEqual(aAdditionalElements[2], {
					selected: false,
					label: "Stashed ObjectPage Section 2",
					tooltip: "Stashed ObjectPage Section 2",
					type: "invisible",
					elementId: "idMain1--ObjectPageSectionStashed2",
					bindingPath: undefined
				}, "the 2. stashed section is found", assert);
				TestUtils.assertElementsEqual(aAdditionalElements[3], {
					selected: false,
					label: "Object Page Section with only Form bound to navigation properties",
					tooltip: "Object Page Section with only Form bound to navigation properties",
					type: "invisible",
					elementId: "idMain1--ObjectPageSectionForNavigationWithoutOtherGroup",
					bindingPath: undefined
				}, "the section with only navigation properties is found", assert);
			});
		});

		[true, false].forEach(function(bRelevantContainer) {
			var sMessage = "when getting unrepresented elements from delegate for EntityType01 Group";
			if (bRelevantContainer) {
				sMessage += "without a relevant container";
			}
			QUnit.test(sMessage, function(assert) {
				var oGroup = this.oView.byId("DelegateGroupEntityType01");
				var mActionObject = {
					action: {
						aggregation: "formElements",
						getLabel: this.mAddViaDelegateAction.getLabel
					},
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				};
				if (bRelevantContainer) {
					mActionObject.relevantContainer = this.mAddViaDelegateAction.relevantContainer;
				}

				return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
					assert.equal(aAdditionalElements.length, 5, "then 5 additional properties are available");
					assert.deepEqual(aAdditionalElements[0], {
						selected: false,
						label: "Entity1-Property06-Unbound",
						tooltip: "Unbound Property6",
						type: "delegate",
						entityType: "EntityType01",
						name: "Property06",
						bindingPath: "Property06",
						originalLabel: "",
						duplicateName: false,
						parentPropertyName: ""
					}, "the unbound property is found");
					assert.deepEqual(aAdditionalElements[1], {
						selected: false,
						label: "Entity1-Property07-ignored-unbound", // available, because there is no ignore filtering implemented
						tooltip: "Unbound Property7",
						type: "delegate",
						entityType: "EntityType01",
						name: "Property07",
						bindingPath: "Property07",
						originalLabel: "",
						duplicateName: false,
						parentPropertyName: ""
					}, "the 2nd unbound property is found");
					assert.deepEqual(aAdditionalElements[2], {
						selected: false,
						label: "Property08",
						tooltip: "Property without sap:label",
						type: "delegate",
						entityType: "EntityType01",
						name: "Property08",
						bindingPath: "Property08",
						originalLabel: "",
						duplicateName: false,
						parentPropertyName: ""
					}, "the 3rd unbound property without sap:label is returned with technical name as label");
					assert.deepEqual(aAdditionalElements[3], {
						selected: false,
						label: "Property10b - name starting like Property10",
						tooltip: "Revealable property with name starting like hidden property name",
						type: "delegate",
						entityType: "EntityType01",
						name: "Property10b",
						bindingPath: "Property10b",
						originalLabel: "",
						duplicateName: false,
						parentPropertyName: ""
					}, "the 4th unbound property is found");
					assert.deepEqual(aAdditionalElements[4], {
						selected: false,
						label: "Property11 - visible via Field Control",
						tooltip: "Property with FieldControl",
						type: "delegate",
						entityType: "EntityType01",
						name: "Property11-visible-via-Field-Control",
						bindingPath: "Property11-visible-via-Field-Control",
						originalLabel: "",
						duplicateName: false,
						parentPropertyName: ""
					}, "the 5th unbound property is found");
				});
			});
		});

		QUnit.test("when getting unrepresented elements from delegate for EntityType02 with complex properties and field control properties", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType02");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddViaDelegateAction.getLabel
				},
				delegateInfo: {
					payload: {},
					delegate: this.oDelegate
				},
				relevantContainer: this.mAddViaDelegateAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 10, "then 10 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected: false,
					label: "Entity2-Property01-Label",
					tooltip: "Entity2-Property01-QuickInfo",
					type: "delegate",
					entityType: "EntityType02",
					name: "EntityType02_Property01",
					bindingPath: "EntityType02_Property01",
					originalLabel: "",
					duplicateName: false,
					parentPropertyName: ""
				}, "the unbound normal property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected: false,
					label: "ComplexProperty 03",
					tooltip: "ComplexProperty 03-QuickInfo",
					type: "delegate",
					entityType: "EntityType02",
					name: "ComplexProperty03",
					bindingPath: "EntityType02_Complex/ComplexProperty03",
					originalLabel: "",
					duplicateName: true,
					parentPropertyName: "EntityType02_Complex"
				}, "the unbound complex property is found");
				assert.deepEqual(aAdditionalElements[2], {
					selected: false,
					label: "ComplexProperty 01",
					tooltip: "ComplexProperty 01-QuickInfo",
					type: "delegate",
					entityType: "EntityType02",
					name: "ComplexProperty01",
					bindingPath: "EntityType02_SameComplexType/ComplexProperty01",
					originalLabel: "",
					duplicateName: true,
					parentPropertyName: "Same Complex Type Property with label"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[3].bindingPath, "EntityType02_SameComplexType/ComplexProperty02");
				assert.equal(aAdditionalElements[4].bindingPath, "EntityType02_SameComplexType/ComplexProperty03");
				assert.equal(aAdditionalElements[5].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty01");
				assert.equal(aAdditionalElements[6].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty02");
				assert.equal(aAdditionalElements[7].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty03");
				assert.deepEqual(aAdditionalElements[8], {
					selected: false,
					label: "ComplexProperty 05",
					tooltip: "ComplexProperty 05-QuickInfo",
					type: "delegate",
					entityType: "EntityType02",
					name: "ComplexProperty05",
					bindingPath: "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty05",
					originalLabel: "",
					duplicateName: false,
					parentPropertyName: "EntityType02_OtherComplexTypeSameComplexProperties"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[9].bindingPath, "EntityType02_Property07_with_implicit_nav");
			});
		});

		QUnit.test("when checking group elements to find original label in add dialog, after renaming custom label and removing group elements", async function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = this.oView.byId("ComplexBindingCase");
			oGroupElement1.setLabel("Renamed Label");
			oGroupElement1.setVisible(false);
			var oGroupElement2 = this.oView.byId("EntityType02.CompProp1");
			oGroupElement2.setVisible(false);
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // nothing relevant for the analyzer test
					}, {
						element: oGroupElement2,
						action: {} // nothing relevant for the analyzer test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
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

		QUnit.test("when getting invisible elements of a bound group containing a removed field with absolute binding pointing to another entity", async function(assert) {
			var oGroup = this.oView.byId("OtherGroup");
			var oGroupElement1 = this.oView.byId("NavForm.EntityType01.Prop1");
			oGroupElement1.setVisible(false);
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
			});
		});

		QUnit.test("when an invisible element has a feature control binding", async function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement = this.oView.byId("EntityType01.Prop11");

			// Simulate that the field control property is returned after the regular value property
			var oDelegateMediatorStub = this.sandbox.stub(DelegateMediatorAPI, "getDelegateForControl");
			function getDelegateForControl(...aArgs) {
				return oDelegateMediatorStub.wrappedMethod.apply(this, aArgs)
				.then(function(oDelegateInfo) {
					var fnGetPropertyInfo = oDelegateInfo.instance.getPropertyInfo;
					oDelegateInfo.instance.getPropertyInfo = function(...aArgs) {
						return fnGetPropertyInfo.apply(this, aArgs)
						.then(function(aProperties) {
							return aProperties.concat({
								name: "UxFcThatMakeFieldVisible",
								bindingPath: "UxFcThatMakeFieldVisible",
								entityType: "EntityType01",
								label: "UI Field Control",
								tooltip: "UI Field Control Byte (Should be defined centrally)",
								hideFromReveal: true,
								unsupported: true
							});
						});
					};
					return oDelegateInfo;
				});
			}
			oDelegateMediatorStub.callsFake(getDelegateForControl);

			oGroupElement.setVisible(false);
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement,
						action: {} // not relevant for test
					}]
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement)), "then the field is available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing an invisible field that is a deleted custom field", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement1 = this.oView.byId("EntityType01.Prop9");
			var oGroupElement2 = this.oView.byId("EntityType01.Prop10"); // deleted custom field

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}, {
						element: oGroupElement2,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement2)), "then the field2 is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing an invisible field with field control hiding it as well", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = this.oView.byId("EntityType02.Property04.DynamicallyInvisibleByFieldControl");

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field2 is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group with delegate containing an invisible field with bindings inside belonging to the same context", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var oGroupElement1 = this.oView.byId("DelegateEntityType01.Prop9");
			var oGroupElement2 = this.oView.byId("DelegateEntityType01.Prop10"); // deleted custom field

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}, {
						element: oGroupElement2,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement2)), "then the field2 is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing a removed field with bindings in another binding context", async function(assert) {
			var oGroup = this.oView.byId("OtherGroup");
			var oGroupElement1 = this.oView.byId("NavForm.EntityType01.Prop1");
			oGroupElement1.setVisible(false);
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			this.sandbox.stub(oGroup, "getBindingContext").returns({ getPath() { return "/fake/binding/path/group"; }});
			this.sandbox.stub(oGroupElement1, "getBindingContext").returns({ getPath() { return "/fake/binding/path/groupElement1"; }});
			this.sandbox.stub(BindingsExtractor, "getBindings").returns(["fakeBinding"]);

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing a field with the same property name as the one of an invisible field in a different entity", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement1 = this.oView.byId("EntityType02.CommonProperty");

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the other field is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group with delegate containing a field with the same property name as the one of an invisible field in a different entity", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var oGroupElement1 = this.oView.byId("DelegateEntityType02.CommonProperty");

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					action: {}, // not relevant for test,
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the other field is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group with delegate containing a field with name starting with the same property name as a technically hidden field", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			// Property10 is technically invisible (UI.hidden annotation), but Property10b is not
			var oGroupElement1 = this.oView.byId("EntityType01.Property10b");

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					action: {}, // not relevant for test,
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
			});
		});

		QUnit.test("when renaming a smart element", async function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = oGroup.getGroupElements()[3];
			oGroupElement1.setVisible(false);
			oGroupElement1.setLabel("RenamedLabel");
			// ComplexType binding element
			var oGroupElement2 = oGroup.getGroupElements()[0];
			oGroupElement2.setVisible(false);
			oGroupElement2.getLabelControl().setText("RenamedLabel");
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}, {
						element: oGroupElement2,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
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
			var oSimpleForm = this.oView.byId("SimpleForm");
			var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer) {
				return aAllFormElements.concat(oFormContainer.getFormElements());
			}, []).filter(function(oFormElement) {
				return oFormElement.isVisible() === false;
			}).map(function(oFormElement) {
				return {
					element: oFormElement,
					action: {} // not relevant for test
				};
			});

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: aFormElements
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSimpleForm, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 4, "then the 3 invisible elements with oData + the element without binding are returned");
				assert.equal(aAdditionalElements[0].label, "Invisible 1", "then the label is set correctly");
				assert.equal(aAdditionalElements[1].label, "Complex Invisible oData Property", "then the label is set correctly");
				assert.ok(typeof aAdditionalElements[2].label === "string", "the element without binding is assigned a label");
				assert.equal(aAdditionalElements[3].label, "Invisible Property04", "then the label is set correctly");
				assert.equal(aAdditionalElements[0].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[1].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[2].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[3].type, "invisible", "then the type is set correctly");
			});
		});

		QUnit.test("when getting a property that has a bound field control property hidden by annotation", async function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = oGroup.getGroupElements()[14];
			oGroupElement1.setVisible(false);
			await nextUIUpdate();

			var oActionsObject = {
				aggregation: "formElements",
				reveal: {
					elements: [{
						element: oGroupElement1,
						action: {} // not relevant for test
					}]
				},
				addViaDelegate: {
					delegateInfo: {
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 1, "then there is 1 additional Element available");
				assert.equal(aAdditionalElements[0].label, "Field with property bound to control field", "the property is found");
			});
		});

		QUnit.test("when getting the available columns on a table with template where 3 of the 6 properties are already visible", function(assert) {
			var oTable = this.oView.byId("table");

			var mAddViaDelegateAction = {
				action: {
					aggregation: "items",
					getLabel() {
						return "testLabel";
					}
				},
				delegateInfo: {
					payload: {},
					delegate: this.oDelegate
				}
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oTable, mAddViaDelegateAction).then(function(aAdditionalElements) {
				assert.strictEqual(aAdditionalElements.length, 3, "then there are 3 additional columns available");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
