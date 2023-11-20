/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"./UIArea",
	"sap/ui/dom/_ready"
], (
	Localization,
	UIArea,
	_ready
) => {
	"use strict";

	let oStaticArea;

	/**
	 * Whether the DOM is ready (document.ready)
	 */
	let bDomReady = false;

	_ready().then(() => {
		bDomReady = true;
	});

	/**
	 * Helper module to access the static area.
	 *
	 * The static area is a hidden DOM element with a unique ID and managed by the framework.
	 * It is typically used for hidden or temporarily hidden elements like InvisibleText, Popup,
	 * Shadow, Blocklayer etc.
	 *
	 * All methods throw an <code>Error</code> when they are called before the document is ready.
	 *
	 * @namespace
	 * @alias module:sap/ui/core/StaticArea
	 * @public
	 */
	const StaticArea = {
		/**
		 * The unique ID of the static area.
		 *
		 * @private
		 * @ui5-restricted SAPUI5 Dist
		 * @type {string}
		 */
		STATIC_UIAREA_ID: "sap-ui-static",

		/**
		 * Returns the <code>UIArea</code> instance for the static area. If none exists yet, one gets created.
		 *
		 * @returns {sap.ui.core.UIArea} The <code>UIArea</code> instance for the static area
		 * @throws {Error} if the document is not ready yet
		 *
		 * @public
		 */
		getUIArea: () => {
			if (!oStaticArea) {
				oStaticArea = UIArea.registry.get(StaticArea.STATIC_UIAREA_ID) || UIArea.create(_createStaticAreaRef());
				oStaticArea.bInitial = false;
			}
			return oStaticArea;
		},
		/**
		 * Returns the root element of the static, hidden area.
		 *
		 * It can be used e.g. for hiding elements like Popup, Shadow, Blocklayer etc.
		 * If it is not yet available, a DIV element is created and appended to the body.
		 *
		 * @returns {Element} the root DOM element of the static, hidden area
		 * @throws {Error} if the document is not ready yet
		 *
		 * @public
		 */
		getDomRef: () => {
			return StaticArea.getUIArea().getRootNode();
		},

		/**
		 * Checks whether the given DOM element is part of the static area.
		 *
		 * @param {Element} oDomRef The DOM element to check
		 * @returns {boolean} Whether the given DOM reference is part of the static UIArea
		 * @throws {Error} if the document is not ready yet
		 *
		 * @public
		 */
		contains: (oDomRef) => {
			return StaticArea.getDomRef().contains(oDomRef);
		}
	};

	/*
	 * Helper function that returns the root element of the static area. Creates it, if it doesn't exist yet.
	 * @returns {Element} The root DOM element of the static area
	 *
	 * @private
	 */
	const _createStaticAreaRef = () => {
		if (!bDomReady) {
			throw new Error("DOM is not ready yet. Static UIArea cannot be created.");
		}
		let oStaticArea = document.getElementById(StaticArea.STATIC_UIAREA_ID);

		if (!oStaticArea) {

			oStaticArea = document.createElement("div");
			var oFirstFocusElement = document.createElement("span");

			oStaticArea.setAttribute("id", StaticArea.STATIC_UIAREA_ID);

			Object.assign(oStaticArea.style, {
				"height": "0",
				"width": "0",
				"overflow": "hidden",
				"float":  Localization.getRTL() ? "right" : "left"
			});

			oFirstFocusElement.setAttribute("id", StaticArea.STATIC_UIAREA_ID + "-firstfe");
			oFirstFocusElement.setAttribute("tabindex", -1);
			oFirstFocusElement.style.fontSize = 0;

			oStaticArea.appendChild(oFirstFocusElement);

			document.body.insertBefore(oStaticArea, document.body.firstChild);
		}
		return oStaticArea;
	};

	return StaticArea;
});
