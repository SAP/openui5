/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/cards/Header",
	"sap/m/Link"
], function (Header, Link) {
	"use strict";

	var DemoAppsCardHeader = Header.extend("sap.ui.documentation.DemoAppsCardHeader", {
		metadata: {
			properties: {
				href: { type: "sap.ui.core.URI", defaultValue: null },
				hrefText: { type: "string", defaultValue: null }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	DemoAppsCardHeader.prototype.init = function () {
		if (Header.prototype.init) {
			Header.prototype.init.call(this);
		}

		this._oLink = new Link({
			target: "_blank",
			wrapping: true
		}).addStyleClass("sapUiDemoKitDemoAppsCardHeaderLink");
	};

	DemoAppsCardHeader.prototype.exit = function () {
		if (Header.prototype.exit) {
			Header.prototype.exit.call(this);
		}

		this._oLink.destroy();
		this._oLink = null;
	};

	DemoAppsCardHeader.prototype.onAfterRendering = function () {
		if (Header.prototype.onAfterRendering) {
			Header.prototype.onAfterRendering.call(this);
		}

		if (this.getHref() && this.getHrefText()) {
			this._oLink.setText(this.getHrefText());
			this._oLink.setHref(this.getHref());

			var $headerText = this.$().find('.sapFCardHeaderText');
			if ($headerText.length && !$headerText.html()) {
				this._oLink.placeAt($headerText[0]);
			}
		}
	};

	return DemoAppsCardHeader;
});