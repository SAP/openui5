/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.InputListItem control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			content : {
				domRef : ":sap-domref > .sapMLIBContent",
				actions : {
					move : "moveControls"
				}
			}
		},
		actions: {
			rename: {
				changeType: "rename",
				domRef: function (oControl) {
					return oControl.$().find(".sapMLIBContent > .sapMILILabel")[0];
				}
			}
		},
		name: {
			singular: "LIST_ITEM_BASE_NAME",
			plural: "LIST_ITEM_BASE_NAME_PLURAL"
		}
	};

});