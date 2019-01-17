/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on products from the zui5_epm_sample
 * OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (UIComponent, BaseComponent, JSONModel, TestUtils) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.Products.Component", {
		metadata : {
			manifest : "json"
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.Products.sandbox").restore();
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/Products/ProductsSandbox.js",
				false /*bPreloadGroup*/, true /*bUnloadAll*/, true /*bDeleteExports*/);
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(new JSONModel({iMessages : 0}), "ui");
		}
	});
});
