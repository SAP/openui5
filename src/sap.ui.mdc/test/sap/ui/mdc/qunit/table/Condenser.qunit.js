/* global */
sap.ui.define([
    "sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
    'use strict';

    function fnGetView() {
        const sDelegate = '\\{"name": "sap/ui/mdc/qunit/table/CondenserDelegate"\\}';
        const sView =
        '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.mdc.table" xmlns:m="sap.m" xmlns:mdc="sap.ui.mdc">' +
            '<mdc:Table id="myMDCTable" ' +
                'selectionMode="Multi" ' +
                'type="Table" ' +
                'delegate=\'' +  sDelegate + '\' ' +
                'p13nMode="Column,Group,Sort">' +
                '<mdc:columns>' +
                    '<Column id="IDTableName_01" header="Name" propertyKey="name"></Column>' +
                    '<Column id="IDTableYear" header="Founding Year" propertyKey="foundingYear"></Column>' +
                    '<Column id="IDTablemodified" header="Changed By" propertyKey="modifiedBy"></Column>' +
                    '<Column id="IDTableCreated" header="Created On" propertyKey="createdAt"></Column>' +
                '</mdc:columns>' +
            '</mdc:Table>' +
        '</mvc:View>';

        return sView;
    }

    function getIdForPropertyName(sPropertyName) {
        switch (sPropertyName) {
            case "name":
                return "comp---view--IDTableName_01";
            case "foundingYear":
                return "comp---view--IDTableYear";
            case "modifiedBy":
                return "comp---view--IDTablemodified";
            case "createdAt":
                return "comp---view--IDTableCreated";
            default:
                return undefined;
        }
    }

    // ---------------------------------------------------------------------

    function fnConfirmInitialColumnState(oUiComponent, oViewAfterAction, assert) {
        const oTable = oViewAfterAction.byId("myMDCTable");
        const aColumns = oTable.getColumns();
		assert.ok(oTable, "then the mdc.Table exists");
        assert.equal(aColumns.length, 4, "then the table has correct amount of columns");
        assert.equal(aColumns[0].getId(), "comp---view--IDTableName_01", "then the name column is on Index 0");
        assert.equal(aColumns[1].getId(), "comp---view--IDTableYear", "then the foundingYear column is on Index 1");
        assert.equal(aColumns[2].getId(), "comp---view--IDTablemodified", "then the modifiedBy column is on Index 2");
        assert.equal(aColumns[3].getId(), "comp---view--IDTableCreated", "then the createdAt column is on Index 3");
    }

    function fnHasColumn(oTable, sId) {
        return oTable.getColumns().some(function(oColumn) {
            return oColumn.getId() === sId;
        });
    }

    function fnConfirmColumnGotAdded(sPropertyName) {
        return function (oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myMDCTable");
            assert.ok(oTable, "then the mdc.Table exists");
            assert.ok(fnHasColumn(oTable, getIdForPropertyName(sPropertyName)), "then the column '" + sPropertyName + "' got added");
        };
    }

    function fnConfirmColumnGotRemoved(sPropertyName) {
        return function (oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myMDCTable");
            assert.ok(oTable, "then the mdc.Table exists");
            assert.ok(!fnHasColumn(oTable, getIdForPropertyName(sPropertyName)), "then the column '" + sPropertyName + "' got removed");
        };
    }

    function fnConfirmColumnGotMoved(sPropertyName, iIndex) {
        return function (oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myMDCTable");
            assert.ok(oTable, "then the mdc.Table exists");
            assert.equal(oTable.getColumns()[iIndex].getId(), getIdForPropertyName(sPropertyName), "then the column '" + sPropertyName + "' is on Index " + iIndex);
        };
    }

    elementActionTest("addColumn and removeColumn change condensed", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function (oView) {
                return {
					changeType: "addColumn",
					content: {
						name: "name",
                        index: 0
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
			controlId: "myMDCTable",
			parameter: function () {
				return {
					changeType: "removeColumn",
					content: {
						name: "name"
					}
				};
			}
		}],
        changesAfterCondensing: 0, // OPTIONAL
		afterAction: fnConfirmColumnGotAdded("name"),
		afterUndo: fnConfirmInitialColumnState,
		afterRedo: fnConfirmColumnGotAdded("name")
    });

    elementActionTest("Single removeColumn change", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function (oView) {
                return {
					changeType: "removeColumn",
					content: {
						name: "modifiedBy"
					}
				};
            }
        },
        changesAfterCondensing: 1, // OPTIONAL
		afterAction: fnConfirmColumnGotRemoved("modifiedBy"),
		afterUndo: fnConfirmInitialColumnState,
		afterRedo: fnConfirmColumnGotRemoved("modifiedBy")
    });

    elementActionTest("Single moveColumn change", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function (oView) {
                return {
					changeType: "moveColumn",
					content: {
						name: "modifiedBy",
                        index: 0
					}
				};
            }
        },
        changesAfterCondensing: 1, // OPTIONAL
		afterAction: fnConfirmColumnGotMoved("modifiedBy", 0),
		afterUndo: fnConfirmInitialColumnState,
		afterRedo: fnConfirmColumnGotMoved("modifiedBy", 0)
    });

    elementActionTest("Two moveColumn changes condensed into none", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function (oView) {
                return {
					changeType: "moveColumn",
					content: {
						name: "modifiedBy",
                        index: 2
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
            controlId: "myMDCTable",
            parameter: function () {
                return {
					changeType: "moveColumn",
					content: {
						name: "modifiedBy",
                        index: 0
					}
				};
            }
		}],
        changesAfterCondensing: 0, // OPTIONAL
		afterAction: fnConfirmColumnGotMoved("modifiedBy", 2),
		afterUndo: fnConfirmInitialColumnState,
		afterRedo: fnConfirmColumnGotMoved("modifiedBy", 2)
    });

    elementActionTest("Two moveColumn changes condensed into one", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function (oView) {
                return {
					changeType: "moveColumn",
					content: {
						name: "modifiedBy",
                        index: 1
					}
				};
            }
        },
        previousActions: [{
			name: "settings",
            controlId: "myMDCTable",
            parameter: function () {
                return {
					changeType: "moveColumn",
					content: {
						name: "modifiedBy",
                        index: 0
					}
				};
            }
		}],
        changesAfterCondensing: 1, // OPTIONAL
		afterAction: fnConfirmColumnGotMoved("modifiedBy", 1),
		afterUndo: fnConfirmInitialColumnState,
		afterRedo: fnConfirmColumnGotMoved("modifiedBy", 1)
    });

    // ---------------------------------------------------------------------

    function fnConfirmInitialGroupingState(oUiComponent, oViewAfterAction, assert) {
        const oTable = oViewAfterAction.byId("myMDCTable");
        assert.ok(oTable, "then the mdc.Table exists");
    }

    function fnConfirmGroupingGotAdded(sName, iIndex) {
        return function(oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myMDCTable");
            assert.ok(oTable, "then the mdc.Table exists");
        };
    }

    elementActionTest("addGroup removeGroup condensed", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
            parameter: function() {
                return {
                    changeType: "removeGroup",
                    content: {
                        name: "modifiedBy"
                    }
                };
            }
        },
        previousActions: [{
            name: "settings",
            controlId: "myMDCTable",
            parameter: function() {
                return {
                    changeType: "addGroup",
                    content: {
                        index: 0,
                        name: "modifiedBy"
                    }
                };
            }
        }],
        changesAfterCondensing: 0,
        afterAction: fnConfirmInitialGroupingState,
		afterUndo: fnConfirmGroupingGotAdded(),
		afterRedo: fnConfirmInitialGroupingState
    });

    // ---------------------------------------------------------------------

    function fnConfirmInitialSortingState(oUiComponent, oViewAfterAction, assert) {
        const oTable = oViewAfterAction.byId("myMDCTable");
        assert.ok(oTable, "then the mdc.Table exists");
    }

    function fnConfirmSortingGotAdded(sName, iIndex, bDescending) {
        return function(oUiComponent, oViewAfterAction, assert) {
            const oTable = oViewAfterAction.byId("myMDCTable");
            assert.ok(oTable, "then the mdc.Table exists");
        };
    }

    elementActionTest("addSort removeSort condensed", {
        xmlView: fnGetView(),
        action: {
            name: "settings",
            controlId: "myMDCTable",
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
            controlId: "myMDCTable",
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