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

		onInit: function () {
			this._fnOnFrameMessageHandler = this._onFrameMessage.bind(this);
		},

		/**
		 * Adds event listener for "bootFinished" event of the topic iframe.
		 * Only handles initial loading of the iframe.
		 */
		onFrameSourceChange: function () {
			window.addEventListener("message", this._fnOnFrameMessageHandler, { once: true });
		},

		onExit: function () {
			window.removeEventListener("message", this._fnOnFrameMessageHandler);
			this._fnOnFrameMessageHandler = null;
		},

		_onFrameMessage: function (oEvent) {
			if (oEvent.data === "bootFinished") {
				this._onFrameLoaded();
			}
		},

		_onFrameLoaded: function () {
			// sync sapUiSizeCompact with the iframe
			var sClass = this.getOwnerComponent().getContentDensityClass();
			this._getIFrame().contentDocument.body.classList.add(sClass);

			// navigate to the id in the URL
			var sCurrentHash = this.getRouter().getHashChanger().getHash();
			var oArgs = this.getRouter().getRouteInfoByHash(sCurrentHash).arguments;
			var sElementId = oArgs.id;

			// right shift the sub topic to element id
			// /{topic}/:subTopic:/:id:
			if (!this.isSubTopic(oArgs.subTopic)) {
				sElementId = oArgs.subTopic;
			}

			this.scrollTo(sElementId);
		},

		scrollTo: function (sId) {
			var oIFrame = this._getIFrame();

			if (!oIFrame || !sId) {
				return;
			}

			oIFrame.contentWindow.postMessage({
				channel: "scrollTo",
				id: sId
			}, window.location.origin);
		},

		/**
		 * Checks if the given key is sub topic key
		 * E.g. "/learn/{topic}/:subTopic:/:id:"
		 *
		 * @param {string} sKey The key of the topic
		 * @returns {boolean} Whether sKey is a key of sub topic
		 */
		isSubTopic: function (sKey) {
			return this.getNavigationModel().getProperty("/navigation").some(function (oNavEntry) {
				return oNavEntry.items && oNavEntry.items.some(function (oSubEntry) {
					return oSubEntry.key === sKey;
				});
			});
		},

		findNavEntry: function (key) {
			var navEntries = this.getNavigationModel().getProperty("/navigation"),
				navEntry,
				subItems,
				i,
				j;

			for (i = 0; i < navEntries.length; i++) {
				navEntry  = navEntries[i];

				if (navEntry.key === key) {
					return navEntry;
				}

				subItems = navEntry.items;

				if (subItems) {
					for (j = 0; j < subItems.length; j++) {
						if (subItems[j].key === key) {
							return subItems[j];
						}
					}
				}
			}

			return null;
		},

		getNavigationModel: function() {
			return null;
		},

		_getIFrame: function () {
			if (this.byId("topicFrame").getDomRef()) {
				return this.byId("topicFrame").getDomRef().querySelector("iframe");
			}

			return null;
		}
	});

});