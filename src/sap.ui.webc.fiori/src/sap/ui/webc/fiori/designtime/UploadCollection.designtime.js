/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.fiori.UploadCollection control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "UPLOAD_COLLECTION_NAME",
				plural: "UPLOAD_COLLECTION_PLURAL"
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