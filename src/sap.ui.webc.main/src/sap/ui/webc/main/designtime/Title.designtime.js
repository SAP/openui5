/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.Title control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "TITLE_NAME",
				plural: "TITLE_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
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
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});