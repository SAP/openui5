sap.ui.define([
	"delegates/odata/v4/vizChart/ChartDelegate",
	"sap/ui/mdc/Link"
], function(ChartDelegate, MDCLink) {
	'use strict';

	const oChartDelegate = Object.assign({}, ChartDelegate);

	oChartDelegate.fetchFieldInfos = (oChart, oSelectionDetails, oBindingContext) => {
		const oLink = new MDCLink({
			delegate: {
				name: "appUnderTestChart/delegate/Link.delegate"
			}
		});

		return {
			"Title_1": oLink,
			"Title_2": oLink
		};
	};

	oChartDelegate.determineEnableNavForDetailsItem = (oChart, mData, oContext) => {
		return true;
	};

	return oChartDelegate;
});