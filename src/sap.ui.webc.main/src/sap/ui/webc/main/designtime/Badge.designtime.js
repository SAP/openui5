/*!
 * ${copyright}
 */

// Provides the design-time metadata for the sap.ui.webc.main.Badge control
sap.ui.define([],
	function () {
		"use strict";

		return {
			name: {
				singular: "BADGE_NAME",
				plural: "BADGE_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.getDomRef();
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