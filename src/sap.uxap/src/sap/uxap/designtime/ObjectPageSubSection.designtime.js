/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSubSection control
sap.ui.define([],
	function() {
		"use strict";

		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/uxap/designtime/ObjectPageSubSection.icon.svg"
				}
			},
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
						domRef: ".sapUxAPObjectPageSubSectionHeaderTitle",
						isEnabled : function (oElement) {
							return oElement.$("headerTitle").get(0) != undefined;
						}
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

	});