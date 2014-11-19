jQuery.sap.declare("patternApp.Component");

sap.ui.core.UIComponent.extend("patternApp.Component", {

	createContent : function () {
		return sap.ui.view({
			viewName : "patternApp.view.PatternTable",
			type : "XML"
		});
	}

});