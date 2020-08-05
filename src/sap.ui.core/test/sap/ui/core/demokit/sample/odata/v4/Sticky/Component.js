/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component: Consumption of an OData V4 service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (library, UIComponent, JSONModel) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.core.sample.odata.v4.Sticky.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			return sap.ui.view({
				async : true,
				models : {
					undefined : this.getModel(),
					ui : new JSONModel({iMessages : 0, bSticky : false})
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.Sticky.Main"
			});
		}
	});
});
