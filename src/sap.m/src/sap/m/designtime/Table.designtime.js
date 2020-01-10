/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Table control
sap.ui.define([
	"sap/ui/fl/changeHandler/ChangeHandlerMediator"
], function (
	ChangeHandlerMediator
) {
	"use strict";

	var fCheckPersoController = function(oTable) {
		// Check whether a perso controller is attached to the table (see also sap.m.TablePersoController).
		// In this case the column related actions should be disabled because the table personalization can be done by the end user.
		return !!(oTable && oTable._hasTablePersoController && oTable._hasTablePersoController());
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
					if (oElement.isA("sap.m.Column") && fCheckPersoController(oElement.getParent())) {
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
					move: function(oColumn) {return fCheckPersoController(oColumn.getParent()) ? null : "moveTableColumns";},
					addODataProperty: function (oTable) {
						var mChangeHandlerSettings = ChangeHandlerMediator.getAddODataFieldSettings(oTable);

						if (mChangeHandlerSettings && !fCheckPersoController(oTable)){
							return {
								changeType: "addTableColumn",
								changeHandlerSettings : mChangeHandlerSettings
							};
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