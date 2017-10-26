/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * <code>StepInput renderer</code>
	 * @namespace
	 */
	var StepInputRenderer = {};


		StepInputRenderer.render = function (oRm, oControl) {
			var oInput = oControl._getInput(),
				sWidth = oControl.getWidth(),
				bEnabled = oControl.getEnabled(),
				bEditable = oControl.getEditable();

			oRm.write("<div ");
			if (bEnabled && bEditable) {
				oRm.write("tabindex='-1'");
			}

			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
			oRm.writeControlData(oControl);
			oRm.writeAccessibilityState(oControl);
			oRm.addClass("sapMStepInput");
			oRm.addClass("sapMStepInput-CTX");
			!bEnabled && oRm.addClass("sapMStepInputReadOnly");
			!bEditable && oRm.addClass("sapMStepInputNotEditable");
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oInput);

			oRm.write("</div>");
		};

	return StepInputRenderer;

}, /* bExport= */ true);