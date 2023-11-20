/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Carousel control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "CAROUSEL_NAME",
				plural: "CAROUSEL_NAME_PLURAL"
			},
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/m/designtime/Carousel.icon.svg"
				}
			},
			templates: {
				create: "sap/m/designtime/Carousel.create.fragment.xml"
			}
		};
	});