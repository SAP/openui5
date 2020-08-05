/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.MenuButton control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "ACTION",
				icons: {
					svg: "sap/m/designtime/MenuButton.icon.svg"
				}
			},
			aggregations: {
				menu: {
					ignore: true
				}
			},
			actions: {
				split: {
					changeType: "splitMenuButton",
					changeOnRelevantContainer : true,
					getControlsCount : function(oMenuButton) {
						return oMenuButton.getMenu().getItems().length;
					}
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find('.sapMBtn > .sapMBtnInner > .sapMBtnContent')[0];
					}
				}
			},
			templates: {
				create: "sap/m/designtime/MenuButton.create.fragment.xml"
			}
		};
	});