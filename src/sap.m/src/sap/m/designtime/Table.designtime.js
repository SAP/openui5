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

	return {
		aggregations: {
			columns: {
				childNames : {
					singular : "COLUMN_NAME",
					plural : "COLUMN_NAME_PLURAL"
				},
				domRef: ":sap-domref .sapMListTblHeader",
				actions: {
					move: "moveTableColumns",
					addODataProperty: function (oTable) {
						var mChangeHandlerSettings = ChangeHandlerMediator.getAddODataFieldSettings(oTable);

						if (mChangeHandlerSettings){
							return {
								changeType: "addTableColumn",
								changeHandlerSettings : mChangeHandlerSettings
							};
						}
					}
				}
			}
		},
		name: {
			singular: "TABLE_NAME",
			plural: "TABLE_NAME_PLURAL"
		}
	};

}, /* bExport= */ false);