/*global QUnit*/

(function(){
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	jQuery.sap.require("sap.ui.dt.ElementDesignTimeMetadata");

	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

	QUnit.module("Given that an ElementDesignTimeMetadata is created for a control", {
		beforeEach : function() {
			this.oElementDesignTimeMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
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
			getMetadata : this.stub().returns({
				getLibraryName : this.stub().returns("fakeLibrary"),
				getParent : this.stub().returns(undefined)
			}),
			getText : this.stub().returns("simulateElement")
		};
		var oFakeLibBundle = {
			getText : this.stub().returnsArg(0), //just return i18n keys
			hasText : this.stub().returns(false)
		};
		this.stub(sap.ui.getCore(),"getLibraryResourceBundle").returns(oFakeLibBundle);

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
			getMetadata : this.stub().returns({
				getLibraryName : this.stub().returns("fakeLibrary"),
				getParent : this.stub().returns(undefined)
			})
		};

		var oFakeLibBundle = {
			getText : this.stub().returnsArg(0), //just return i18n keys
			hasText : this.stub().returns(false)
		};
		this.stub(sap.ui.getCore(),"getLibraryResourceBundle").returns(oFakeLibBundle);

		assert.deepEqual(this.oElementDesignTimeMetadata.getName(oFakeElement), {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		}, "then the translated texts are returned for static keys");
	});

	QUnit.test("when getAggregations method is called and DT Metadata has no aggregations nor associations", function(assert){
		this.oElementDesignTimeMetadata.getData().aggregations = null;
		this.oElementDesignTimeMetadata.getData().associations = null;
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregations(), {}, "then an empty object is returned");
	});

})();