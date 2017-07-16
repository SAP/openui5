sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function(UIComponent, JSONModel, ResourceModel)
{
	"use strict";
	return UIComponent.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.Component",
	{
		metadata:
		{
			rootView: "sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.Test"
		},
		init: function()
		{
			jQuery.sap.require("sap.ui.core.FragmentControl");
			sap.ui.core.util.XMLPreprocessor.plugIn(function(oNode, oVisitor)
			{
				sap.ui.core.FragmentControl.initialTemplating(oNode, oVisitor, "sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.comp.field");
			}, "sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.comp", "field");

			var oViewSettings = {
				async: true,
				viewName: "sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.Test",
				preprocessors:
				{
					xml:
					{
						models:
						{

						}
					}
				}
			};

			sap.ui.xmlview(oViewSettings).placeAt("content");

			// set data model
			var oData = {
				text: "Hello",
				value: "World"
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

		}

	});
});
