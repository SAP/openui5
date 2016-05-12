/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * <code>StepInput renderer<code>
	 * @namespace
	 */
	var StepInputRenderer = {};


		StepInputRenderer.render = function (oRm, oControl) {
			var oIncrementButton = oControl._getIncrementButton(),
				oDecrementButton = oControl._getDecrementButton(),
				oInput = oControl._getInput(),
				sWidth = oControl.getWidth(),
				bEnabled = oControl.getEnabled(),
				bEditable = oControl.getEditable();

			oRm.write("<div");
			bEnabled && bEditable && oRm.write(" tabindex='1'");
			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
			oRm.writeControlData(oControl);
			oRm.writeAccessibilityState(oControl);
			oRm.addClass("sapMStepInput");
			oRm.addClass("sapMStepInput-CTX");
			!bEnabled && oRm.addClass("sapMStepInputReadOnly");
			!bEditable && oRm.addClass("sapMStepInputDisabled");
			oRm.writeClasses();
			oRm.write(">");

			if (bEditable) {
				this.wrapButtons(oRm, oDecrementButton, ["sapMStepInputBtnDecrease"]);
			}

			oRm.renderControl(oInput);

			if (bEditable) {
				this.wrapButtons(oRm, oIncrementButton, ["sapMStepInputBtnIncrease"]);
			}

			oRm.write("</div>");
		};

	StepInputRenderer.wrapButtons = function (oRm, oControl, aClasses) {
		oRm.write("<div tabindex='-1'");
		oRm.addClass("sapMStepInputBtnWrapper");
		aClasses.forEach(function (sClass) {
			oRm.addClass(sClass);
		});
		oRm.writeClasses();
		oRm.write(">");

		oRm.renderControl(oControl);
		oRm.write("</div>");
	};

	return StepInputRenderer;

}, /* bExport= */ true);