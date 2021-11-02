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
				ignore: false
			},
			height: {
				ignore: false
			},
			delegate: {
				ignore: true
			},
			header: {
				ignore: false
			},
			noDataText: {
				ignore: false
			},
			p13nMode: {
				ignore: false
			},
			legendVisible: {
				ignore: false
			},
			ignoreToolbarActions: {
				ignore: false
			},
			minWidth: {
				ignore: false
			},
			minHeight: {
				ignore: false
			},
			sortConditions: {
				ignore: true
			},
			showChartTooltip: {
				ignore: false
			},
			autoBindOnInit: {
				ignore: false
			},
			chartType: {
				ignore: false
			},
			showSelectionDetails: {
				ignore: false
			}
		},
		aggregations: {
			items: {
				ignore: false
			},
			actions: {
				ignore: false
			},
			selectionDetailsActions: {
				ignore: false
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
