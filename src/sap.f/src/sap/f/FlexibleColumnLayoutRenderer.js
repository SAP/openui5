/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device", "sap/ui/core/Core", "sap/m/library"],
	function (Device, Core, mobileLibrary) {
		"use strict";

		var oResourceBundle = Core.getLibraryResourceBundle("sap.f");

		var FCLRenderer = {
			apiVersion: 2
		};

		FCLRenderer.render = function (oRm, oControl) {

			var sBackgroundDesign = oControl.getBackgroundDesign(),
				oLandmarkInfo = oControl.getLandmarkInfo();

			oRm.openStart("div", oControl);
			oRm.class("sapFFCL");

			if (sBackgroundDesign !== mobileLibrary.BackgroundDesign.Transparent) {
				oRm.class("sapFFCLBackgroundDesign" + sBackgroundDesign);
			}

			oRm.openEnd();

			FCLRenderer.renderBeginColumn(oRm, oControl, oLandmarkInfo);
			FCLRenderer.renderSeparator(oRm, oControl.getId() + "-separator-begin", "sapFFCLColumnSeparatorBegin");
			FCLRenderer.renderMidColumn(oRm, oControl, oLandmarkInfo);
			FCLRenderer.renderSeparator(oRm, oControl.getId() + "-separator-end", "sapFFCLColumnSeparatorEnd");
			FCLRenderer.renderEndColumn(oRm, oControl, oLandmarkInfo);

			FCLRenderer.renderOverlay(oRm, oControl);

			oRm.close("div");
		};

		FCLRenderer.renderBeginColumn = function (oRm, oControl, oLandmarkInfo) {
			// Begin column
			oRm.openStart("div", oControl.getId() + "-beginColumn");
			oRm.accessibilityState(oControl, oControl._formatColumnLandmarkInfo(oLandmarkInfo, "FirstColumn"));
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnBegin");
			oRm.class("sapFFCLColumnActive");
			oRm.openEnd();

			// Begin column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			oRm.close("div");
		};

		FCLRenderer.renderMidColumn = function (oRm, oControl, oLandmarkInfo) {
			// Mid column
			oRm.openStart("div", oControl.getId() + "-midColumn");
			oRm.accessibilityState(oControl, oControl._formatColumnLandmarkInfo(oLandmarkInfo, "MiddleColumn"));
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnMid");
			oRm.openEnd();

			// Mid column content
			FCLRenderer.renderColumnContentWrapper(oRm);
			oRm.close("div");
		};

		FCLRenderer.renderEndColumn = function (oRm, oControl, oLandmarkInfo) {
			// End column
			oRm.openStart("div", oControl.getId() + "-endColumn");
			oRm.accessibilityState(oControl, oControl._formatColumnLandmarkInfo(oLandmarkInfo, "LastColumn"));
			oRm.class("sapFFCLColumn");
			oRm.class("sapFFCLColumnEnd");
			oRm.openEnd();

			// End column content
			FCLRenderer.renderColumnContentWrapper(oRm);

			oRm.close("div");
		};

		/**
		 * Renders a single bar.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {string} sBarId The ID of the bar
		 * @param {string} sClass The CSS class of the bar
		 */
		FCLRenderer.renderSeparator = function (oRm, sBarId, sClass) {
			if (!Device.system.phone) {
				oRm.openStart("div", sBarId)
					.attr("role", "separator")
					.attr("title", oResourceBundle.getText("FCL_SEPARATOR_MOVE"))
					.attr("aria-orientation", "vertical")
					.attr("tabindex", 0)
					.class("sapFFCLColumnSeparator")
					.class("sapContrastPlus")
					.class(sClass)
					.openEnd();

				FCLRenderer.renderSeparatorGripAndDecorations(oRm);

				oRm.close("div");
			}
		};

		/**
		 * Renders the grip and the decorations for a bar.
		 *
		 * @param {sap.ui.core.RenderManager} oRm RenderManager that can is used for writing to the render output buffer
		 * @param {boolean} bHorizontal Whether the orientation of the Splitter is horizontal
		 */
		FCLRenderer.renderSeparatorGripAndDecorations = function(oRm) {
			oRm.openStart("div")
				.class("sapFFCLColumnSeparatorDecorationBefore") // TODO class name
				.openEnd()
				.close("div");

			oRm.openStart("div")
				.class("sapFFCLColumnSeparatorGrip") // TODO class name
				.openEnd()
					.icon("sap-icon://vertical-grip", ["sapFFCLColumnSeparatorGripIcon"])
				.close("div");

			oRm.openStart("div")
				.class("sapFFCLColumnSeparatorDecorationAfter") // TODO class name
				.openEnd()
				.close("div");
		};

		FCLRenderer.renderColumnContentWrapper = function (oRm) {
			oRm.openStart("div");
			oRm.class("sapFFCLColumnContent");
			oRm.openEnd();
			oRm.close("div");
		};

		FCLRenderer.renderOverlay = function (oRm, oControl) {
			if (!Device.system.phone) {
				oRm.openStart("div", oControl.getId() + "-overlay")
				.class("sapFFCLOverlay")
				.openEnd();

				FCLRenderer.renderSeparator(oRm, oControl.getId() + "-overlaySeparator", "sapFFCLOverlaySeparator");

				oRm.close("div");
			}
		};

		return FCLRenderer;

	}, /* bExport= */ true);
