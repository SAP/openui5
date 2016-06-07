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
				bEditable = oControl.getEditable(),
				fMin = oControl.getMin(),
				fMax = oControl.getMax(),
				fValue = oControl.getValue(),
				bDisableButton = false;

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

			if (bEditable && oDecrementButton) {
				bDisableButton = !bEnabled || (fValue <= fMin);
				this.renderButton(oRm, oDecrementButton, ["sapMStepInputBtnDecrease"], bDisableButton);
			}

			oRm.renderControl(oInput);

			if (bEditable && oIncrementButton) {
				bDisableButton = !bEnabled || (fValue >= fMax);
				this.renderButton(oRm, oIncrementButton, ["sapMStepInputBtnIncrease"], bDisableButton);
			}

			oRm.write("</div>");
		};

		StepInputRenderer.renderButton = function (oRm, oButton, aWrapperClasses, bDisableButton) {
			oButton.addStyleClass("sapMStepInputBtn");

			aWrapperClasses.forEach(function (sClass) {
				oButton.addStyleClass(sClass);
			});

			if (bDisableButton) {
				oButton.addStyleClass("sapMStepInputIconDisabled");
			}
			oRm.renderControl(oButton);
		};

	return StepInputRenderer;

}, /* bExport= */ true);