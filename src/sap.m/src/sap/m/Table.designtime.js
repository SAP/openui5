/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Table control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				columns: {
					domRef: ":sap-domref .sapMListTblHeader",
					actions: {
						move: "moveTableColumns"
					}
				}
			},
			name: {
				singular: "TABLE_NAME",
				plural: "TABLE_NAME_PLURAL"
			}
		};

	}, /* bExport= */ false);