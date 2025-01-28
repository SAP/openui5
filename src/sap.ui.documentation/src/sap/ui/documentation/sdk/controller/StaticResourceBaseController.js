/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil"
], function (BaseController, ResourceDownloadUtil) {
	'use strict';

	return BaseController.extend('sap.ui.documentation.sdk.controller.StaticResourceBaseController', {
		onInit: function (sRoute) {
			if (sRoute) {
				this.getRouter().getRoute(sRoute).attachPatternMatched(this._onMatched, this);
			}
		},

		_onMatched: function () {
			this.hideMasterSide();

			this._getPathToContent()
			.then(this._fetchContent)
			.then(this._decorateContent)
			.then(this._renderContent.bind(this))
			.catch(this.onRouteNotFound.bind(this));
		},

		/**
		 * This method should be overwritten in the child controllers
		 * @returns {Promise<string>} The path to the resource
		 */
		_getPathToContent: function () {
			// Overwrite this method in the child controllers
		},

		_fetchContent: function (sPathToResource) {
			return ResourceDownloadUtil.fetch(sPathToResource);
		},

		_decorateContent(sContent) {
			return sContent; // Add custom logic here if needed
		},

		_renderContent: function (sContent) {
			var oPlaceholder = this.getView().byId("content");
			oPlaceholder.setContent("");// clear the content before setting the new one
			oPlaceholder.setContent(sContent);
		}
	});
});
