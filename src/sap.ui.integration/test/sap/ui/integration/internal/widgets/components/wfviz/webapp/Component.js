sap.ui.define(["sap/ui/integration/WidgetComponent", "sap/ui/core/theming/Parameters"], function(WidgetComponent, ThemeParameters) {
	"use strict";
	var WfVizWidgetComponent = WidgetComponent.extend("sap.my.test.widget.wfviz.Component");

	//include css variables
	var oStyle = document.createElement("style");
	var aVariables = [];
	aVariables.push("--sapBaseColor: " + ThemeParameters.get("sapBaseColor"));
	aVariables.push("--sapHighlightColor: " + ThemeParameters.get("sapHighlightColor"));
	aVariables.push("--sapSuccessBorderColor: " + ThemeParameters.get("sapSuccessBorderColor"));
	aVariables.push("--sapContent_DisabledTextColor: " + ThemeParameters.get("sapContent_DisabledTextColor"));
	aVariables.push("--sapButton_Hover_Background: " + ThemeParameters.get("sapButton_Hover_Background"));
	aVariables.push("--sapButton_Active_Background: " + ThemeParameters.get("sapButton_Active_Background"));
	aVariables.push("--sapContent_DisabledTextColor: " + ThemeParameters.get("sapContent_DisabledTextColor"));
	aVariables.push("--sapButton_Emphasized_Background: " + ThemeParameters.get("sapButton_Emphasized_Background"));
	aVariables.push("--sapButton_Emphasized_TextColor: " + ThemeParameters.get("sapButton_Emphasized_TextColor"));
	aVariables.push("--sapTextColor: " + ThemeParameters.get("sapTextColor"));
	aVariables.push("--sapField_SuccessColor: " + ThemeParameters.get("sapField_SuccessColor"));
	aVariables.push("--sapField_SuccessBackground: " + ThemeParameters.get("sapField_SuccessBackground"));
	aVariables.push("--sapLink_Hover_Color: " + ThemeParameters.get("sapLink_Hover_Color"));
	oStyle.innerHTML = ".wfvizWidget { " + aVariables.join(";") + "}";
	document.head.appendChild(oStyle);
	//include the stylesheet
	var oLink = document.createElement("link");
	oLink.setAttribute("href", jQuery.sap.getModulePath("sap.my.test.widget.wfviz.controls.resources") + "/styles.css");
	oLink.setAttribute("rel", "stylesheet");
	document.head.appendChild(oLink);

	return WfVizWidgetComponent;
});
