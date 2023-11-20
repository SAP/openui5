/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.TextView
sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/commons/library'],
	function(Renderer, library) {
	"use strict";

	// shortcut for sap.ui.commons.TextViewDesign
	var TextViewDesign = library.TextViewDesign;

	// shortcut for sap.ui.commons.TextViewColor
	var TextViewColor = library.TextViewColor;

	/**
	 * TextView renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var TextViewRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oTextView An object representation of the control that should be rendered.
	 */
	TextViewRenderer.render = function(rm, oTextView) {
		//Sets the text as enables/disabled and applies if any semantic colors are set
		this.applyEnabledStyles(rm, oTextView);

		// Sets the styles of the TextView
		this.applyTextDesign(rm, oTextView);

		if (!oTextView.getWrapping()) {
			rm.addClass("sapUiTvWrap");
		}

		if (oTextView.getWidth()) {
			rm.addStyle("width", oTextView.getWidth());
		}

		rm.write("<span");
		rm.writeControlData(oTextView);

		rm.addClass("sapUiTv");

		if (oTextView.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oTextView.getTooltip_AsString());
		} else if (oTextView.getText()) {
			rm.writeAttributeEscaped("title", oTextView.getText());
		}

		// Appearance
		var sTextDir = oTextView.getTextDirection();
		if (sTextDir) {
			rm.addStyle("direction", sTextDir.toLowerCase());
		}

		var sAlign = TextViewRenderer.getTextAlign(oTextView.getTextAlign(), sTextDir);
		if (sAlign) {
			// use class because it's easier to overwrite
			sAlign = sAlign.charAt(0).toUpperCase() + sAlign.substring(1);
			rm.addClass("sapUiTvAlign" + sAlign);
		}

		// Make control focusable via tab
		// according to Stefan Schnabel there shall not be a tabstop   rm.writeAttribute('tabindex', tabIndex);
		rm.writeAttribute('tabindex', '-1'); //to make it focusable in ItemNavigation
		// Set Accessible Role
		rm.writeAccessibilityState(oTextView, {
			role: oTextView.getAccessibleRole() ? oTextView.getAccessibleRole().toLowerCase() : undefined,
			invalid: oTextView.getSemanticColor() == TextViewColor.Negative,
			disabled: !oTextView.getEnabled()
		});

		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");
		rm.writeEscaped(oTextView.getText(), true);
		rm.write("</span>");

	};

	/**
	 * Sets the design of the TextView if something other than the general style is set
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oTextView An object representation of the control that should be rendered.
	 */
	TextViewRenderer.applyTextDesign = function(oRm, oTextView) {
		var oDesign = oTextView.getDesign();

		if (oDesign == TextViewDesign.Standard) {
		    return;
		}

		switch (oDesign) {
			case (TextViewDesign.Bold):
				oRm.addClass("sapUiTvEmph");
				break;
			case (TextViewDesign.H1):
				oRm.addClass("sapUiTvH1");
				break;
			case (TextViewDesign.H2):
				oRm.addClass("sapUiTvH2");
				break;
			case (TextViewDesign.H3):
				oRm.addClass("sapUiTvH3");
				break;
			case (TextViewDesign.H4):
				oRm.addClass("sapUiTvH4");
				break;
			case (TextViewDesign.H5):
				oRm.addClass("sapUiTvH5");
				break;
			case (TextViewDesign.H6):
				oRm.addClass("sapUiTvH6");
				break;
			case (TextViewDesign.Italic):
				oRm.addClass("sapUiTvItalic");
				break;
			case (TextViewDesign.Small):
				oRm.addClass("sapUiTvSmall");
				break;
			case (TextViewDesign.Monospace):
				oRm.addClass("sapUiTvMono");
				break;
			case (TextViewDesign.Underline):
				oRm.addClass("sapUiTvULine");
				break;
			default:
				break;
		}
	};

	/**
	 * Sets the TextView as enabled/disabled and changes the color of the text if any semantic styles are set
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oTextView An object representation of the control that should be rendered.
	 */
	TextViewRenderer.applyEnabledStyles = function(oRm, oTextView) {
		// Enable/disable
		if (!oTextView.getEnabled()) {
			oRm.addClass("sapUiTvDsbl");
			oTextView.allowTextSelection(false);
		} else {
			// Show error/warning states if they are enabled
			// error/warning state
			switch (oTextView.getSemanticColor()) {
				case (TextViewColor.Negative) :
					oRm.addClass('sapUiTvErr');
					break;
				case (TextViewColor.Positive) :
					oRm.addClass('sapUiTvSucc');
					break;
				case (TextViewColor.Critical) :
					oRm.addClass('sapUiTvWarn');
					break;
				// no default
			}
		}
	};

	/**
	 * Dummy inheritance of static methods/functions.
	 * @see sap.ui.core.Renderer.getTextAlign
	 * @private
	 */
	TextViewRenderer.getTextAlign = Renderer.getTextAlign;

	return TextViewRenderer;

}, /* bExport= */ true);
