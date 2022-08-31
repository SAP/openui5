/*!
 * ${copyright}
 */

// provides default renderer for sap.ui.suite.TaskCircle
sap.ui.define(['sap/ui/core/Core', './library', "sap/ui/core/Configuration"],
	function(Core, library, Configuration) {
	"use strict";


	// shortcut
	var TaskCircleColor = library.TaskCircleColor;

	/**
	 * TaskCircle renderer.
	 * @namespace
	 */
	var TaskCircleRenderer = function() {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.suite.TaskCircle} oControl an object representation of the control that should be rendered
	 */
	TaskCircleRenderer.render = function(oRenderManager, oControl){
	    // convenience variable
		var rm = oRenderManager;

	    //calculate pixel size
		var minvalue = oControl.getMinValue();
		var maxvalue = oControl.getMaxValue();
		var value = oControl.getValue();
		if (minvalue < 0) {
			minvalue = 0;
		}
		if (maxvalue < 0) {
			maxvalue = 1;
		}
		if (value < 0) {
			value = 0;
		}
		var valuestring = value.toString();
	    var color = oControl.getColor();
	    var style = 'sapUiTaskCircleColorGray';

	    switch (color) {
	       case TaskCircleColor.Red:
	          style = 'sapUiTaskCircleColorRed';
	          break;
	       case TaskCircleColor.Yellow:
	          style = 'sapUiTaskCircleColorYellow';
	          break;
	       case TaskCircleColor.Green:
	          style = 'sapUiTaskCircleColorGreen';
	          break;
	       case TaskCircleColor.Gray:
	          style = 'sapUiTaskCircleColorGray';
	          break;
	    }
	    if (value < minvalue) {
				minvalue = value;
	    }
	    if (value > maxvalue) {
				maxvalue = value;
	    }

	    var psmall = 24;
	    if (minvalue > 10) {
				psmall = 32;
	    }
	    if (minvalue > 100) {
				psmall = 46;
	    }
	    var plarge = 62;

	    var circlesize = parseInt(Math.sqrt((value - minvalue) / (maxvalue - minvalue) * (plarge * plarge - psmall * psmall) + psmall * psmall));

	    var digits = (value + '').length;
	    var fontsize = circlesize * 0.55;
	    if (digits > 1) {
	       fontsize = circlesize / digits;
	    }

		// write the HTML into the render manager
	    rm.write("<div");
	    rm.writeControlData(oControl);
	    rm.writeAttribute('tabindex', '0');

		if (oControl.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
		} else {
			rm.writeAttributeEscaped("title", valuestring);
		}

	    //ARIA
	    if ( Configuration.getAccessibility()) {
		  rm.writeAttribute('role', 'progressbar');
	      rm.writeAccessibilityState(oControl, {valuemin: minvalue});
		  rm.writeAccessibilityState(oControl, {valuemax: maxvalue});
		  rm.writeAccessibilityState(oControl, {valuenow: value});
		}

	    rm.writeAttribute("class","sapUiTaskCircle " + style);

		rm.addStyle("width", circlesize + "px");
		rm.addStyle("height", circlesize + "px");
		rm.addStyle("line-height", circlesize + "px");
		rm.addStyle("font-size", parseInt(fontsize) + "px");
		rm.addStyle("border-radius", circlesize + "px");
		rm.addStyle("-moz-border-radius", circlesize + "px");
	    rm.writeClasses();
		rm.writeStyles();
	    rm.write(">");
	    rm.write(value);
	    rm.write("</div>");
	};


	return TaskCircleRenderer;

}, /* bExport= */ true);