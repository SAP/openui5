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

	/*
	 * Helper module to create and retrieve the static UIArea.
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	var StaticArea = {};

	/*
	 * The ID of the static UIArea.
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.STATIC_UIAREA_ID = "sap-ui-static";

	var oStaticArea;
	/*
	 * Returns the instance of the static UIArea. If none exists yet, one gets created.
	 * @return {sap.ui.core.UIArea} The instance of the static UIArea
	 * @throws {Error} an Error if the document is not ready yet
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
	 * Helper function that returns the static UIArea DOM reference. Creates one, if none exists yet.
	 * @return {Element} The DOM reference of the static UIArea
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

	/*
	 * Returns the static, hidden area DOM element belonging the core instance.
	 * It can be used e.g. for hiding elements like Popup, Shadow, Blocklayer etc.
	 * If it is not yet available, a DIV element is created and appended to the body.
	 *
	 * @return {ELement} the static, hidden area DOM element.
	 * @throws {Error} an Error if the document is not ready yet
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.getDomRef = function() {
		return StaticArea.getUIArea().getRootNode();
	};

	/*
	 * Checks whether the given DOM reference is part of the static UIArea.
	 * @param {Element} oDomRef
	 * @return {boolean} Whether the given DOM reference is part of the static UIArea
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	StaticArea.contains = function(oDomRef) {
		return StaticArea.getDomRef().contains(oDomRef);
	};

	return StaticArea;
});
