/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.TextAreaRenderer");

/**
 * @class TextArea renderer.
 * @static
 */
sap.m.TextAreaRenderer = {};


/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager}
 *            oRm the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oTextArea an object representation of the control that should be
 *            rendered
 */
sap.m.TextAreaRenderer.render = function(oRm, oTextArea) {

	// To inherit all styles from input
	// TODO: Check if there is a better way with LESS
	var sRootClass = "sapMInput";

	// if not visible then do not render
	if (!oTextArea.getVisible()) {
		return;
	}

	// write control data
	oRm.write("<textarea");
	oRm.writeControlData(oTextArea);

	// check if we need to add styles
	oTextArea.getHeight() && oRm.addStyle("height", oTextArea.getHeight());
	oTextArea.getWidth() && oRm.addStyle("width", oTextArea.getWidth());
	oRm.writeStyles();

	// add required classes
	!oTextArea.getEnabled() && oRm.addClass(sRootClass + "Disabled") && oRm.writeAttribute("disabled", true);
	oTextArea.getValueState() != "None" && oRm.addClass(sRootClass + oTextArea.getValueState());
	oRm.addClass(sRootClass);
	oRm.writeClasses();

	// write attributes
	oRm.writeAttribute("rows", oTextArea.getRows());
	oRm.writeAttribute("cols", oTextArea.getCols());
	oTextArea.getMaxLength() > 0 && oRm.writeAttribute("maxlength", oTextArea.getMaxLength());
	oTextArea.getPlaceholder() && oRm.writeAttributeEscaped("placeholder", oTextArea.getPlaceholder());
	oTextArea.getWrapping() && oTextArea.getWrapping() != "None" && oRm.writeAttribute("wrap", oTextArea.getWrapping());

	// write value
	oRm.write(">");
	oRm.writeEscaped(oTextArea.getValue());
	oRm.write("</textarea>");
};

