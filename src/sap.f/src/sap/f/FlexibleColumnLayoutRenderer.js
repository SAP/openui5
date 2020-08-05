/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/InvisibleText", "sap/ui/Device", "sap/m/library"],
	function (InvisibleText, Device, mobileLibrary) {
		"use strict";

		var FCLRenderer = {
			apiVersion: 2
		};

		FCLRenderer.render = function (oRm, oControl) {

			var sBackgroundDesign = oControl.getBackgroundDesign();

			oRm.openStart("div", oControl);
			oRm.class("sapFFCL");

			if (sBackgroundDesign !== mobileLibrary.BackgroundDesign.Transparent) {
				oRm.class("sapFFCLBackgroundDesign" + sBackgroundDesign);
			}

			oRm.openEnd();

			FCLRenderer.renderBeginColumn(oRm, oControl);
			FCLRenderer.renderMidColumn(oRm, oControl);
			FCLRenderer.renderEndColumn(oRm, oControl);

			oRm.close("div");
		};

		FCLRenderer.renderBeginColumn = function (oRm, oControl) {
			var oBeginColumnBackArrow = oControl.getAggregation("_beginColumnBackArrow");

			// Begin column
			oRm.openStart("div", oControl.getId() + "-beginColumn");
			oRm.accessibilityState(oControl, {
				role: "region",
				labelledby: InvisibleText.getStaticId("sap.f", "FCL_BEGIN_COLUMN_REGION_TEXT")
			});
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnBegin");
			oRm.class("sapFFCLColumnActive");
			oRm.openEnd();

			// Begin column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			oRm.close("div");

			// Arrow - collapse begin
			FCLRenderer.renderArrow(oRm, oBeginColumnBackArrow);
		};

		FCLRenderer.renderMidColumn = function (oRm, oControl) {
			var oMidColumnForwardArrow = oControl.getAggregation("_midColumnForwardArrow"),
				oMidColumnBackArrow = oControl.getAggregation("_midColumnBackArrow");
			// Arrow - expand begin
			FCLRenderer.renderArrow(oRm, oMidColumnForwardArrow);
			// Mid column
			oRm.openStart("div", oControl.getId() + "-midColumn");
			oRm.accessibilityState(oControl, {
				role: "region",
				labelledby: InvisibleText.getStaticId("sap.f", "FCL_MID_COLUMN_REGION_TEXT")
			});
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnMid");
			oRm.openEnd();

			// Mid column content
			FCLRenderer.renderColumnContentWrapper(oRm);
			oRm.close("div");
			// Arrow - expand end
			FCLRenderer.renderArrow(oRm, oMidColumnBackArrow);

		};

		FCLRenderer.renderEndColumn = function (oRm, oControl) {
			var oEndColumnForwardArrow = oControl.getAggregation("_endColumnForwardArrow");
			// Arrow - right
			FCLRenderer.renderArrow(oRm, oEndColumnForwardArrow);
			// End column
			oRm.openStart("div", oControl.getId() + "-endColumn");
			oRm.accessibilityState(oControl, {
				role: "region",
				labelledby: InvisibleText.getStaticId("sap.f", "FCL_END_COLUMN_REGION_TEXT")
			});
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnEnd");
			oRm.openEnd();

			// End column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			oRm.close("div");

		};

		FCLRenderer.renderArrow = function (oRm, oArrow) {
			if (!Device.system.phone) {
				oRm.openStart("div");
				oRm.class("sapFFCLArrow");
				oRm.class("sapContrastPlus");
				oRm.openEnd();
				oRm.renderControl(oArrow);
				oRm.close("div");
			}
		};

		FCLRenderer.renderColumnContentWrapper = function (oRm) {
			oRm.openStart("div");
			oRm.class("sapFFCLColumnContent");
			oRm.openEnd();
			oRm.close("div");
		};

		return FCLRenderer;

	}, /* bExport= */ true);
