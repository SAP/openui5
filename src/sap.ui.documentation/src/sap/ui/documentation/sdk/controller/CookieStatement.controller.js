/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/StaticResourceBaseController"
], function (StaticResourceBaseController) {
	'use strict';

	return StaticResourceBaseController.extend('sap.ui.documentation.sdk.controller.CookieStatement', {
		onInit: function () {
			var sRouteName = "CookieStatement";
			StaticResourceBaseController.prototype.onInit.call(this, sRouteName);
		},
		// Overwrite the method from StaticResourceBaseController
		_getPathToContent: function () {
			var sPath = this.getOwnerComponent().getConfigUtil().getPathToCookieStatement();
			return Promise.resolve(sPath);
		}
	});
});
