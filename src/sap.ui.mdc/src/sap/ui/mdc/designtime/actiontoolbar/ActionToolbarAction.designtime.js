/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"../Util",
	"sap/m/designtime/MenuButton.designtime"
], (
	ActionToolbarAction,
	Util,
	MenuButtonDesignTime
) => {
	"use strict";

	const oDesignTime = {
		description: "{description}",
		name: "{name}",
		aggregations: {
			action: {
				propagateMetadata: function(oInnerControl) {
					if (oInnerControl.isA("sap.m.MenuButton")) {
						return {
							actions: {
								remove: null,
								reveal: null,
								split: {
									CAUTION_variantIndependent: true
								},
								combine: {
									CAUTION_variantIndependent: true
								}
							}
						};
					}
					return {
						actions: {
							rename: { // mandatory
								changeType: "rename", // mandatory
								domRef: function(oControl) { // mandatory
									return oControl.$();
								},
								getTextMutators: function(oControl) { // optional
									return {
										getText: function() {
											return oControl.getDomRef().textContent;
										},
										setText: function(sNewText) {
											oControl.getDomRef().textContent = sNewText;
										}
									};
								},
								CAUTION_variantIndependent: true
							},
							remove: null,
							reveal: null,
							combine: {
								CAUTION_variantIndependent: true
							}
						}
					};
				}
			}
		},
		properties: {},
		actions: {}
	};
	const aAllowedAggregations = [
		"action"
	];
	const aAllowedProperties = [];

	return Util.getDesignTime(ActionToolbarAction, aAllowedProperties, aAllowedAggregations, oDesignTime);

});