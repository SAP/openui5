/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Core"],
	function (Core) {
		"use strict";

		return {
			apiVersion: 2,

			render: function (oRm, oControl) {
				var oRb = Core.getLibraryResourceBundle("sap.f");

				oRm.openStart("div", oControl);
				oRm.attr("role", "menu");
				oRm.attr("aria-label", oRb.getText("PRODUCTSWITCH_CONTAINER_LABEL"));
				oRm.openEnd();
					oRm.renderControl(oControl._getGridContainer());
				oRm.close("div");
			}
		};

	}, /* bExport= */ true);