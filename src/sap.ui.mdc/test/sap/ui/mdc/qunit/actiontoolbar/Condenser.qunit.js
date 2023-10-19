/* global */
sap.ui.define([
    "sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
    'use strict';

    function fnGetViewStandAlone() {
        const sView =
            '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar">' +
                '<mdc:ActionToolbar id="actionToolbarId" width="100%">' +
                    '<mdc:actions>' +
                        '<mdcat:ActionToolbarAction id="Action1">' +
                            '<m:Button text="Action 1" id="Button1" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action2">' +
                            '<m:Button text="Action 2" id="Button2" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action3">' +
                            '<m:Button text="Action 3" id="Button3" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action4">' +
                            '<m:Button text="Action 4" id="Button4" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action5">' +
                            '<m:Button text="Action 5" id="Button5" />' +
                        '</mdcat:ActionToolbarAction>' +
                    '</mdc:actions>' +
                '</mdc:ActionToolbar>' +
            '</mvc:View>';

        return sView;
    }

/*
    function fnGetViewWithTable() {
        var sDelegate = '\\{"name": "sap/ui/mdc/qunit/table/CondenserDelegate"\\}';
        var sView =
            '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar">' +
                '<mdc:Table id="actionToolbarTable" ' +
                    'selectionMode="Multi" ' +
                    'type="Table" ' +
                    'delegate=\'' +  sDelegate + '\' ' +
                    'p13nMode="Column,Group,Sort">' +
                    '<mdc:actions>' +
                        '<mdcat:ActionToolbarAction id="Action1">' +
                            '<m:Button text="Action 1" id="Button1" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action2">' +
                            '<m:Button text="Action 2" id="Button2" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action3">' +
                            '<m:Button text="Action 3" id="Button3" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action4">' +
                            '<m:Button text="Action 4" id="Button4" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action5">' +
                            '<m:Button text="Action 5" id="Button5" />' +
                        '</mdcat:ActionToolbarAction>' +
                    '</mdc:actions>' +
                '</mdc:Table>' +
            '</mvc:View>';

        return sView;
    }
*/
    function fnGetViewWithChart() {
        const sDelegate = '\\{"name": "delegates/ChartDelegate"\\}';
        const sView =
            '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:mdcc="sap.ui.mdc.chart" xmlns:core="sap.ui.core">' +
                '<mdc:Chart id="actionToolbarChart" autoBindOnInit="true" noDataText="This is a test noData text" delegate=\'' +  sDelegate + '\' chartType="column" header="Books Chart" height="400px" width="100%">' +
                    '<mdc:actions>' +
                        '<mdcat:ActionToolbarAction id="Action1">' +
                            '<m:Button text="Action 1" id="chartButton1" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action2">' +
                            '<m:Button text="Action 2" id="chartButton2" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action3">' +
                            '<m:Button text="Action 3" id="chartButton3" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action4">' +
                            '<m:Button text="Action 4" id="chartButton4" />' +
                        '</mdcat:ActionToolbarAction>' +
                        '<mdcat:ActionToolbarAction id="Action5">' +
                            '<m:Button text="Action 5" id="chartButton5" />' +
                        '</mdcat:ActionToolbarAction>' +
                    '</mdc:actions>' +
                    '<mdc:items>' +
                        '<mdcc:Item id="dim1" type="groupable" name="language_code" role="category" label="Languages"/>' +
                        '<mdcc:Item id="meas1" type="aggregatable" name="averagemetricsWords" role="axis1" label="Words (avg)"/>' +
                    '</mdc:items>' +
                '</mdc:Chart>' +
            '</mvc:View>';
        return sView;
    }


    function fnConfirmInitialActionState(sActionToolbarId) {
        return function (oUiComponent, oViewAfterAction, assert) {
            const oActionToolbar = oViewAfterAction.byId(sActionToolbarId);
            const aActions = oActionToolbar.getActions();
            assert.ok(oActionToolbar, "then the mdc.ActionToolbar exists");
            assert.equal(aActions.length, 5, "then the ActionToolbar has correct amount of actions");
            assert.equal(aActions[0].getId(), "comp---view--Action1", "Action 'comp---view--Action1' on index 0");
            assert.equal(aActions[1].getId(), "comp---view--Action2", "Action 'comp---view--Action2' on index 1");
            assert.equal(aActions[2].getId(), "comp---view--Action3", "Action 'comp---view--Action3' on index 2");
            assert.equal(aActions[3].getId(), "comp---view--Action4", "Action 'comp---view--Action4' on index 3");
            assert.equal(aActions[4].getId(), "comp---view--Action5", "Action 'comp---view--Action5' on index 4");
        };
    }

    function fnConfirmActionGotMoved(sActionToolbarId, sActionId, iIndex) {
        return function (oUiComponent, oViewAfterAction, assert) {
            const oActionToolbar = oViewAfterAction.byId(sActionToolbarId);
            const aActions = oActionToolbar.getActions();
            assert.ok(oActionToolbar, "then the mdc.ActionToolbar exists");
            assert.equal(aActions.length, 5, "then the ActionToolbar has correct amount of actions");
            assert.equal(aActions[iIndex].getId(), sActionId, "Action '" + sActionId + "' got moved to index " + iIndex);
        };
    }

    elementActionTest("Standalone - Two moveAction changes condensed into none", {
        xmlView: fnGetViewStandAlone(),
        action: {
            name: "settings",
            controlId: "actionToolbarId",
            parameter: function () {
                return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 1
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
			controlId: "actionToolbarId",
			parameter: function () {
				return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 0
					}
				};
			}
		}],
        changesAfterCondensing: 1,
		afterAction: fnConfirmActionGotMoved("actionToolbarId", "comp---view--Action5", 1),
		afterUndo: fnConfirmInitialActionState("actionToolbarId"),
		afterRedo: fnConfirmActionGotMoved("actionToolbarId", "comp---view--Action5", 1)
    });

/*
    elementActionTest("with Table - Two moveAction changes condensed into none", {
        xmlView: fnGetViewWithTable(),
        jsOnly: true,
        action: {
            name: "settings",
            controlId: "actionToolbarTable-toolbar",
            parameter: function () {
                return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 1
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
			controlId: "actionToolbarTable-toolbar",
			parameter: function () {
				return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 0
					}
				};
			}
		}],
        changesAfterCondensing: 1,
		afterAction: fnConfirmActionGotMoved("comp---view--actionToolbarTable-toolbar", "comp---view--Action5", 1),
		afterUndo: fnConfirmInitialActionState("comp---view--actionToolbarTable-toolbar"),
		afterRedo: fnConfirmActionGotMoved("comp---view--actionToolbarTable-toolbar", "comp---view--Action5", 1)
    });
*/

    elementActionTest("with Chart - Two moveAction changes condensed into none", {
        xmlView: fnGetViewWithChart(),
        jsOnly: true,
        action: {
            name: "settings",
            controlId: "actionToolbarChart--toolbar",
            parameter: function () {
                return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 1
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
			controlId: "actionToolbarChart--toolbar",
			parameter: function () {
				return {
					changeType: "moveAction",
					content: {
						name: "comp---view--Action5",
                        index: 0
					}
				};
			}
		}],
        changesAfterCondensing: 1,
		afterAction: fnConfirmActionGotMoved("comp---view--actionToolbarChart--toolbar", "comp---view--Action5", 1),
		afterUndo: fnConfirmInitialActionState("comp---view--actionToolbarChart--toolbar"),
		afterRedo: fnConfirmActionGotMoved("comp---view--actionToolbarChart--toolbar", "comp---view--Action5", 1)
    });

});