/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/ResizeHandler"
], function (BaseObject, ResizeHandler) {
	"use strict";

	/**
	 * @author SAP SE
	 *
	 * @class
	 * Add handlers for a sap.ui.layout.cssgrid.IGridConfigurable control lifecycle events.
	 * Applies the grid layout when necessary.
	 * Calls sap.ui.layout.cssgrid.GridLayoutBase hook functions.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @version ${version}
	 * @alias sap.ui.layout.cssgrid.GridLayoutDelegate
	 * @public
	 */
	var GridLayoutDelegate = BaseObject.extend("sap.ui.layout.cssgrid.GridLayoutDelegate");

	/**
	 * ===================== START of handling IGridConfigurable lifecycle events  =====================
	 */

	GridLayoutDelegate.prototype.onBeforeRendering = function () {
		GridLayoutDelegate.deregisterResizeListener(this);
	};

	GridLayoutDelegate.prototype.onAfterRendering = function () {
		var oGridLayout = this.getGridLayoutConfiguration();
		if (!oGridLayout) { return; }

		oGridLayout.onGridAfterRendering(this);

		if (oGridLayout.isResponsive()) {
			oGridLayout.applyGridLayout(this.getGridDomRefs());
			GridLayoutDelegate.registerResizeListener(this);
		}
	};

	GridLayoutDelegate.prototype.exit = function () {
		GridLayoutDelegate.deregisterResizeListener(this);
	};
	/**
	 * ===================== END of handling IGridConfigurable lifecycle events  =====================
	 */

	/**
	 * ===================== START of helper functions =====================
	 */

	/**
	 * Registers a resize listener
	 *
	 * @private
	 * @static
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The control to register resize listener from
	 */
	GridLayoutDelegate.registerResizeListener = function (oControl) {
		oControl.__grid__sResizeListenerId = ResizeHandler.register(oControl, GridLayoutDelegate.onResize.bind(oControl));
	};

	/**
	 * Deregisters a resize listener
	 *
	 * @private
	 * @static
	 * @param {sap.ui.layout.cssgrid.IGridConfigurable} oControl The control to deregister resize listener from
	 */
	GridLayoutDelegate.deregisterResizeListener = function (oControl) {
		if (oControl.__grid__sResizeListenerId) {
			ResizeHandler.deregister(oControl.__grid__sResizeListenerId);
			oControl.__grid__sResizeListenerId = null;
		}
	};

	/**
	 * Resize handler for the IGridConfigurable control
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event passed by the resize handler
	 */
	GridLayoutDelegate.onResize = function (oEvent) {
		var oGridLayout = this.getGridLayoutConfiguration();
		if (!oGridLayout) { return; }

		oGridLayout.onGridResize(oEvent);
		oGridLayout.applyGridLayout(this.getGridDomRefs());
	};

	/**
	 * ===================== END of helper functions =====================
	 */

	return GridLayoutDelegate;
});