sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController"
], function (
	BaseController
) {
	"use strict";

	/**
	 * Serves as base class for controllers, which show topic (.html) and use iframe.
	 */
	return BaseController.extend("sap.ui.demo.cardExplorer.controller.Topic", {

		/**
		 * Adds eventListener on "load" event listener to the iframe, which is used to display topics.
		 * Only handles initial loading of the iframe.
		 */
		onFrameSourceChange: function () {
			var oDomRef = this.byId("topicFrame").getDomRef();

			if (oDomRef) {
				oDomRef.querySelector("iframe").addEventListener("load", this.onFrameLoaded.bind(this), { once: true });
			}
		},

		onFrameLoaded: function (oEvent) {
			// sync sapUiSizeCompact with the iframe
			var sClass = this.getOwnerComponent().getContentDensityClass();
			oEvent.target.contentDocument.body.classList.add(sClass);

			// navigate to the id in the URL
			var sCurrentHash = this.getRouter().getHashChanger().getHash();
			var oArgs = this.getRouter().getRouteInfoByHash(sCurrentHash).arguments;

			this.scrollTo(oArgs.id);
		},

		scrollTo: function (sId) {
			var oDomRef = this.byId("topicFrame").getDomRef();

			if (!oDomRef || !sId) {
				return;
			}

			var oIFrame = oDomRef.querySelector("iframe");

			oIFrame.contentWindow.postMessage({ id: sId }, window.location.origin);
		}
	});

});