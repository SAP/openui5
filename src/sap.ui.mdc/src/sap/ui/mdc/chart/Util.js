/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib", "sap/ui/mdc/enums/ChartItemRoleType"
], (
	Library,
	ChartItemRoleType
) => {
	"use strict";

	/**
	 * Utility functionality for mdc chart.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/chart/Util
	 * @since 1.121
	 * @private
	 */
	const Util = {};

	/**
	/**
	 * This returns the layout options for a specific type of Item (measure/dimension,groupable/aggregatable)
	 * It is used by p13n to determine which layout options to show in the p13n panel and from the ChartItemFlex.getChangeVisualizationInfo.
	 * @param {string} sType the type for which the layout options are requested
	 * @returns {Object[]} array of supported roles
	 */
	Util.getLayoutOptionsForType = function (sType) {
		switch (sType.toLowerCase()) {
			case "dimension":
			case "groupable":
				return [{
					key: ChartItemRoleType.category,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.category)
				}, {
					key: ChartItemRoleType.category2,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.category2)
				}, {
					key: ChartItemRoleType.series,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.series)
				}];
			case "measure":
			case "aggregatable":
				return [{
					key: ChartItemRoleType.axis1,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.axis1)
				}, {
					key: ChartItemRoleType.axis2,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.axis2)
				}, {
					key: ChartItemRoleType.axis3,
					text: Util.getLayoutOptionTextForTypeAndRole(sType, ChartItemRoleType.axis3)
				}];
			default:
				break;
		}

		return [];
	};


	Util.getLayoutOptionTextForTypeAndRole = function (sType, sRole) {
		const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");
		switch (sType.toLowerCase()) {
			case "dimension":
			case "groupable":
				switch (sRole) {
					case ChartItemRoleType.category:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY');
					case ChartItemRoleType.category2:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2');
					case ChartItemRoleType.series:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES');
					default:
						return undefined;
				}
			case "measure":
			case "aggregatable":
				switch (sRole) {
					case ChartItemRoleType.axis1:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1');
					case ChartItemRoleType.axis2:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2');
					case ChartItemRoleType.axis3:
						return MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3');
					default:
						return undefined;
				}
			default:
				return undefined;
		}
	};

	return Util;
});
