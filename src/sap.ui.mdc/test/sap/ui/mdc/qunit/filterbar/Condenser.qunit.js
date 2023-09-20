/* global */
sap.ui.define([
	"sap/ui/model/type/String",
    "sap/ui/rta/enablement/elementActionTest"
], function(StringType, elementActionTest) {
    'use strict';


	function buildXML(sFilterConditions) {

		const sPropertyInfo = '[\\{"name":"prop2", "label":"Prop2", "dataType":"sap.ui.model.type.String", "maxConditions":1\\}, \\{"name":"prop3", "label":"Prop3", "dataType":"sap.ui.model.type.String", "maxConditions":-1\\},' +
							 '\\{"name":"prop4", "label":"Prop4", "dataType":"sap.ui.model.type.String", "maxConditions":1\\}, \\{"name":"prop5", "label":"Prop5", "dataType":"sap.ui.model.type.String", "maxConditions":-1\\}]';
		const sDelegate = '\\{"name": "sap/ui/mdc/qunit/filterbar/sample/FilterBarTest.delegate", "payload": \\{\\}\\}';

		const b = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc">' +
		'<mdc:FilterBar id="myFilterBar" p13nMode="Value" delegate=\'' +  sDelegate + '\' filterConditions="' + sFilterConditions + '" propertyInfo=\'' + sPropertyInfo + '\'>' +
		'<mdc:filterItems>' +
		'<mdc:FilterField id="myFilterBar--prop2" conditions="{$filters>/conditions/prop2}" propertyKey="prop2" maxConditions="1"  dataType="sap.ui.model.type.String"/>' +
		'<mdc:FilterField id="myFilterBar--prop3"  conditions="{$filters>/conditions/prop3}" propertyKey="prop3" maxConditions="-1" dataType="sap.ui.model.type.String"/>' +
		'</mdc:filterItems>' +
		'</mdc:FilterBar>' +
		'</mvc:View>';

		return b;
	}

	function fnConfirm(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);
	}

	// -------------------------------------

	function fnOnAfterAction(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);
		if (oFB.getMetadata) {
			assert.deepEqual(oFB.getInternalConditions(), {}, "expected inner conditions found");
		}
	}

	elementActionTest("Checking the condition condensing. No changes expected.", {
		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeCondition",
					content: {
						name: "prop2",
						condition: {
							operator: "EQ",
							values: ['102'],
							validated: "Validated",
							payload: {}
						}
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addCondition",
					content: {
						name: "prop2",
						condition: {
							operator: "EQ",
							values: ['102'],
							validated: "Validated",
							payload: {}
						}
					}
				};
			}
		}],
		changesAfterCondensing: 0,
		afterAction: fnOnAfterAction,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });

	// -------------------------------------

	function fnOnAfterAction2(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);

		if (oFB.getMetadata) {
			assert.deepEqual(oFB.getInternalConditions(), {prop2: [{operator: "EQ", isEmpty: false, validated: "Validated", values: ["102"]}]}, "expected inner conditions found");
		}
	}


	elementActionTest("Checking the condition condensing. One removeCondition and one addCondition expected.", {

		xmlView: buildXML("\{'prop2':[\{'operator':'EQ','values':['101']\}]\}"),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addCondition",
					content: {
						name: "prop2",
						condition: {
							operator: "EQ",
							values: ['102'],
							validated: "Validated"
						}
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeCondition",
					content: {
						name: "prop2",
						condition: {
							operator: "EQ",
							values: ['101'],
							validated: "Validated"
						}
					}
				};
			}
		}],
		changesAfterCondensing: 2, // OPTIONAL
		afterAction: fnOnAfterAction2,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });


	// -------------------------------------

	function fnOnAfterAction3(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);

		if (oFB.getMetadata) {
			assert.deepEqual(oFB.getInternalConditions(), {prop3: [{operator: "EQ", isEmpty: false, validated: "Validated", values: ["101"]}, {operator: "EQ", isEmpty: false, validated: "Validated", values: ["103"]}]}, "expected inner conditions found");
		}
	}


	elementActionTest("Checking the condition condensing. Two addConditions changes expected", {

		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeCondition",
					content: {
						name: "prop3",
						condition: {
							operator: "EQ",
							values: ['102'],
							validated: "Validated"
						}
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addCondition",
					content: {
						name: "prop3",
						condition: {
							operator: "EQ",
							values: ['101'],
							validated: "Validated"
						}
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addCondition",
					content: {
						name: "prop3",
						condition: {
							operator: "EQ",
							values: ['102'],
							validated: "Validated"
						}
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addCondition",
					content: {
						name: "prop3",
						condition: {
							operator: "EQ",
							values: ['103'],
							validated: "Validated"
						}
					}
				};
			}
		}],
		changesAfterCondensing: 2,
		afterAction: fnOnAfterAction3,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });

	// -------------------------------------

	function fnOnAfterActionAddRemoveItem(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);

		if (oFB.getMetadata) {
			assert.deepEqual(oFB.getFilterItems().length, 2, "expected items found");
			assert.deepEqual(oFB.getFilterItems()[0].getPropertyKey(), "prop2", "expected item at index 0 found");
			assert.deepEqual(oFB.getFilterItems()[1].getPropertyKey(), "prop3", "expected item at index 1 found");
		}
	}

	elementActionTest("Checking the add/remove filter condensing. No changes expected.", {
		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		}],
		changesAfterCondensing: 0,
		afterAction: fnOnAfterActionAddRemoveItem,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });


	elementActionTest("Checking the add/move/remove filter condensing. No changes expected.", {
		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "moveFilter",
					content: {
						name: "prop5",
						index: 1
					}
				};
			}
		}],
		changesAfterCondensing: 0,
		afterAction: fnOnAfterActionAddRemoveItem,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });


	// -------------------------------------

	function fnOnAfterActionAddAddRemoveItem(oUiComponent, oViewAfterAction, assert) {
		const oFB = oViewAfterAction.byId("myFilterBar");
		assert.ok(oFB);

		if (oFB.getMetadata) {
			assert.deepEqual(oFB.getFilterItems().length, 3, "expected items found");
			assert.deepEqual(oFB.getFilterItems()[0].getPropertyKey(), "prop2", "expected item at index 0 found");
			assert.deepEqual(oFB.getFilterItems()[1].getPropertyKey(), "prop6", "expected item at index 1 found");
			assert.deepEqual(oFB.getFilterItems()[2].getPropertyKey(), "prop3", "expected item at index 2 found");
		}
	}

	elementActionTest("Checking the add/add//move/move/remove filter condensing. One addFilter change with new index expected.", {
		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "removeFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addFilter",
					content: {
						name: "prop5",
						index: 2
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "addFilter",
					content: {
						name: "prop6",
						index: 2
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "moveFilter",
					content: {
						name: "prop5",
						index: 1
					}
				};
			}
		},{
			name: "settings",
			controlId: "myFilterBar",
			parameter: function () {
				return {
					changeType: "moveFilter",
					content: {
						name: "prop6",
						index: 1
					}
				};
			}
		}],
		changesAfterCondensing: 1,
		afterAction: fnOnAfterActionAddAddRemoveItem,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
	});

});