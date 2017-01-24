/*!
 * ${copyright}
 */
// Provides the Design Time Metadata for the sap.m.Slider control
sap.ui.define([],
	function () {
		"use strict";

		return {
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
			name: {
				singular: "SLIDER_NAME",
				plural: "SLIDER_NAME_PLURAL"
			}
		};
	}, /* bExport= */ true);