/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/library"],
	function(coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.Orientation
	var Orientation = coreLibrary.Orientation;

	/**
	 * Splitter renderer.
	 * @namespace
	 */
	var SplitterRenderer = {
	};

	/**
	 * Renders the main HTML element for the Splitter control and everything else is rendered in a
	 * hidden area inside the splitter. The content of that hidden area is shown after rendering to
	 * avoid flickering.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	SplitterRenderer.render = function(oRm, oControl){
		var bHorizontal       = oControl.getOrientation() === Orientation.Horizontal;
		var sOrientationClass = bHorizontal ? "sapUiLoSplitterH" : "sapUiLoSplitterV";
		var bAnimate          = sap.ui.getCore().getConfiguration().getAnimation();


		// Make sure we have the main element available before rendering the children so we can use
		// the element width to calculate before rendering the children.
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiLoSplitter");
		oRm.addClass(sOrientationClass);
		if (bAnimate && !oControl._liveResize) {
			// Do not animate via CSS when liveResize is enabled
			oRm.addClass("sapUiLoSplitterAnimated");
		}
		oRm.writeClasses();
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">"); // main div

		this.renderInitialContent(oRm, oControl);

		oRm.write("</div>"); // main control
	};

	SplitterRenderer.renderInitialContent = function(oRm, oControl) {
		var sId         = oControl.getId();
		var bHorizontal = oControl.getOrientation() === Orientation.Horizontal;
		var sSizeType   = bHorizontal ? "width" : "height";
		var aContents = oControl._getContentAreas();
		var iLen = aContents.length;
		var aCalculatedSizes = oControl.getCalculatedSizes();

		for (var i = 0; i < iLen; ++i) {
			var oLayoutData = aContents[i].getLayoutData();
			var sSize = "0";
			if (aCalculatedSizes[i]) {
				// Use precalculated sizes if available
				sSize = aCalculatedSizes[i] + "px";
			} else if (oLayoutData) {
				sSize = oLayoutData.getSize();
			}

			// Render content control
			oRm.write(
				"<section " +
				"id=\"" + sId + "-content-" + i + "\" " +
				"style=\"" + sSizeType + ": " + sSize + ";\" " +
				"class=\"sapUiLoSplitterContent\">"
			);
			oRm.renderControl(aContents[i]);
			oRm.write("</section>");

			if (i < iLen - 1) {
				// Render splitter if this is not the last control
				oRm.write(
					"<div id=\"" + sId + "-splitbar-" + i + "\" " +
						"role=\"separator\" " +
						"title=\"" + oControl._getText("SPLITTER_MOVE") + "\" " +
						"class=\"sapUiLoSplitterBar\" " +
						"aria-orientation=\"" + (bHorizontal ? "vertical" : "horizontal") + "\" " +
						"tabindex=\"0\">"
				);

				this.renderSplitterBarGripAndDecorations(oRm, bHorizontal);
				oRm.write("</div>");
			}
		}

		oRm.write(
			"<div id=\"" + sId + "-overlay\" class=\"sapUiLoSplitterOverlay\" style=\"display: none;\">" +
			"<div id=\"" + sId + "-overlayBar\" class=\"sapUiLoSplitterOverlayBar\">"
		);

		this.renderSplitterBarGripAndDecorations(oRm, bHorizontal);

		oRm.write(
			"</div>" +
			"</div>"
		);
	};

	/**
	 * Renders the grip and the decorations for a bar.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can is used for writing to the render output buffer
	 * @param {boolean} bHorizontal Whether the orientation of the Splitter is horizontal
	 */
	SplitterRenderer.renderSplitterBarGripAndDecorations = function(oRm, bHorizontal) {
		var sIcon = bHorizontal ? "sap-icon://vertical-grip" : "sap-icon://horizontal-grip";

		oRm.write("<div");
		oRm.addClass("sapUiLoSplitterBarDecorationBefore");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapUiLoSplitterBarGrip");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeIcon(sIcon, ["sapUiLoSplitterBarGripIcon"]);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapUiLoSplitterBarDecorationAfter");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	return SplitterRenderer;

}, /* bExport= */ true);
