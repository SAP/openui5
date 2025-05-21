/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Link",
	"sap/m/Text"
], function(
	MessageBox,
	HorizontalLayout,
	Link,
	Text
) {
	"use strict";

	const sLinkRegex = "\\[(.*?)\\]\\((.*?)\\)";

	function hasLinks(sMessage) {
		const vResult = getLinks(sMessage);
		return Array.isArray(vResult) && vResult.length > 0;
	}

	function isLink(sText) {
		const oRegex = new RegExp(`^${sLinkRegex}$`);
		return Array.isArray(oRegex.exec(sText));
	}

	function extractLink(sLink) {
		const aMatch = new RegExp(sLinkRegex).exec(sLink);
		return {
			text: aMatch[1],
			href: aMatch[2]
		};
	}

	function getLinks(sMessage) {
		const oRegExp = new RegExp(sLinkRegex, "g");
		return sMessage.match(oRegExp);
	}

	function convertIntoControls(aSymbols) {
		const oLayout = new HorizontalLayout({
			allowWrapping: true,
			content: aSymbols.map(function(sSymbol) {
				if (isLink(sSymbol)) {
					const mLink = extractLink(sSymbol);
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
		const aSymbols = [sMessage];
		const aLinks = getLinks(sMessage);

		aLinks.forEach(function(sLink) {
			let i = 0;
			while (i < aSymbols.length) {
				const sSymbol = aSymbols[i];

				if (isLink(sSymbol)) {
					i++;
				} else {
					const aParts = sSymbol.split(sLink);
					const aInsert = [];

					aParts.forEach(function(sPart, iIndex, aOriginal) { // eslint-disable-line no-loop-func
						aInsert.push(sPart);
						if (iIndex !== aOriginal.length - 1) {
							aInsert.push(sLink);
						}
					});

					// eslint-disable-next-line prefer-spread
					aSymbols.splice.apply(aSymbols, [i, 1].concat(aInsert));
					i += aInsert.length;
				}
			}
		});

		return aSymbols;
	}

	/**
	 * Displays sap.m.MessageBox and interprets markdown links in the messages.
	 *
	 * Example:
	 * "Your app is not enabled for UI adaptation. Check the prerequisites described [here](https://ui5.sap.com/#/topic/f1430c0337534d469da3a56307ff76af)."
	 *
	 * @param {string} sMessage - Message text which may contain markdown links
	 * @param {string} mOptions - See {@link sap.m.MessageBox} for more details
	 * @param {string} [sMessageType="show"] - Decides the type of the MessageBox that should be shown with (see different types at {@link sap.m.MessageBox})
	 */
	return function showMessageBox(sMessage, mOptions, sMessageType) {
		let vMessage;

		if (hasLinks(sMessage)) {
			const aSymbols = getSymbols(sMessage);
			vMessage = convertIntoControls(aSymbols);
		} else {
			vMessage = sMessage;
		}

		MessageBox[sMessageType || "show"](vMessage, mOptions);
	};
});