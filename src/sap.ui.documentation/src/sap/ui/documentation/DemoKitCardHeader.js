/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/f/cards/Header"
], function (Log, Header) {
	"use strict";

	var DemoKitCardHeader = Header.extend("sap.ui.documentation.DemoKitCardHeader", {
		metadata: {
			properties: {
				href: { type: "sap.ui.core.URI", defaultValue: null }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	DemoKitCardHeader.prototype.onAfterRendering = function () {
		if (Header.prototype.onAfterRendering) {
			Header.prototype.onAfterRendering.call(this);
		}

		var sHref = this.getHref(),
			oParent = this.getParent(),
			cardHeader;

		if (!oParent || !oParent.getDomRef) {
			Log.warning("Demo Kit: parent or parent's dom reference not found");
			return;
		}

		cardHeader = oParent.getDomRef().querySelector(".sapFCardHeader");

		if (!sHref || !cardHeader) {
			Log.warning("Demo Kit: href or card header not found. Href: " + sHref + ", card header: " + cardHeader);
			return;
		}

		var anchor = document.createElement("a");
		anchor.href = sHref;
		anchor.target = "_blank";
		anchor.rel = "noopener noreferrer";
		anchor.addEventListener("click", function (oEvent) {
			oEvent.stopPropagation();
		});

		try {
			for (var attr of cardHeader.attributes) {
				anchor.setAttribute(attr.name, attr.value);
			}

			anchor.classList.add("sapUiDemoKitCardHeader");
			while (cardHeader.hasChildNodes()) {
				anchor.appendChild(cardHeader.firstChild);
			}

			cardHeader.parentNode.replaceChild(anchor, cardHeader);
		} catch (error) {
			Log.error("Demo Kit: Error while setting the href to the card header", error);
		}
	};

	return DemoKitCardHeader;
});