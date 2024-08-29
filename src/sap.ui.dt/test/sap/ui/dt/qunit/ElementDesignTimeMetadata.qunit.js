/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementUtil",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/sinon-4"
], function(
	ElementDesignTimeMetadata,
	Lib,
	ElementUtil,
	Element,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given that an ElementDesignTimeMetadata is created for a control", {
		beforeEach() {
			this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					name: {
						singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
						plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
					},
					aggregations: {
						testAggregation: {
							displayName: {
								singular: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME",
								plural: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME_PLURAL"
							},
							testField: "testValue",
							actions: {
								action1: "firstChangeType",
								action2: {
									changeType: "secondChangeType"
								},
								action3(oElement) {
									return {changeType: oElement.name};
								},
								action4(oElement, foo, bar) {
									return {changeType: oElement.name + foo + bar};
								},
								action5: {
									subAction: {
										changeType: "subChangeType"
									}
								},
								action6: {
									subAction(oElement, foo, bar) {
										return {changeType: oElement.name + foo + bar};
									}
								}
							},
							childNames: {
								singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
								plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
							},
							ignore: false
						},
						testAggregation2: {
							testField: "testValue",
							actions: {
								action1: "firstChangeType-aggregation2"
							}
						},
						testAggregation3: {
							childNames(oElement) {
								// fake 2 cases:
								// 1. childNames is a function, that returns the object
								// 2. singular and plural can be functions to handle cases with self made resource bundling
								return {
									singular() {
										// fake own resource bundle handling
										return `I18N_KEY${oElement.getText()}`;
									},
									plural() {
										// fake own resource bundle handling
										return `I18N_KEY_PLURAL${oElement.getText()}`;
									}
								};
							},
							displayName(oElement) {
								// fake 2 cases:
								// 1. displayName is a function, that returns the object
								// 2. singular and plural can be functions to handle cases with self made resource bundling
								return {
									singular() {
										// fake own resource bundle handling
										return `I18N_KEY${oElement.getText()}`;
									},
									plural() {
										// fake own resource bundle handling
										return `I18N_KEY_PLURAL${oElement.getText()}`;
									}
								};
							}
						},
						testAggregation4: {
							ignore: true
						},
						testAggregation5: {
							ignore() {
								return false;
							}
						}
					},
					associations: {
						testAssociation: {
							aggregationLike: true
						}
					},
					getStableElements(oElement) {
						return [oElement, oElement];
					}
				}
			});
		},
		afterEach() {
			this.oElementDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the ElementDesignTimeMetadata is initialized", function(assert) {
			assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("testAggregation"), true, "hasAggregations is true when aggregation data exists");
			assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("fakeAggregation"), false, "hasAggregations is false when aggregation data not exists");
			assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("testAssociation"), true, "hasAggregations is true when aggregation-like association data exists");
			assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("testAggregation").testField, "testValue", "getAggregation returns data when aggregation it exists");
			assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("fakeAggregation"), undefined, "getAggregation returns undefined when aggregation data doesn't exists");
			assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("layout").ignore, true, "getAggregation returns correct data for default aggregations");
			assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("testAssociation").aggregationLike, true, "getAggregation returns correct data for aggregation-like association");
		});

		QUnit.test("when creating aggregation dt metadata", function(assert) {
			var oAggregationDesignTimeMetadata = this.oElementDesignTimeMetadata.createAggregationDesignTimeMetadata({testData: "TestData"});
			assert.equal(oAggregationDesignTimeMetadata.getMetadata().getName(), "sap.ui.dt.AggregationDesignTimeMetadata", "then aggregation designtime metadata class is created");
		});

		QUnit.test("when getActionDataFromAggregations is called", function(assert) {
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action1"), [
				{changeType: "firstChangeType", aggregation: "testAggregation"},
				{changeType: "firstChangeType-aggregation2", aggregation: "testAggregation2"}
			], "for string action, the correct object is returned");
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action2"), [{changeType: "secondChangeType", aggregation: "testAggregation"}], "for object action, the correct object is returned");
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action3", {name: "thirdChangeType"}), [{changeType: "thirdChangeType", aggregation: "testAggregation"}], "for function action, the correct object is returned");
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action4", {name: "fourthChangeType"}, ["foo", "bar"]), [{changeType: "fourthChangeTypefoobar", aggregation: "testAggregation"}], "for function action with parameters , the correct object is returned");
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action5", {name: "subChangeType"}, ["foo", "bar"], "subAction"), [{changeType: "subChangeType", aggregation: "testAggregation"}], "when the function was called with an action, a sub-action and parameters, then the correct object is returned");
			assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action6", {name: "subChangeType"}, ["foo", "bar"], "subAction"), [{changeType: "subChangeTypefoobar", aggregation: "testAggregation"}], "for function action with a function action, a sub-action and parameters, then the correct object is returned");
		});

		QUnit.test("when getAggregationDescription is called", function(assert) {
			var oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				}),
				getText: sandbox.stub().returns("simulateElement")
			};
			var oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation", oFakeElement), {
				singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
				plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
			}, "then the translated texts are returned for static keys");
			assert.notOk(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation2", oFakeElement), "then undefined is returned missing childNames");
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation3", oFakeElement, "simulateElement"), {
				singular: "I18N_KEYsimulateElement",
				plural: "I18N_KEY_PLURALsimulateElement"
			}, "then the translated texts are returned for variable texts/keys");
		});

		QUnit.test("when getAggregationDisplayName is called", function(assert) {
			var oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				}),
				getText: sandbox.stub().returns("simulateElement")
			};
			var oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			var mExpectedDisplayNames = {
				singular: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME",
				plural: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME_PLURAL"
			};

			var mExpectedTranslatedTexts = {
				singular: "I18N_KEYsimulateElement",
				plural: "I18N_KEY_PLURALsimulateElement"
			};

			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation", oFakeElement), mExpectedDisplayNames, "then the translated texts are returned for static keys");
			assert.notOk(this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation2", oFakeElement), "then undefined is returned missing childNames");
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation3", oFakeElement, "simulateElement"), mExpectedTranslatedTexts, "then the translated texts are returned for variable texts/keys");
		});

		QUnit.test("when getText is called (with and without function)", function(assert) {
			var oElementDesignTimeMetadataWithFunction = new ElementDesignTimeMetadata({
				data: {
					name() {
						return {
							singular: "MY_FANCY_NAME",
							plural: "MY_FANCY_NAME_PLURAL"
						};
					}
				}
			});
			var oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				})
			};

			var oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			assert.deepEqual(this.oElementDesignTimeMetadata.getName(oFakeElement), {
				singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
				plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
			}, "then the translated texts are returned for static keys");

			assert.deepEqual(oElementDesignTimeMetadataWithFunction.getName(oFakeElement), {
				singular: "MY_FANCY_NAME",
				plural: "MY_FANCY_NAME_PLURAL"
			}, "then the translated texts are returned for static keys");
		});

		QUnit.test("when getLabel is called with label property available in the DesignTimeMetadata as a function", function(assert) {
			this.oElementDesignTimeMetadata.getData().getLabel = function(oElement) {
				return oElement.getId();
			};
			var oTestElement = new Element("testId");
			assert.strictEqual(this.oElementDesignTimeMetadata.getLabel(oTestElement), oTestElement.getId(), "then the correct element is received");
			oTestElement.destroy();
			delete this.oElementDesignTimeMetadata.getData().label;
		});

		QUnit.test("when getLabel is called with label property not available in the DesignTimeMetadata", function(assert) {
			var fnLabelForElementStub = sandbox.stub(ElementUtil, "getLabelForElement");
			var aMockArguments = ["testArg1", "testArg2"];
			this.oElementDesignTimeMetadata.getLabel(aMockArguments);
			assert.ok(fnLabelForElementStub.calledOnce, "then ElementUtil.getLabelForElement() called once");
			assert.ok(fnLabelForElementStub.calledWith(aMockArguments), "then ElementUtil.getLabelForElement() called with the correct arguments");
		});

		QUnit.test("when getAggregations method is called and DT Metadata has no aggregations nor associations", function(assert) {
			this.oElementDesignTimeMetadata.getData().aggregations = null;
			this.oElementDesignTimeMetadata.getData().associations = null;
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregations(), {}, "then an empty object is returned");
		});

		QUnit.test("when getStableElements method is called and DT Metadata has a getStableElements function returning valid data", function(assert) {
			var oOverlay = {
				getElement() {
					return "element";
				}
			};
			assert.deepEqual(this.oElementDesignTimeMetadata.getStableElements(oOverlay), ["element", "element"], "the function returns the value of the function");
		});

		QUnit.test("when getStableElements method is called and DT Metadata has a getStableElements function returning invalid data", function(assert) {
			var oOverlay = {
				getElement() {
					return "element";
				}
			};
			this.oElementDesignTimeMetadata.getData().getStableElements = function() {return "notAnArray";};
			assert.deepEqual(this.oElementDesignTimeMetadata.getStableElements(oOverlay), [], "the function returns an empty array");
		});

		QUnit.test("when getStableElements method is called and DT Metadata has no getStableElements function", function(assert) {
			var oOverlay = {
				getElement() {
					return "element";
				}
			};
			this.oElementDesignTimeMetadata.getData().getStableElements = undefined;
			assert.deepEqual(this.oElementDesignTimeMetadata.getStableElements(oOverlay), ["element"], "the function returns the value of the function");
		});

		QUnit.test("when getToolHooks method is called and DT Metadata has no tool object", function(assert) {
			assert.ok(typeof this.oElementDesignTimeMetadata.getToolHooks().start === "function", "the function inside the object is part of the return");
			assert.ok(typeof this.oElementDesignTimeMetadata.getToolHooks().stop === "function", "the function inside the object is part of the return");
		});

		QUnit.test("when getToolHooks method is called and DT Metadata has a tool object", function(assert) {
			var oStartSpy = sandbox.spy();
			var oStopSpy = sandbox.spy();

			this.oElementDesignTimeMetadata.setData({
				...this.oElementDesignTimeMetadata.getData(),
				tool: {
					start: oStartSpy,
					stop: oStopSpy
				}
			});
			assert.ok(typeof this.oElementDesignTimeMetadata.getToolHooks().start === "function", "the function inside the object is part of the return");
			assert.ok(typeof this.oElementDesignTimeMetadata.getToolHooks().stop === "function", "the function inside the object is part of the return");
			this.oElementDesignTimeMetadata.getToolHooks().start("arg1");
			this.oElementDesignTimeMetadata.getToolHooks().stop("arg2");
			assert.ok(oStartSpy.withArgs("arg1").calledOnce);
			assert.ok(oStopSpy.withArgs("arg2").calledOnce);
		});

		QUnit.test("when 'getScrollContainers' is called without scrollContainers defined in the metadata", function(assert) {
			assert.ok(Array.isArray(this.oElementDesignTimeMetadata.getScrollContainers()), "an array is returned");
			assert.equal(this.oElementDesignTimeMetadata.getScrollContainers().length, 0, "the array is empty");
		});

		QUnit.test("when calling isAggregationIgnored", function(assert) {
			var oElement = {foo: "bar"};
			assert.strictEqual(this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation"), false, "the aggregation is not ignored");
			assert.strictEqual(this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation2"), false, "the aggregation not is ignored");
			assert.strictEqual(this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation4"), true, "the aggregation is ignored");
			assert.strictEqual(this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation5"), false, "the aggregation is not ignored");
			assert.strictEqual(this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation6"), false, "a not existent aggregation is not ignored");
		});

		QUnit.test("when calling getAggregationNamesWithAction", function(assert) {
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationNamesWithAction("action1"), ["testAggregation", "testAggregation2"], "the action is in two aggregations");
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationNamesWithAction("action2"), ["testAggregation"], "the action is in one aggregations");
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationNamesWithAction("fooAction"), [], "the action is in no aggregations");
		});
	});

	QUnit.module("Given that an ElementDesignTimeMetadata with scrollContainers with an array for aggregations is created for a control", {
		beforeEach() {
			this.oScrollContainer = {
				domRef: "foo",
				aggregations: ["a", "b"]
			};
			this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					scrollContainers: [
						this.oScrollContainer
					]
				}
			});
		},
		afterEach() {
			this.oElementDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getScrollContainers' is called", function(assert) {
			var aScrollContainers = this.oElementDesignTimeMetadata.getScrollContainers();
			assert.equal(aScrollContainers.length, 1, "there is one scrollContainer");
			assert.deepEqual(this.oScrollContainer, aScrollContainers[0], "the scrollContainer is correctly returned");
		});
	});

	QUnit.module("Given that an ElementDesignTimeMetadata with scrollContainers with a function for aggregations is created for a control", {
		beforeEach() {
			this.oGetAggregationsStub = sandbox.stub();
			this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					scrollContainers: [
						{
							domRef: "foo",
							aggregations: this.oGetAggregationsStub
						}
					]
				}
			});
		},
		afterEach() {
			this.oElementDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getScrollContainers' is called multiple times", function(assert) {
			var fnUpdate = sandbox.stub();
			var oElement = {foo: "bar"};
			this.oGetAggregationsStub.returns(["a"]);
			var oExpectedScrollContainer = {
				domRef: "foo",
				aggregations: ["a"],
				aggregationsFunction: this.oGetAggregationsStub
			};
			var aScrollContainers = this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, fnUpdate);
			assert.strictEqual(aScrollContainers.length, 1, "there is one scrollContainer");
			assert.strictEqual(this.oGetAggregationsStub.callCount, 1, "the aggregations function was called only once");
			assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[0], oElement, "the element was passed");
			assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[1], fnUpdate, "the update function was passed");
			assert.deepEqual(aScrollContainers[0], oExpectedScrollContainer, "the scrollContainer is correctly returned");

			this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, fnUpdate);
			assert.strictEqual(this.oGetAggregationsStub.callCount, 1, "the aggregations function was not called again");

			this.oElementDesignTimeMetadata.getScrollContainers(oElement, true, fnUpdate);
			assert.strictEqual(this.oGetAggregationsStub.callCount, 2, "the aggregations function was called again");
			assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[0], oElement, "the element was passed");
			assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[1], fnUpdate, "the update function was passed");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});