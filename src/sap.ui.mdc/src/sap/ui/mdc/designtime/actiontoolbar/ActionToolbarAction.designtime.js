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
								reveal: null
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
								}
							},
							remove: null,
							reveal: null
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