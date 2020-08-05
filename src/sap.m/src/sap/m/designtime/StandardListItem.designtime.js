/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.StandardListItem control
sap.ui.define([],
	function() {
		"use strict";

		return {
			actions: {
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapMLIBContent > .sapMSLIDiv > .sapMSLITitleOnly")[0] || oControl.$().find(".sapMLIBContent > .sapMSLIDiv > .sapMSLITitle")[0];
					}
				}
			}
		};

	});