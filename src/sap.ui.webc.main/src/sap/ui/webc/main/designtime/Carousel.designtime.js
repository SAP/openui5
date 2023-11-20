/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.Carousel control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "CAROUSEL_NAME",
				plural: "CAROUSEL_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});