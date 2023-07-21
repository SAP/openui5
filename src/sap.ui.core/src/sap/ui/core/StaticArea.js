/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert",
	"./Configuration",
	"./UIArea",
	"sap/ui/dom/_ready"
],
	function(
		assert,
		Configuration,
		UIArea,
		_ready
	) {
	"use strict";

	/**
	 * Whether the DOM is ready (document.ready)
	 */
	var bDomReady = false;

	_ready().then(function() {
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
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 * @alias module:sap/ui/core/StaticArea
	 * @namespace
	 */
	var StaticArea = {};

	/**
	 * The unique ID of the static area.
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 * @type {string}
	 */
	StaticArea.STATIC_UIAREA_ID = "sap-ui-static";

	var oStaticArea;

	/**
	 * Returns the <code>UIArea</code> instance for the static area. If none exists yet, one gets created.
	 *
	 * @returns {sap.ui.core.UIArea} The <code>UIArea</code> instance for the static area
	 * @throws {Error} if the document is not ready yet
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.getUIArea = function() {
		if (!oStaticArea) {
			oStaticArea = UIArea.registry.get(StaticArea.STATIC_UIAREA_ID) || UIArea.create(_createStaticAreaRef());
			oStaticArea.bInitial = false;
		}
		return oStaticArea;
	};

	/*
	 * Helper function that returns the root element of the static area. Creates it, if it doesn't exist yet.
	 * @returns {Element} The root DOM element of the static area
	 *
	 * @private
	 */
	function _createStaticAreaRef() {
		if (!bDomReady) {
			throw new Error("DOM is not ready yet. Static UIArea cannot be created.");
		}
		var oStaticArea = document.getElementById(StaticArea.STATIC_UIAREA_ID);

		if (!oStaticArea) {

			oStaticArea = document.createElement("div");
			var oFirstFocusElement = document.createElement("span");

			oStaticArea.setAttribute("id", StaticArea.STATIC_UIAREA_ID);

			Object.assign(oStaticArea.style, {
				"height": "0",
				"width": "0",
				"overflow": "hidden",
				"float":  Configuration.getRTL() ? "right" : "left"
			});

			oFirstFocusElement.setAttribute("id", StaticArea.STATIC_UIAREA_ID + "-firstfe");
			oFirstFocusElement.setAttribute("tabindex", -1);
			oFirstFocusElement.style.fontSize = 0;

			oStaticArea.appendChild(oFirstFocusElement);

			document.body.insertBefore(oStaticArea, document.body.firstChild);
		}
		return oStaticArea;
	}

	/**
	 * Returns the root element of the static, hidden area.
	 *
	 * It can be used e.g. for hiding elements like Popup, Shadow, Blocklayer etc.
	 * If it is not yet available, a DIV element is created and appended to the body.
	 *
	 * @returns {Element} the root DOM element of the static, hidden area
	 * @throws {Error} if the document is not ready yet
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.getDomRef = function() {
		return StaticArea.getUIArea().getRootNode();
	};

	/**
	 * Checks whether the given DOM element is part of the static area.
	 *
	 * @param {Element} oDomRef
	 * @returns {boolean} Whether the given DOM reference is part of the static UIArea
	 * @throws {Error} if the document is not ready yet
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.contains = function(oDomRef) {
		return StaticArea.getDomRef().contains(oDomRef);
	};

	return StaticArea;
});
