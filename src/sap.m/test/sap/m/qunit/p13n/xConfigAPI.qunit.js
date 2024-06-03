/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/ui/core/Item",
	"sap/ui/core/util/reflection/JsControlTreeModifier"

], function (MDCControl, xConfigAPI, Item, JsControlTreeModifier) {
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
			operation: "add",
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
				}
			}, "The correct value has been created");
		}.bind(this));
	});

	QUnit.test("Check #enhanceConfig with 'persistenceIdentifier'", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key",
				persistenceIdentifier: "custom-identifier"
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
							"key": "my_unique_test_key",
							"persistenceIdentifier": "custom-identifier"
						}
					}
				}
			}, "The correct value has been created");
		}.bind(this));
	});

	QUnit.test("Check #enhanceConfig for move changes", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondMoveConfig = {
				key: "test_property_2",
				property: "position",
				operation: "move",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}, {key: "test_property_2"}],
				value: {
					index: 0,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondMoveConfig);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");
		});

	});

	QUnit.test("Check #readConfig", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
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
				}
			}, "The correct value has been created");

			return;

		});

	});

	QUnit.test("Ensure the correct order after inserting the item", function(assert){
		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondMoveConfig = {
				key: "test_property_2",
				property: "position",
				operation: "add",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}],
				value: {
					index: 0,
					value: true,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondMoveConfig);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");
		});
	});

	QUnit.test("Ensure the correct order after removing the item", function(assert){
		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondAdd = {
				key: "test_property_2",
				property: "position",
				operation: "add",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}],
				value: {
					index: 0,
					value: true,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondAdd);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");

			var oRemoveChange = {
				key: "test_property_2",
				property: "visible",
				operation: "remove",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property_2"}, {key: "test_property"}],
				value: {
					value: false,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oRemoveChange);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];
			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')),
			{
			  "aggregations": {
				"items": {
				  "test_property": {
					"position": 0
				  },
				  "test_property_2": {
					"position": 0,
					"visible": false
				  }
				}
			  }
			}, "The correct remove value has been created - removing an item needs to be reflected in the order of existing items");
		});
	});

	QUnit.test("Chckeck #getCurrentItemState (empty)", function(assert){

		return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "moveItem"}, null, "items")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [], "The correct value has been created (no item present yet)");
		});
	});

	QUnit.test("Chckeck #getCurrentItemState (with inital control state in xConfig)", function(assert){

		const oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(oConfig){
			return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "addItem"}, oConfig, "items");
		}.bind(this))
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
		});
	});

	QUnit.test("Chckeck #getCurrentItemState (with inital control state in targetAggregation)", function(assert){

		const oItem = new Item({id: "test_property"});

		this.oControl.addItem(oItem);

		sinon.stub(JsControlTreeModifier, "getProperty").returns(Promise.resolve(true)); //fake visible property, since "Item" does not have one..

		return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "removeItem"}, null, "items")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
			JsControlTreeModifier.getProperty.restore();
		});
	});

});