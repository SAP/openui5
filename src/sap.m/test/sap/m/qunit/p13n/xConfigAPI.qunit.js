/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/modules/xConfigAPI"
], function (MDCControl, xConfigAPI) {
	"use strict";

	QUnit.module("API Tests", {
		beforeEach: function() {

			var TestClass = MDCControl.extend("testClass", {
				metadata: {
					aggregations: {
						items: {
							type: "sap.ui.core.Item"
						}
					}
				}
			});

			this.oControl = new TestClass();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});


	QUnit.test("Check #enhanceConfig", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(){

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"key": "my_unique_test_key"
						}
					}
				},
                "properties": {}
			}, "The correct value has been created");
		}.bind(this));

	});

	QUnit.test("Check #readConfig", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(){
			return  xConfigAPI.readConfig(this.oControl);
		}.bind(this))
		.then(function(oXConfig){

			assert.deepEqual(oXConfig, {
				"aggregations": {
					"items": {
						"test_property": {
							"key": "my_unique_test_key"
						}
					}
				},
                "properties": {}
			}, "The correct value has been created");

			return;

		});

	});

});
