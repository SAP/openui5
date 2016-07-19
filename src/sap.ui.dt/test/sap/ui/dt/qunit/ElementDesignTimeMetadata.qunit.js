jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.dt.ElementDesignTimeMetadata");

QUnit.module("Given that an ElementDesignTimeMetadata is created for a control", {
	beforeEach : function() {
		this.oElementDesignTimeMetadata = new sap.ui.dt.ElementDesignTimeMetadata({
			data : {
				aggregations : {
					testAggregation : {
						testField : "testValue"
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
});
