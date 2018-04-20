/*global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/core/Core",
	"sap/ui/dt/ElementUtil",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/sinon-4"

],function(
	ElementDesignTimeMetadata,
	Core,
	ElementUtil,
	Element,
	sinon
){
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that an ElementDesignTimeMetadata is created for a control", {
		beforeEach : function() {
			this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					name : {
						singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
						plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
					},
					aggregations : {
						testAggregation : {
							testField : "testValue",
							actions : {
								action1 : "firstChangeType",
								action2 : {
									changeType : "secondChangeType"
								},
								action3 : function(oElement) {
									return {changeType: oElement.name};
								},
								action4 : function(oElement, foo, bar) {
									return {changeType: oElement.name + foo + bar};
								}
							},
							childNames : {
								singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
								plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
							}
						},
						testAggregation2 : {
							testField : "testValue",
							actions : {
								action1 : "firstChangeType-aggregation2"
							}
						},
						testAggregation3 : {
							childNames : function(oElement){
								//fake 2 cases:
								//1. childNames is a function, that returns the object
								//2. singular and plural can be functions to handle cases with self made resource bundling
								return {
									singular : function(){
										//fake own resource bundle handling
										return "I18N_KEY" + oElement.getText();
									},
									plural :  function(){
										//fake own resource bundle handling
										return "I18N_KEY_PLURAL" + oElement.getText();
									}
								};
							}
						}
					},
					associations: {
						testAssociation: {
							aggregationLike : true
						}
					}
				}
			});
		},
		afterEach : function() {
			this.oElementDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the ElementDesignTimeMetadata is initialized", function(assert) {
		assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("testAggregation"), true, "hasAggregations is true when aggregation data exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("fakeAggregation"), false, "hasAggregations is false when aggregation data not exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.hasAggregation("testAssociation"), true, "hasAggregations is true when aggregation-like association data exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("testAggregation").testField, "testValue", "getAggregation returns data when aggregation it exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("fakeAggregation"), undefined, "getAggregation returns undefined when aggregation data doesn't exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("layout").ignore, true, "getAggregation returns correct data for default aggregations");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("testAssociation").aggregationLike, true, "getAggregation returns correct data for aggregation-like association");
	});

	QUnit.test("when creating aggregation dt metadata", function(assert){
		var oAggregationDesignTimeMetadata = this.oElementDesignTimeMetadata.createAggregationDesignTimeMetadata({testData: "TestData"});
		assert.equal(oAggregationDesignTimeMetadata.getMetadata().getName(), "sap.ui.dt.AggregationDesignTimeMetadata", "then aggregation designtime metadata class is created");
	});

	QUnit.test("when getActionDataFromAggregations is called", function(assert) {
		assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action1"), [
			{changeType : "firstChangeType", aggregation : "testAggregation"},
			{changeType : "firstChangeType-aggregation2", aggregation : "testAggregation2"}
		], "for string action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action2"), [{changeType : "secondChangeType", aggregation : "testAggregation"}], "for object action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action3", {name:"thirdChangeType"}), [{changeType : "thirdChangeType", aggregation : "testAggregation"}], "for function action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getActionDataFromAggregations("action4", {name:"fourthChangeType"}, ["foo", "bar"]), [{changeType : "fourthChangeTypefoobar", aggregation : "testAggregation"}], "for function action with parameters , the correct object is returned");
	});

	QUnit.test("when getAggregationDescription is called", function(assert) {
		var oFakeElement = {
			getMetadata : sandbox.stub().returns({
				getLibraryName : sandbox.stub().returns("fakeLibrary"),
				getParent : sandbox.stub().returns(undefined)
			}),
			getText : sandbox.stub().returns("simulateElement")
		};
		var oFakeLibBundle = {
			getText : sandbox.stub().returnsArg(0), //just return i18n keys
			hasText : sandbox.stub().returns(false)
		};
		sandbox.stub(Core,"getLibraryResourceBundle").returns(oFakeLibBundle);

		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation", oFakeElement), {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		}, "then the translated texts are returned for static keys");
		assert.notOk(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation2", oFakeElement), "then undefined is returned missing childNames");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation3", oFakeElement, "simulateElement"), {
			singular : "I18N_KEYsimulateElement",
			plural :  "I18N_KEY_PLURALsimulateElement"
		}, "then the translated texts are returned for variable texts/keys");
	});

	QUnit.test("when getText is called", function(assert) {
		var oFakeElement = {
			getMetadata : sandbox.stub().returns({
				getLibraryName : sandbox.stub().returns("fakeLibrary"),
				getParent : sandbox.stub().returns(undefined)
			})
		};

		var oFakeLibBundle = {
			getText : sandbox.stub().returnsArg(0), //just return i18n keys
			hasText : sandbox.stub().returns(false)
		};
		sandbox.stub(sap.ui.getCore(),"getLibraryResourceBundle").returns(oFakeLibBundle);

		assert.deepEqual(this.oElementDesignTimeMetadata.getName(oFakeElement), {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		}, "then the translated texts are returned for static keys");
	});

	QUnit.test("when getLabel is called with label property available in the DesignTimeMetadata as a function", function(assert) {
		this.oElementDesignTimeMetadata.getData().label = function(oElement) {
			return oElement.getId();
		};
		var oTestElement = new Element("testId");
		assert.strictEqual(this.oElementDesignTimeMetadata.getLabel(oTestElement), oTestElement.getId(), "then the correct element is received");
		oTestElement.destroy();
		delete this.oElementDesignTimeMetadata.getData().label;
	});

	QUnit.test("when getLabel is called with label property available in the DesignTimeMetadata as a string", function(assert) {
		this.oElementDesignTimeMetadata.getData().label = "testLabel";
		assert.strictEqual(this.oElementDesignTimeMetadata.getLabel(), "testLabel", "then the correct string value is received");
		delete this.oElementDesignTimeMetadata.getData().label;
	});

	QUnit.test("when getLabel is called with label property not available in the DesignTimeMetadata", function(assert) {
		var fnLabelForElementStub = sandbox.stub(ElementUtil, "getLabelForElement");
		var aMockArguments = ["testArg1", "testArg2"];
		this.oElementDesignTimeMetadata.getLabel(aMockArguments);
		assert.ok(fnLabelForElementStub.calledOnce, "then ElementUtil.getLabelForElement() called once");
		assert.ok(fnLabelForElementStub.calledWith(aMockArguments), "then ElementUtil.getLabelForElement() called with the correct arguments");
	});

	QUnit.test("when getAggregations method is called and DT Metadata has no aggregations nor associations", function(assert){
		this.oElementDesignTimeMetadata.getData().aggregations = null;
		this.oElementDesignTimeMetadata.getData().associations = null;
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregations(), {}, "then an empty object is returned");
	});

	QUnit.start();
});