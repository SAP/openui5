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

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *            oRenderManager the RenderManager that can be used for writing to
 *            the Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *            oControl an object representation of the control that should be
 *            rendered
 */
sap.m.InputRenderer.render = function(rm, oInput) {
	// return immediately if control is invisible
	var _placeholder = "";
	
	if (!oInput.getVisible()) {
		return;
	}

	var sType = oInput.getType();

	if(jQuery.os.ios) {
		rm.write("<input ");
	} else {
		rm.write("<div ");
	}

	rm.writeControlData(oInput);

	if (oInput.getWidth()) {
		rm.writeAttribute("style", "width:" + oInput.getWidth() + ";");
	}

	if (!jQuery.os.ios) {
		rm.addClass("sapMInput");

		if (!oInput.getEnabled()) {
			rm.addClass("sapMInputDisabled");
		}

		if (oInput.getValueState() == "Error") {
			rm.addClass("sapMInputError");
		} else if (oInput.getValueState() == "Warning") {
			rm.addClass("sapMInputWarning");
		}

		rm.writeClasses();
		rm.write(">");
		rm.write("<input id="+oInput.getId()+'-inner');
		if (oInput.getWidth()) {
			rm.writeAttribute("style", "width:" + oInput.getWidth() + ";");
		} else {
			rm.writeAttribute("style", "width: 100%;");
		}
	}
	if (!oInput.getEnabled()) {
		rm.writeAttribute ("disabled","disabled");
		if(sType == "Password"){
			// required for JAWS reader on password fields on desktop:
			rm.writeAttribute ("readonly","readonly");
		}
		rm.addClass("sapMInputDisabled");
	}


	if (oInput.getPlaceholder()) {
		_placeholder = oInput.getPlaceholder(); 
	}

	if (sType) {
		if (sType == "Date") {
			if (oInput.getPlaceholder()) {
			//TODO Warning in log: No placeholder for date!
			}
			if (oInput._datePickerAvailable){
				oInput._datepicker = true;
				rm.writeAttribute("type", "date");
			} else {
				oInput._datepicker = false;
				rm.writeAttribute("type", "text");
				if (oInput.getDateFormat()){
					_placeholder = oInput.getDateFormat(); 
				} else {
					_placeholder = "YYYY-MM-dd";
				}
				//TODO translate yyyymmdd
			}
		} else {
			rm.writeAttribute("type", sType.toLowerCase());
		}
	}

	if (_placeholder) {
		rm.writeAttributeEscaped("placeholder", _placeholder);
	}

	if (oInput.getMaxLength()) {
		rm.writeAttribute("maxLength", oInput.getMaxLength());
	}

	if (oInput.getValue()) {
		rm.writeAttributeEscaped("value", oInput._formatForRendering(oInput.getValue()));
	}

	if(!jQuery.os.ios) {
		rm.addClass("sapMInputInner");
		if (oInput.getValueState() == "Error") {
			rm.addClass("sapMInputErrorInner");
		} else if (oInput.getValueState() == "Warning") {
			rm.addClass("sapMInputWarningInner");
		}
	} else {
		rm.addClass("sapMInput");
		if (oInput.getValueState() == "Error") {
			rm.addClass("sapMInputError");
		} else if (oInput.getValueState() == "Warning") {
			rm.addClass("sapMInputWarning");
		}
	} 
	if (!oInput.getEnabled()) {
		rm.addClass("sapMInputDisabled");
	}

	rm.writeClasses();
	rm.write("></input>");

	if(!jQuery.os.ios) {
		rm.write("</div>");
	}
};

