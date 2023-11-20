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
			aggregations: {
				items: {
					domRef: function (oControl) {
						return oControl.getDomRef().shadowRoot.querySelector(".ui5-uc-content");
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};
	});