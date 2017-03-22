/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
QUnit.config.autostart = false;

sap.ui.define([	"sap/ui/dt/AggregationDesignTimeMetadata",
				"sap/m/Button",
				"sap/m/Page",
				"sap/ui/layout/VerticalLayout"],
function(AggregationDesignTimeMetadata, Button, Page, VerticalLayout) {
	"use strict";

	QUnit.start();

	QUnit.module("Given that an AggregationDesignTimeMetadata is created for a control", {
		beforeEach : function() {
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
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
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
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
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
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
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
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

	QUnit.module("Given 'AggregationDesignTimeMetadata' with empty metadata is created", {
		beforeEach: function (assert) {
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({});

		},
		afterEach: function(){
			this.oAggregationDesignTimeMetadata.destroy();
		}
	});

	QUnit.test("when 'getRelevantContainerForPropagation' is called", function(assert) {
			assert.strictEqual(this.oAggregationDesignTimeMetadata.getRelevantContainerForPropagation(), false,
				"then 'false' should be returned");
	});

	function _createPropagationInformationObject(oElement, sInstanceOf) {
		return 	{
			propagateRelevantContainerElement: oElement,
			propagationFunction: function (oElement) {
				var sType = oElement.getMetadata().getName();
				if (sType === sInstanceOf) {
					return true;
				}
				return false;
			}
		};
	}

	QUnit.module("Given 'AggregationDesignTimeMetadata' containing multiple propagation information is created", {
		beforeEach: function (assert) {
			this.oButton1 = new Button("button1");
			this.oVerticalLayout = new VerticalLayout("layout1");
			this.oPage1 = new Page("Page1");
			this.oPage2 = new Page("Page2");

			this.mData = {
				propagateRelevantContainer: [
					_createPropagationInformationObject(this.oPage1, "sap.m.Button"),
					_createPropagationInformationObject(this.oPage2, "sap.ui.layout.VerticalLayout")
				]
			};
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
				data: this.mData
			});
		},
		afterEach: function(){
			this.oButton1.destroy();
			this.oPage1.destroy();
			this.oPage2.destroy();
			this.oVerticalLayout.destroy();
			this.oAggregationDesignTimeMetadata.destroy();
		}
	});

	QUnit.test("when 'getRelevantContainerForPropagation' is called", function(assert) {
			var oResultElement = this.oAggregationDesignTimeMetadata.getRelevantContainerForPropagation(this.oButton1);
			assert.strictEqual(oResultElement.sId, this.oPage1.sId,
				"with first corresponding element then correct 'relevantContainer' should be returned");
			oResultElement = this.oAggregationDesignTimeMetadata.getRelevantContainerForPropagation(this.oVerticalLayout);
			assert.strictEqual(oResultElement.sId, this.oPage2.sId,
				"with second corresponding element then correct 'relevantContainer' should be returned");
			oResultElement = this.oAggregationDesignTimeMetadata.getRelevantContainerForPropagation(this.oPage1);
			assert.strictEqual(oResultElement, false,
				"with NOT corresponding element then 'false' should be returned");
	});

	QUnit.module("Given 'AggregationDesignTimeMetadata' containing multiple propagation information for the same element is created", {
		beforeEach: function (assert) {
			this.oButton1 = new Button("button1");
			this.oVerticalLayout1 = new VerticalLayout("layout1");
			this.oVerticalLayout2 = new VerticalLayout("layout2");

			this.mData = {
				propagateRelevantContainer: [
					_createPropagationInformationObject(this.oVerticalLayout1, "sap.m.Button"),
					_createPropagationInformationObject(this.oVerticalLayout2, "sap.m.Button")
				]
			};
			this.oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({
				data: this.mData
			});
		},
		afterEach: function(){
			this.oButton1.destroy();
			this.oVerticalLayout1.destroy();
			this.oVerticalLayout2.destroy();
			this.oAggregationDesignTimeMetadata.destroy();
		}
	});

	QUnit.test("when 'getRelevantContainerForPropagation' is called", function(assert) {
			var oResultElement = this.oAggregationDesignTimeMetadata.getRelevantContainerForPropagation(this.oButton1);
			assert.strictEqual(oResultElement.sId, this.oVerticalLayout1.sId,
				"with first corresponding element then correct 'relevantContainer' should be returned");
	});

});

