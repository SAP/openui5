sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller)
{
	"use strict";
	return Controller.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.Test",
	{
		handlePress: function(oEvent)
		{
			var oField = this.getView().byId("field");
			if (oField.getTextFirst() === "x")
			{
				oField.setTextFirst("y");
			}
			else
			{
				oField.setTextFirst("x");
			}
		}
	});
});
