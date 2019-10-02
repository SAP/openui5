/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";

		return {
			apiVersion: 2,

			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
					oRm.renderControl(oControl._getGridContainer());
				oRm.close("div");
			}
		};

	}, /* bExport= */ true);