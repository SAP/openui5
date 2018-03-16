/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/InvisibleText", "sap/ui/Device", "sap/m/library"],
	function (InvisibleText, Device, mobileLibrary) {
		"use strict";

		var FCLRenderer = {};

		FCLRenderer.render = function (oRm, oControl) {

			var sBackgroundDesign = oControl.getBackgroundDesign();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFFCL");

			if (sBackgroundDesign !== mobileLibrary.BackgroundDesign.Transparent) {
				oRm.addClass("sapFFCLBackgroundDesign" + sBackgroundDesign);
			}

			oRm.writeClasses();
			oRm.write(">");

			FCLRenderer.renderBeginColumn(oRm, oControl);
			FCLRenderer.renderMidColumn(oRm, oControl);
			FCLRenderer.renderEndColumn(oRm, oControl);

			oRm.write("</div>");
		};

		FCLRenderer.renderBeginColumn = function (oRm, oControl) {
			var oBeginColumnBackArrow = oControl.getAggregation("_beginColumnBackArrow");

			// Begin column
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-beginColumn");
			oRm.writeAccessibilityState(oControl, {
				role: "region",
				labelledBy: InvisibleText.getStaticId("sap.f", "FCL_BEGIN_COLUMN_REGION_TEXT")
			});
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnBegin").addClass("sapFFCLColumnActive");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// Begin column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			// Arrow - collapse begin
			FCLRenderer.renderArrow(oRm, oBeginColumnBackArrow);

			oRm.write("</div>");
		};

		FCLRenderer.renderMidColumn = function (oRm, oControl) {
			var oMidColumnForwardArrow = oControl.getAggregation("_midColumnForwardArrow"),
				oMidColumnBackArrow = oControl.getAggregation("_midColumnBackArrow");

			// Mid column
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-midColumn");
			oRm.writeAccessibilityState(oControl, {
				role: "region",
				labelledBy: InvisibleText.getStaticId("sap.f", "FCL_MID_COLUMN_REGION_TEXT")
			});
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnMid");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// Arrow - expand begin
			FCLRenderer.renderArrow(oRm, oMidColumnForwardArrow);

			// Mid column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			// Arrow - expand end
			FCLRenderer.renderArrow(oRm, oMidColumnBackArrow);

			oRm.write("</div>");
		};

		FCLRenderer.renderEndColumn = function (oRm, oControl) {
			var oEndColumnForwardArrow = oControl.getAggregation("_endColumnForwardArrow");

			// End column
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-endColumn");
			oRm.writeAccessibilityState(oControl, {
				role: "region",
				labelledBy: InvisibleText.getStaticId("sap.f", "FCL_END_COLUMN_REGION_TEXT")
			});
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnEnd");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// Arrow - right
			FCLRenderer.renderArrow(oRm, oEndColumnForwardArrow);

			// End column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			oRm.write("</div>");
		};

		FCLRenderer.renderArrow = function (oRm, oArrow) {
			if (!Device.system.phone) {
				oArrow.addStyleClass("sapContrastPlus");
				oRm.renderControl(oArrow);
			}
		};

		FCLRenderer.renderColumnContentWrapper = function (oRm) {
			oRm.write("<div");
			oRm.addClass("sapFFCLColumnContent");
			oRm.writeClasses();
			oRm.write("></div>");
		};

		return FCLRenderer;

	}, /* bExport= */ true);
