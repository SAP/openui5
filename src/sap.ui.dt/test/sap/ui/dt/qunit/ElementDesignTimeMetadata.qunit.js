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
							}
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

QUnit.test("when getAggregationAction is called", function(assert) {
	assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action1"), [{changeType : "firstChangeType", aggregation : "testAggregation"}], "for string action, the correct object is returned");
	assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action2"), [{changeType : "secondChangeType", aggregation : "testAggregation"}], "for object action, the correct object is returned");
	assert.deepEqual(this.oElementDesignTimeMetadata.getAggregationAction("action3", {name:"thirdChangeType"}), [{changeType : "thirdChangeType", aggregation : "testAggregation"}], "for function action, the correct object is returned");
});
