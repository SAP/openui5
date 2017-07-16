/*global QUnit,sinon*/

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
				libraryName : "fake.lib",
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
										return "I18N_KEY" + oElement;
									},
									plural :  function(){
										//fake own resource bundle handling
										return "I18N_KEY_PLURAL" + oElement;
									}
								};
							}
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
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("testAggregation").testField, "testValue", "getAggregation returns data when aggregation it exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("fakeAggregation"), undefined, "getAggregation returns undefined when aggregation data doesn't exists");
		assert.strictEqual(this.oElementDesignTimeMetadata.getAggregation("layout").ignore, true, "getAggregation returns correct data for default aggregations");
	});

	QUnit.test("when asked for aggregation dt metadata", function(assert){
		var oAggregationDesignTimeMetadata = this.oElementDesignTimeMetadata.createAggregationDesignTimeMetadata("testAggregation");
		assert.equal(oAggregationDesignTimeMetadata.getMetadata().getName(), "sap.ui.dt.AggregationDesignTimeMetadata", "then aggregation designtime metadata class is created");
		assert.equal(oAggregationDesignTimeMetadata.getLibraryName(), "fake.lib", "then the elements libraryName is passed to the AggregationDesignTimeMetadata");
	});

	QUnit.test("when asked for getRelevantContainer without function in ElementDesignTimeMetadata", function(assert) {
		var oControl = new sap.ui.core.Control();
		var stubControl = sinon.stub(oControl, "getParent");
		this.oElementDesignTimeMetadata.getRelevantContainer(oControl);
		stubControl.restore();
		sinon.assert.calledOnce(stubControl);
	});

	QUnit.test("when asked for getRelevantContainer with function in ElementDesignTimeMetadata", function(assert) {
		var fnStubRelvantContainer = sinon.stub();
		var oElementDesignTimeMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
			data : {
				getRelevantContainer : fnStubRelvantContainer
			}
		});

		var oControl = new sap.ui.core.Control();
		oElementDesignTimeMetadata.getRelevantContainer(oControl);

		sinon.assert.calledWith(fnStubRelvantContainer, oControl);

		oElementDesignTimeMetadata.destroy();
	});

	//TODO: Remove when DTMetadata propagation is finalized
	QUnit.test("when getAggregationAction is called", function(assert) {
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action1"), [
			{changeType : "firstChangeType", aggregation : "testAggregation"},
			{changeType : "firstChangeType-aggregation2", aggregation : "testAggregation2"}
		], "for string action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action2"), [{changeType : "secondChangeType", aggregation : "testAggregation"}], "for object action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action3", {name:"thirdChangeType"}), [{changeType : "thirdChangeType", aggregation : "testAggregation"}], "for function action, the correct object is returned");
	});

	//TODO: Remove when DTMetadata propagation is finalized
	QUnit.test("when getAggregationAction is called", function(assert) {
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action1"), [
			{changeType : "firstChangeType", aggregation : "testAggregation"},
			{changeType : "firstChangeType-aggregation2", aggregation : "testAggregation2"}
		], "for string action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action2"), [{changeType : "secondChangeType", aggregation : "testAggregation"}], "for object action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action3", {name:"thirdChangeType"}), [{changeType : "thirdChangeType", aggregation : "testAggregation"}], "for function action, the correct object is returned");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action4", {name:"fourthChangeType"}, ["foo", "bar"]), [{changeType : "fourthChangeTypefoobar", aggregation : "testAggregation"}], "for function action with parameters , the correct object is returned");
	});

	QUnit.test("when getAggregationText is called", function(assert) {
		var oFakeLibBundle = {
			getText : this.stub().returnsArg(0) //just return i18n keys
		};
		this.stub(sap.ui.getCore(),"getLibraryResourceBundle").returns(oFakeLibBundle);

		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation"), {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		}, "then the translated texts are returned for static keys");
		assert.notOk(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation2"), "then undefined is returned missing childNames");
		assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation3", "simulateElement"), {
			singular : "I18N_KEYsimulateElement",
			plural :  "I18N_KEY_PLURALsimulateElement"
		}, "then the translated texts are returned for variable texts/keys");
	});

	QUnit.test("when getText is called", function(assert) {
		var oFakeLibBundle = {
			getText : this.stub().returnsArg(0) //just return i18n keys
		};
		this.stub(sap.ui.getCore(),"getLibraryResourceBundle").returns(oFakeLibBundle);

		assert.deepEqual(this.oElementDesignTimeMetadata.getName(), {
			singular : "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural :  "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		}, "then the translated texts are returned for static keys");
	});

})();