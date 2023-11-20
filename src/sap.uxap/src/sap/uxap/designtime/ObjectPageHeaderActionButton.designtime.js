/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageHeaderActionButton control
sap.ui.define([],
		function () {
			"use strict";

			return {
				actions: {
					remove: {
						changeType: "hideControl"
					},
					rename: function (oButton) {
						if (oButton.getIcon()) {
							return null;
						}
						return {
							changeType: "rename",
							domRef: function (oControl) {
								return oControl.$().find(".sapMBtnContent")[0];
							}
						};
					},
					reveal: {
						changeType: "unhideControl"
					}
				}
			};
		});