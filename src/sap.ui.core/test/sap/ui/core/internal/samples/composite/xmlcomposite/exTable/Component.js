sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function(UIComponent, JSONModel, ResourceModel)
{
	"use strict";
	return UIComponent.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTable.Component",
	{
		metadata:
		{
			rootView: "sap.ui.core.internal.samples.composite.xmlcomposite.exTable.Test"
		},
		init: function()
		{

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

		}
	});
});
