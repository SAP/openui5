jQuery.sap.declare("appUnderTest.Component");

sap.ui.core.UIComponent.extend("appUnderTest.Component", {

	createContent : function () {
		return sap.ui.view({
			viewName : "view.Main",
			type : "XML"
		});
	}

});