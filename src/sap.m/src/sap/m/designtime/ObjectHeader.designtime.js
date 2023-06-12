/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ObjectHeader control
sap.ui.define([],
	function() {
	"use strict";

	return {
		palette: {
			group: "INPUT",
			icons: {
				svg: "sap/m/designtime/ObjectHeader.icon.svg"
			}
		},
		aggregations: {
			headerContainer: {
				propagateMetadata: function (oInnerControl, oObjectHeader) {
					if (oInnerControl.isA("sap.m.IconTabBar")) {
						return {
							domRef: function () {
								return oObjectHeader.getDomRef().querySelector(".sapMITH");
							},
							aggregations: {
								items: {
									domRef: function () {
										return oObjectHeader.getDomRef().querySelector(".sapMITH");
									},
									actions: {
										move: "moveControls"
									}
								}
							}
						};
					}

					return null;
				},
				propagateRelevantContainer: true
			}
		},
		templates: {
			create: "sap/m/designtime/ObjectHeader.create.fragment.xml"
		}
	};

});