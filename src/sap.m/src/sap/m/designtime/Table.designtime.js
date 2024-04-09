/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Table control
sap.ui.define([
],
	function() {
	"use strict";

	var fCheckPersoEnabled = function(oTable) {
		// Check whether a perso controller is attached to the table (see also sap.m.TablePersoController, or sap.m.p13n.Engine).
		// In this case the column related actions should be disabled because the table personalization can be done by the end user.
		var bHasPersoController = !!(oTable && oTable._hasTablePersoController && oTable._hasTablePersoController());
		var Engine = sap.ui.require("sap/m/p13n/Engine");//Engine only synchronously available in case a control is registered
		var bIsEngineRegistered = Engine && Engine.getInstance().isRegistered(oTable);

		return (bHasPersoController || bIsEngineRegistered);
	};

	return {
		name: {
			singular: "TABLE_NAME",
			plural: "TABLE_NAME_PLURAL"
		},
		palette: {
			group: "LIST",
			icons: {
				svg: "sap/m/designtime/Table.icon.svg"
			}
		},
		aggregations: {
			columns: {
				propagateMetadata: function(oElement) {
					if (oElement.isA("sap.m.Column") && fCheckPersoEnabled(oElement.getParent())) {
						return {
							actions: null
						};
					}
				},
				childNames : {
					singular : "COLUMN_NAME",
					plural : "COLUMN_NAME_PLURAL"
				},
				domRef: ":sap-domref .sapMListTblHeader",
				actions: {
					move: function(oColumn) {
						return fCheckPersoEnabled(oColumn.getParent()) ? null : "moveTableColumns";
					},
					add: {
						delegate: function (oTable) {
							if (!fCheckPersoEnabled(oTable)){
								return {
									changeType: "addTableColumn"
								};
							}
						}
					}
				}
			},
			items: {
				domRef: ":sap-domref .sapMListItems"
			},
			contextMenu: {
				ignore: true
			}
		}
	};

});
