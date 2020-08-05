sap.ui.define([], function () {
	"use strict";
	var VSR = {};
	VSR.render = function (oRm, oControl) {
		oRm.openStart("ul");
		oRm.addClass("sapMProcessLane");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.writeElementData(oControl);

		var aSteps = oControl.getSteps();
		var iLength = aSteps.length;
		if (iLength === 0) {
			oRm.addStyle("display", "none");
		}
		oRm.openEnd();
		for (var i = 0; i < iLength; i++) {
			var oStep = aSteps[i];
			var sStatus = oStep.getStatus();
			oRm.openStart("li");
			oRm.addClass("sapMProcessLaneStep");
			if (sStatus === "Disabled") {
				oRm.addClass("disabled");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oStep);
			oRm.openEnd();

			oRm.openStart("div");
			oRm.addClass("sapMProcessLaneStepHeader");
			if (sStatus === "Ready") {
				oRm.addClass("clickable");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();

			oRm.openStart("span");
			oRm.addClass("sapSquareS");
			oRm.addClass("sapCircleClose");
			if (sStatus === "Ready" && oControl.getSelectedIndex() === i) {
				oRm.addClass("sapActiveBG");
			} else if (sStatus === "Completed") {
				oRm.addClass("sapSuccessBG");
			} else if (sStatus === "Ready"){
				oRm.addClass("sapNormalBG");
				oRm.addClass("sapDisabledBorder");
			} else if (sStatus === "Disabled"){
				oRm.addClass("sapDisabledBG");
				oRm.addClass("sapDisabledBorder");
			}
			oRm.addClass("sapBorderS");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();
				oRm.openStart("span");
				oRm.addClass("sapUiIcon");
				if (sStatus === "Completed") {
					oRm.addStyle("font-family", "sap-icons");
					oRm.writeAttribute("data-sap-ui-icon-content", "&#xe05b;");
				} else {
					if (oControl.getSteps() && oControl.getSteps().length === 1) {
						oRm.addStyle("font-family", "sap-icons");
						oRm.writeAttribute("data-sap-ui-icon-content", "&#xe1a7;");
					} else {
						oRm.addStyle("font-family", "Arial");
						oRm.writeAttribute("data-sap-ui-icon-content", (i + 1) + "");
					}
				}
				oRm.writeAttribute("role","presentation");
				oRm.writeAttribute("aria-hidden","true");
				oRm.writeAttribute("aria-label","Image placeholder");
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.openEnd();
				oRm.close("span");

			oRm.close("span");

			oRm.openStart("span");
			oRm.addClass("sapMProcessLaneStepHeaderText");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();

				oRm.openStart("div");
				oRm.addClass("sapMTitle");
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.openEnd();
				oRm.writeEscaped(oStep.getTitle());
				oRm.close("div");

			oRm.close("span");
			oRm.close("div");

			oRm.openStart("div");
			oRm.addClass("sapMProcessLaneStepContent");
			if (i < aSteps.length - 1) {
				oRm.addClass("nextSolid");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();
			var sDescription = oStep.getDescription();
			if (sDescription) {
				oRm.openStart("div");
				oRm.addClass("sapMText");
				oRm.addClass("description");
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.openEnd();
				oRm.writeEscaped(sDescription);
				oRm.close("div");
			}
			oRm.openStart("div");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();

			if (i === oControl.getSelectedIndex() && oStep.getStepContent()) {
				var fStepContent = oStep.getStepContent();
				var oContent = fStepContent();
				if (oContent) {
					oRm.openStart("div");
					oRm.writeClasses();
					oRm.writeStyles();
					oRm.openEnd();
					oRm.renderControl(oContent);
					oRm.close("div");
				} else {
					oRm.openStart("div");
					oRm.addClass("placeholder");
					oRm.writeClasses();
					oRm.openEnd();
					oRm.close("div");
				}
			}
			oRm.close("div");
			oRm.close("div");

			oRm.close("li");
		}
		oRm.close("ul");
	};
	return VSR;
});
