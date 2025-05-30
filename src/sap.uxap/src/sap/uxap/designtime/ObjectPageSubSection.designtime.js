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
					changeType: "hideControl",
					isEnabled: function (oElement) {
						var oSection = oElement.getParent(),
							aVisibleSubSections;

						if (oSection) {
							aVisibleSubSections = oSection.getSubSections().filter(function (oSubSection) {
								return oSubSection.getVisible();
							});

							return aVisibleSubSections.length > 1;
						}

						return false;
					}
				},
				reveal: {
					changeType: "unhideControl",
					depthOfRelevantBindings: 1
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSubSectionTitle",
						isEnabled : function (oElement) {
							return oElement.$("headerTitle").get(0) != undefined;
						}
					};
				}
			},
			aggregations: {
				actions: {
					domRef : function (oElement) {
						return oElement.$().find(".sapUxAPObjectPageSubSectionHeaderToolbar")[0];
					},
					actions : {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};

	});