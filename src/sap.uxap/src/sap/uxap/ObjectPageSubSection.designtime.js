/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSubSection control
sap.ui.define([],
	function() {
		"use strict";

		return {
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSubSectionHeaderTitle"
					};
				}
			},
			aggregations: {
				actions: {
					domRef : ":sap-domref .sapUxAPObjectPageSubSectionHeaderActions",
					actions : {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};

	}, /* bExport= */ false);