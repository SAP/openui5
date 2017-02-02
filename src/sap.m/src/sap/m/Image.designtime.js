/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Image control
sap.ui.define([],
		function () {
			"use strict";

			return {
				aggregations: {
					detailBox: {
						ignore: true
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
				name: {
					singular: "IMAGE_NAME",
					plural: "IMAGE_NAME_PLURAL"
				}
			};
		}, /* bExport= */ false);

