/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";

		var FCLRenderer = {};

		FCLRenderer.render = function (oRm, oControl) {

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFFCL");
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
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnBegin").addClass("sapFFCLColumnActive");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oControl._getBeginColumn());

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
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnMid");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			if (oControl.getAggregation("_midColumnNav")) {
				oRm.renderControl(oControl._getMidColumn());
			}

			// Arrow - expand begin
			FCLRenderer.renderArrow(oRm, oMidColumnForwardArrow);

			// Arrow - expand end
			FCLRenderer.renderArrow(oRm, oMidColumnBackArrow);

			oRm.write("</div>");
		};

		FCLRenderer.renderEndColumn = function (oRm, oControl) {
			var oEndColumnForwardArrow = oControl.getAggregation("_endColumnForwardArrow");

			// End column
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-endColumn");
			oRm.addClass("sapFFCLColumn").addClass("sapFFCLColumnEnd");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			if (oControl.getAggregation("_endColumnNav")) {
				oRm.renderControl(oControl._getEndColumn());
			}

			// Arrow - right
			FCLRenderer.renderArrow(oRm, oEndColumnForwardArrow);

			oRm.write("</div>");
		};

		FCLRenderer.renderArrow = function (oRm, oArrow) {
			if (!sap.ui.Device.system.phone) {
				oRm.renderControl(oArrow);
			}
		};

		return FCLRenderer;

	}, /* bExport= */ true);
