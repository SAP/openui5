/*!
 * ${copyright}
 */
// Provides the design-time metadata for the sap.ui.webc.main.BreadcrumbsItem control
sap.ui.define([],
	function () {
		"use strict";
		return {
			domRef : function(oControl) {
				return oControl.getDomRef().getDomRef();
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.getDomRef().getDomRef();
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
					},
					isEnabled: function (oControl) {
						return oControl.getText().length > 0;
					},
					validators: [
						"noEmptyText"
					]
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});