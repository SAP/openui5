/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine"
	], function (Engine) {
	"use strict";

	return {
		actions: {
			settings: function () {
				//RTA expects the settings to be returned as function
				return {
					handler: function (oControl, mPropertyBag) {
						return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getP13nMode());
					}
				};
			}
		},
		properties: {
			width: {
				ignore: true
			},
			height: {
				ignore: true
			},
			delegate: {
				ignore: true
			},
			header: {
				ignore: true
			},
			noDataText: {
				ignore: true
			},
			p13nMode: {
				ignore: true
			},
			legendVisible: {
				ignore: true
			},
			ignoreToolbarActions: {
				ignore: true
			},
			minWidth: {
				ignore: true
			},
			minHeight: {
				ignore: true
			},
			sortConditions: {
				ignore: true
			},
			filterConditions: {
				ignore: true
			},
			showChartTooltip: {
				ignore: true
			},
			autoBindOnInit: {
				ignore: true
			},
			chartType: {
				ignore: true
			},
			showSelectionDetails: {
				ignore: true
			},
			propertyInfo: {
				ignore: true
			}
		},
		aggregations: {
			items: {
				ignore: true
			},
			actions: {
				ignore: true
			},
			selectionDetailsActions: {
				ignore: true
			},
			_toolbar: {
				ignore: false
			},
			_breadcrumbs: {
				ignore: true
			},
			_innerChart: {
				ignore: true
			}
		}
	};

});
