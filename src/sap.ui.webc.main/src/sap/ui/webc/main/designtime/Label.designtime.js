/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.Label control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "LABEL_NAME",
				plural: "LABEL_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.getDomRef().shadowRoot.querySelector(".ui5-title-root");
					},
					getTextMutators: function (oControl) {
						return {
							getText: function () {
								return oControl.getText();
							},
							setText: function (sNewText) {
								oControl.setText(sNewText);
							}
						};
					}
				}
			}
		};
	});