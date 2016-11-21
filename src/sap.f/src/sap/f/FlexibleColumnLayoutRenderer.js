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

			this.renderBeginColumn(oRm, oControl);
			this.renderMidColumn(oRm, oControl);
			this.renderEndColumn(oRm, oControl);

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
			oRm.renderControl(oBeginColumnBackArrow);

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
			oRm.renderControl(oMidColumnForwardArrow);

			// Arrow - expand end
			oRm.renderControl(oMidColumnBackArrow);

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
			oRm.renderControl(oEndColumnForwardArrow);

			oRm.write("</div>");
		};

		return FCLRenderer;

	}, /* bExport= */ true);
