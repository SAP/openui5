/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/StaticResourceBaseController"
], function (StaticResourceBaseController) {
	'use strict';

	return StaticResourceBaseController.extend('sap.ui.documentation.sdk.controller.PrivacyStatement', {
		onInit: function () {
			var sRouteName = "PrivacyStatement";
			StaticResourceBaseController.prototype.onInit.call(this, sRouteName);
		},
		// Overwrite the method from StaticResourceBaseController
		_getPathToContent: function () {
			var sPath = this.getOwnerComponent().getConfigUtil().getPathToPrivacyStatement();
			return Promise.resolve(sPath);
		}
	});
});
