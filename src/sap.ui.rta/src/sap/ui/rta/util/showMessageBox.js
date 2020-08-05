/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Link",
	"sap/m/Text"
], function (
	MessageBox,
	HorizontalLayout,
	Link,
	Text
) {
	"use strict";

	var sLinkRegex = "\\[(.*?)\\]\\((.*?)\\)";

	function hasLinks(sMessage) {
		var vResult = getLinks(sMessage);
		return Array.isArray(vResult) && vResult.length > 0;
	}

	function isLink(sText) {
		var oRegex = new RegExp("^" + sLinkRegex + "$");
		return Array.isArray(oRegex.exec(sText));
	}

	function extractLink(sLink) {
		var aMatch = new RegExp(sLinkRegex).exec(sLink);
		return {
			text: aMatch[1],
			href: aMatch[2]
		};
	}

	function getLinks(sMessage) {
		var oRegExp = new RegExp(sLinkRegex, "g");
		return sMessage.match(oRegExp);
	}

	function convertIntoControls(aSymbols) {
		var oLayout = new HorizontalLayout({
			allowWrapping: true,
			content: aSymbols.map(function (sSymbol) {
				if (isLink(sSymbol)) {
					var mLink = extractLink(sSymbol);
					return new Link({
						text: mLink.text,
						href: mLink.href,
						target: "_blank",
						emphasized: true,
						wrapping: true
					});
				}
				return new Text({
					text: sSymbol,
					renderWhitespace: true
				});
			})
		});

		oLayout.addStyleClass("sapUiRtaMessageBox");

		return oLayout;
	}

	function getSymbols(sMessage) {
		var aSymbols = [sMessage];
		var aLinks = getLinks(sMessage);

		aLinks.forEach(function (sLink) {
			var i = 0;
			while (i < aSymbols.length) {
				var sSymbol = aSymbols[i];

				if (isLink(sSymbol)) {
					i++;
				} else {
					var aParts = sSymbol.split(sLink);
					var aInsert = [];

					aParts.forEach(function (sPart, iIndex, aOriginal) { // eslint-disable-line no-loop-func
						aInsert.push(sPart);
						if (iIndex !== aOriginal.length - 1) {
							aInsert.push(sLink);
						}
					});

					aSymbols.splice.apply(aSymbols, [i, 1].concat(aInsert));
					i += aInsert.length;
				}
			}
		});

		return aSymbols;
	}


	/**
	 * Shows sap.m.MessageBox and interprets markdown links in the messages.
	 *
	 * Example:
	 * "Your app is not enabled for UI adaptation. Check the prerequisites described [here](https://ui5.sap.com/#/topic/f1430c0337534d469da3a56307ff76af)."
	 *
	 * @param {string} sMessage - Message text which may contain markdown links
	 * @param {string} mOptions - See {@link sap.m.MessageBox} for more details
	 */
	return function showMessageBox(sMessage, mOptions) {
		var vMessage;

		if (hasLinks(sMessage)) {
			var aSymbols = getSymbols(sMessage);
			vMessage = convertIntoControls(aSymbols);
		} else {
			vMessage = sMessage;
		}

		MessageBox.show(vMessage, mOptions);
	};
});