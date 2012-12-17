/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.InputRenderer");

/**
 * @class Input renderer.
 * @static
 */
sap.m.InputRenderer = {};

sap.m.InputRenderer.render = function(rm, oInput) {

	if(!oInput.getVisible()) {
		return;
	}

	rm.write("<div ");
	rm.writeControlData(oInput);
	oInput.getWidth() && rm.addStyle("width", oInput.getWidth()) && rm.writeStyles();
	!oInput.getEnabled() && rm.addClass("sapMInputDisabled");
	oInput.getValueState() != "None" && rm.addClass("sapMInput" + oInput.getValueState());
	rm.addClass("sapMInput");
	rm.writeClasses();
	rm.write(">");

	// enable self-made placeholder
	if (oInput._showLabelAsPlaceholder) {
		rm.write("<label ");
		rm.writeAttribute("id", oInput.getId() + "-placeholder");
		rm.writeAttribute("for", oInput.getId() + "-inner");
		rm.addClass("sapMInputPlaceholder");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oInput.getPlaceholder());
		rm.write("</label>");
	}

	rm.write("<input id=" + oInput.getId() + "-inner");
	rm.writeStyles();

	if (!oInput.getEnabled()) {
		rm.writeAttribute ("disabled", "disabled");
		if (oInput.getType() == "Password") {
			// required for JAWS reader on password fields on desktop:
			rm.writeAttribute("readonly", "readonly");
		}
		rm.addClass("sapMInputDisabled");
	}

	// let the browser handle placeholder
	if (!oInput._showLabelAsPlaceholder && oInput.getPlaceholder()) {
		rm.writeAttribute("placeholder", oInput.getPlaceholder());
	}

	// check element needs picker and known picker bug exists
	if (oInput._hasPickerBug && oInput._pickers.indexOf(oInput.getType()) + 1) {
		rm.writeAttribute("type", "text");
	} else if (oInput.getType() == "Date") {
		rm.writeAttribute("type", oInput._datePickerAvailable ? "date" : "text");
	} else {
		rm.writeAttribute("type", oInput.getType().toLowerCase());
	}

	oInput.getMaxLength() > 0 && rm.writeAttribute("maxlength", oInput.getMaxLength());
	oInput.getValue() && rm.writeAttributeEscaped("value", oInput._formatForRendering(oInput.getValue()));

	rm.addClass("sapMInputInner");
	oInput.getValueState() != "None" && rm.addClass("sapMInput" + oInput.getValueState() + "Inner");
	!oInput.getEnabled() && rm.addClass("sapMInputDisabled");
	rm.writeClasses();
	rm.write("></div>");
};