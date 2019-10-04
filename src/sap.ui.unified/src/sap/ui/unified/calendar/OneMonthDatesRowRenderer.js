/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './MonthRenderer', './DatesRowRenderer'],
	function(Renderer, MonthRenderer, DatesRowRenderer) {
		"use strict";

		/**
		 * OneMonthDatesRowRenderer renderer.
		 * @namespace
		 */
		var OneMonthDatesRowRenderer = Renderer.extend(DatesRowRenderer);

		OneMonthDatesRowRenderer.apiVersion = 2;

		["getClass", "renderMonth", "renderDays", "renderHeader"].forEach(function(sHelperMethod) {
			OneMonthDatesRowRenderer[sHelperMethod] = function(oRm, oDatesRow) {
				if (oDatesRow.iMode < 2) {
					return MonthRenderer[sHelperMethod].apply(MonthRenderer, arguments);
				} else {
					if (sHelperMethod === "getClass") {
						var aClasses = ["sapUiCalDatesRow", "sapUiCalRow", "sapUiCalOneMonthDatesRow"];

						if (!oDatesRow.getShowDayNamesLine()) {
							aClasses.push("sapUiCalNoNameLine");
						}

						return aClasses;
					}
					return DatesRowRenderer[sHelperMethod].apply(DatesRowRenderer, arguments);
				}
			};
		});



		return OneMonthDatesRowRenderer;

	}, /* bExport=  */ true);
