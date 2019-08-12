sap.ui.define([
"sap/ui/core/theming/Parameters"],
function(ThemeParameters) {
	"use strict";

	var HSR = {};

	// TODO: IE11 alternative using jQuery.base64.encode or equivalent
	var svgDefaultSHADOW = "drop-shadow(0 0 0.0625rem " + ThemeParameters.get("sapField_BorderColor") + ")";
	var svgDefaultBG = ThemeParameters.get("sapBaseColor");
	var svgDefaultBORDERC = ThemeParameters.get("sapField_BorderColor");
	var svgDefaultBORDERW = "0.01";
	var svgStep = {
		begin : '<svg style="filter:##SHADOW##" xmlns="http://www.w3.org/2000/svg" version="1.1" width="220px" height="70px"><path fill="none" style="stroke-linejoin: round; stroke: ##BORDERC##; stroke-width: ##BORDERW##; fill: ##BG##; fill-opacity: 1;" d="M 2 0 L 190 0 L 191 2 L 200 25 L 191 48 L 190 50 L 2 50 L 0 48 L 0 2 L 2 0" transform="translate(10,10)"></path></svg>',
		beginEnd : '<svg style="filter:##SHADOW##" xmlns="http://www.w3.org/2000/svg" version="1.1" width="220px" height="70px"><path fill="none" style="stroke-linejoin: round; stroke: ##BORDERC##; stroke-width: ##BORDERW##; fill: ##BG##; fill-opacity: 1;" d="M 2 0 L 190 0 L 191 2 L 191 48 L 190 50 L 2 50 L 0 48 L 0 2 L 2 0" transform="translate(10,10)"/></svg>',
		end : '<svg style="filter:##SHADOW##" xmlns="http://www.w3.org/2000/svg" version="1.1" width="220px" height="70px"><path fill="none" style="stroke-linejoin: round; stroke: ##BORDERC##; stroke-width: ##BORDERW##; fill: ##BG##; fill-opacity: 1;" d="M 0 0 L 200 0 L 200 50 L 0 50 L 10 25 L 0 0" transform="translate(10,10)"/></svg>',
		middle : '<svg style="filter:##SHADOW##" xmlns="http://www.w3.org/2000/svg" version="1.1" width="220px" height="70px"><path fill="none" style="stroke-linejoin: round; stroke: ##BORDERC##; stroke-width: ##BORDERW##; fill: ##BG##; fill-opacity: 1;" d="M 0 0 L 190 0 L 200 25 L 190 50 L 0 50 L 10 25 L 0 0" transform="translate(10,10)"/></svg>'
	};

	//get ThemeParameters
	HSR.activeBorderColor = ThemeParameters.get("sapHighlightColor");
	HSR.completedBorderColor = ThemeParameters.get("sapSuccessBorderColor");
	HSR.disabledBorderColor = ThemeParameters.get("sapContent_DisabledTextColor");
	HSR.hoverBackground = ThemeParameters.get("sapButton_Hover_Background");
	HSR.activeBackground = ThemeParameters.get("sapButton_Active_Background");

	HSR.getSvg = function (position, colors) {
		var s = svgStep[position];
		colors = colors || {};
		var bg = colors.backgroundColor || svgDefaultBG;
		var borderC = colors.borderColor || svgDefaultBORDERC;
		var borderW = colors.borderWidth || svgDefaultBORDERW;
		var shadow = colors.shadow || svgDefaultSHADOW;
		return window.btoa(s.replace("##BG##", bg).replace("##BORDERC##", borderC).replace("##BORDERW##", borderW).replace("##SHADOW##", shadow));
	};

	HSR.render = function(oRm, oControl) {
		var iSelectedIndex = oControl.getSelectedIndex();
		oRm.openStart("ul");
		oRm.addClass("sapMProcessStepBar");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.writeElementData(oControl);
		oRm.openEnd();
		var aSteps = oControl.getSteps();
		var iLength = aSteps.length;
		for (var i = 0; i < iLength; i++) {
			var oStep = aSteps[i];
			var sStatus = oStep.getStatus();
			oRm.openStart("li");
			if (i === iSelectedIndex) {
				oRm.addClass("selected");
			}
			var colors = HSR.getColors(sStatus, i === iSelectedIndex);
			if (sStatus === "Ready") {
				oRm.addClass("active");
			}
			if (sStatus === "Completed") {
				oRm.addClass("active");
			}
			if (i === 0 && iLength > 1) {
				oRm.addClass("begin");
				oRm.addStyle("background-image", "url('data:image/svg+xml;base64," + this.getSvg("begin", colors) + "')");
			} else if (i === 0 && iLength === 1) {
				oRm.addClass("beginend");
				oRm.addStyle("background-image", "url('data:image/svg+xml;base64," + this.getSvg("beginEnd", colors) + "')");
			} else if (i < iLength - 1) {
				oRm.addClass("middle");
				oRm.addStyle("background-image", "url('data:image/svg+xml;base64," + this.getSvg("middle", colors) + "')");
			} else {
				oRm.addStyle("background-image", "url('data:image/svg+xml;base64," + this.getSvg("end", colors) + "')");
				oRm.addClass("end");
			}
			if (sStatus === "Disabled") {
				oRm.addClass("disabled");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oStep);
			oRm.openEnd();

			oRm.openStart("div");
			oRm.addClass("sapMTitle");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();
			oRm.writeEscaped(oStep.getTitle());
			oRm.close("div");

			oRm.openStart("div");
			oRm.addClass("sapMText");
			oRm.addClass("sapMProcessStepDescription");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.openEnd();
			oRm.writeEscaped(oStep.getDescription());
			oRm.close("div");
			oRm.close("li");
		}
		oRm.close("ul");
	};
	HSR.getColors = function(sStatus, bSelected) {
		var colors = null;

		if (sStatus === "Ready") {
			colors = {};
			if (bSelected) {
				colors = {
					borderColor: this.activeBorderColor,
					borderWidth: "1"
				};
			}
		}
		if (sStatus === "Disabled") {
			colors = {
				borderColor: this.disabledBorderColor
			};
		}
		if (sStatus === "Completed") {
			colors = {
				borderColor: this.completedBorderColor,
				borderWidth: "1"
			};
			if (bSelected) {
				colors = {
					borderColor: this.completedBorderColor,
					borderWidth: "1"
				};
			}
		}
		return colors;
	};
	return HSR;
});
