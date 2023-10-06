/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool"
], function (ManagedObject, Core, IconPool) {
	"use strict";

	/**
	 * @private
	 */
	var IconFormatter = ManagedObject.extend("sap.ui.integration.formatters.IconFormatter", {
		metadata: {
			library: "sap.ui.integration",
			associations : {
				/**
				 * The card.
				 */
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				}
			}
		}
	});

	/**
	 * Use that value for icon src to determine if the icon should be hidden.
	 * @const
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	IconFormatter.SRC_FOR_HIDDEN_ICON = "SRC_FOR_HIDDEN_ICON";

	/**
	 * Format relative icon sources to be relative to the provided sap.app/id.
	 *
	 * @private
	 * @param {string} sUrl The URL to format.
	 * @returns {string|Promise} The formatted URL or a Promise which resolves with the formatted url.
	 */
	IconFormatter.prototype.formatSrc = function (sUrl) {
		if (!sUrl) {
			return sUrl;
		}

		if (sUrl === IconFormatter.SRC_FOR_HIDDEN_ICON) {
			return IconFormatter.SRC_FOR_HIDDEN_ICON;
		}

		if (sUrl.startsWith("data:") || IconPool.isIconURI(sUrl)) {
			return sUrl;
		}

		return this._format(sUrl);
	};

	IconFormatter.prototype._format = function (sUrl) {
		return this._getCardInstance().getRuntimeUrl(sUrl);
	};

	IconFormatter.prototype._getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	return IconFormatter;
});
