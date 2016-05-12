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
			oRm.addClass("sapMFCL");
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
			oRm.addClass("sapMFCLColumn").addClass("sapMFCLColumnBegin").addClass("sapMFCLColumnActive");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// Begin column container
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-beginColumn-container");
			oRm.addClass("sapMFCLContainer");
			oRm.writeClasses();
			oRm.write(">");
			if (oControl.getBeginColumn()) {
				oRm.renderControl(oControl.getBeginColumn());
			}
			oRm.write("</div>");

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
			oRm.addClass("sapMFCLColumn").addClass("sapMFCLColumnMid");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// Mid column container
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-midColumn-container");
			oRm.addClass("sapMFCLContainer");
			oRm.writeClasses();
			oRm.write(">");
			if (oControl.getMidColumn()) {
				oRm.renderControl(oControl.getMidColumn());
			}
			oRm.write("</div>");

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
			oRm.addClass("sapMFCLColumn").addClass("sapMFCLColumnEnd");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// End column container
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-endColumn-container");
			oRm.addClass("sapMFCLContainer");
			oRm.writeClasses();
			oRm.write(">");
			if (oControl.getEndColumn()) {
				oRm.renderControl(oControl.getEndColumn());
			}
			oRm.write("</div>");

			// Arrow - right
			oRm.renderControl(oEndColumnForwardArrow);

			oRm.write("</div>");
		};

		return FCLRenderer;

	}, /* bExport= */ true);
