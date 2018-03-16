/*!
 * ${copyright}
 */
// Provides the Design Time Metadata for the sap.m.Slider control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "SLIDER_NAME",
				plural: "SLIDER_NAME_PLURAL"
			},
			palette: {
				group: "INPUT",
				icons: {
					svg: "sap/m/designtime/Slider.icon.svg"
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			aggregations: {
				scale: {
					domRef: ":sap-domref > .sapMSliderTickmarks"
				}
			},
			templates: {
				create: "sap/m/designtime/Slider.create.fragment.xml"
			}
		};
	}, /* bExport= */ true);