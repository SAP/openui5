/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.dt.AggregationDesignTimeMetadata");

QUnit.module("Given that an AggregationDesignTimeMetadata is created for a control", {
	beforeEach : function() {
		this.oAggregationDesignTimeMetadata = new sap.ui.dt.AggregationDesignTimeMetadata({
			data : {
				testField : "testValue",
				actions : {
					move : "moveElements"
				}
			}
		});
	},
	afterEach : function() {
		this.oAggregationDesignTimeMetadata.destroy();
	}
});

QUnit.test("when the AggregationDesignTimeMetadata is initialized", function(assert) {
	assert.strictEqual(this.oAggregationDesignTimeMetadata.getData().testField, "testValue", "then the field is returned right");
});


QUnit.test("when asking for move action for an aggregation", function(assert) {
	assert.strictEqual(this.oAggregationDesignTimeMetadata.getMoveAction(), "moveElements", "then move change handler type is returned");
});

QUnit.module("Given AggregationDesignTimeMetadata without an action", {
	beforeEach : function() {
		this.oAggregationDesignTimeMetadata = new sap.ui.dt.AggregationDesignTimeMetadata({
			data : {
				testField : "testValue",
			}
		});
	},
	afterEach : function() {
		this.oAggregationDesignTimeMetadata.destroy();
	}
});

QUnit.test("when asking for move action for an aggregation", function(assert) {
	assert.strictEqual(this.oAggregationDesignTimeMetadata.getMoveAction(), undefined, "then undefined is returned");
});

QUnit.module("Given AggregationDesignTimeMetadata without a move action", {
	beforeEach : function() {
		this.oAggregationDesignTimeMetadata = new sap.ui.dt.AggregationDesignTimeMetadata({
			data : {
				testField : "testValue",
				actions : {
					otherAction : "anything"
				}
			}
		});
	},
	afterEach : function() {
		this.oAggregationDesignTimeMetadata.destroy();
	}
});

QUnit.test("when asking for move action for an aggregation", function(assert) {
	assert.strictEqual(this.oAggregationDesignTimeMetadata.getMoveAction(), undefined, "then undefined is returned");
});

QUnit.module("Given AggregationDesignTimeMetadata with a move action as function", {
	beforeEach : function() {
		this.oAggregationDesignTimeMetadata = new sap.ui.dt.AggregationDesignTimeMetadata({
			data : {
				testField : "testValue",
				actions : {
					move : function(oMovedElement){
						return "otherChangeType"
					}
				}
			}
		});
	},
	afterEach : function() {
		this.oAggregationDesignTimeMetadata.destroy();
	}
});

QUnit.test("when asking for move action for an aggregation", function(assert) {
	assert.strictEqual(this.oAggregationDesignTimeMetadata.getMoveAction("hugo", "foo"), "otherChangeType", "then the function is executed");
});
