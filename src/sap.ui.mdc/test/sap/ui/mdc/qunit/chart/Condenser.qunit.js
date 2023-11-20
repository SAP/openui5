/* global */
sap.ui.define([
    "sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
    'use strict';



	function buildXML() {

		const sPropertyInfo = '';
		const sDelegate = '\\{"name": "delegates/odata/v4/vizChart/ChartDelegate", "payload": \\{"collectionName": "Books"\\}\\}';

		const b = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc">' +
		'<mdc:Chart id="myChart" p13nMode="Item,Sort,Type" chartType="column" delegate=\'' +  sDelegate + '\' propertyInfo=\'' + sPropertyInfo + '\'>' +
		'</mdc:Chart>' +
		'</mvc:View>';

		return b;
	}

	function fnConfirm(oUiComponent, oViewAfterAction, assert) {
		const oChart = oViewAfterAction.byId("myChart");
		assert.ok(oChart);
	}

	// --------------------------------

	function fnOnAfterAction(oUiComponent, oViewAfterAction, assert) {
		const oChart = oViewAfterAction.byId("myChart");
		assert.ok(oChart);
		if (oChart.getMetadata) {
			assert.deepEqual(oChart.getChartType(), "bar", "expected inner conditions found");
		}
	}

	elementActionTest("Checking the chartType condensing. One changes expected.", {
		xmlView: buildXML(""),
		action: {
			name: "settings",
			controlId: "myChart",
			parameter: function () {
				return {
					changeType: "setChartType",
					content: {
						chartType: "bar"
					}
				};
			}
		},
		previousActions: [{
			name: "settings",
			controlId: "myChart",
			parameter: function () {
				return {
					changeType: "setChartType",
					content: {
						chartType: "line"
					}
				};
			}
		}],
		changesAfterCondensing: 1,
		afterAction: fnOnAfterAction,
		afterUndo: fnConfirm,
		afterRedo: fnConfirm
    });

	// ---------------------------------------------------------------------

    function fnConfirmInitialSortingState(oUiComponent, oViewAfterAction, assert) {
        const oTable = oViewAfterAction.byId("myChart");
        assert.ok(oTable, "then the mdc.Table exists");
    }

    function fnConfirmSortingGotAdded(sName, iIndex, bDescending) {
        return function(oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myChart");
            assert.ok(oTable, "then the mdc.Table exists");
        };
    }

    elementActionTest("addSort removeSort condensed", {
        xmlView: buildXML(""),
        action: {
            name: "settings",
            controlId: "myChart",
            parameter: function() {
                return {
                    changeType: "removeSort",
                    content: {
                        name: "modifiedBy"
                    }
                };
            }
        },
        previousActions: [{
            name: "settings",
            controlId: "myChart",
            parameter: function() {
                return {
                    changeType: "addSort",
                    content: {
                        index: 0,
                        name: "modifiedBy",
                        descending: false
                    }
                };
            }
        }],
        changesAfterCondensing: 0,
        afterAction: fnConfirmInitialSortingState,
		afterUndo: fnConfirmSortingGotAdded(),
		afterRedo: fnConfirmInitialSortingState
    });

});