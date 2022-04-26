/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.fiori.UploadCollectionItem control
sap.ui.define([], function () {
	"use strict";

	return {
		name: {
			singular: "UPLOAD_COLLECTION_ITEM_NAME",
			plural: "UPLOAD_COLLECTION_ITEM_NAME_PLURAL"
		},
		actions: {
			rename: {
				changeType: "renameUploadCollectionItem",
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-uci-file-name");
				}
			},
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl"
			}
		}
	};
});