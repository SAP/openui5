/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ListBase",
	"sap/ui/layout/cssgrid/GridLayoutDelegate"
], function(ListBase, GridLayoutDelegate) {
	"use strict";

/**
 * Constructor for a new GridList.
 *
 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
 * @param {object} [mSettings] Initial settings for the new control
 *
 * @class
 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
 *
 * @author SAP SE
 * @version ${version}
 *
 * @extends sap.m.ListBase
 *
 * @constructor
 * @private
 * @since 1.60
 * @alias sap.f.GridList
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
var GridList = ListBase.extend("sap.f.GridList", { metadata : {
	library: "sap.f",
	interfaces: ["sap.ui.layout.cssgrid.IGridConfigurable"],
	aggregations: {

		/**
		 * Defines a custom grid layout
		 */
		customLayout: { type: "sap.ui.layout.cssgrid.GridLayoutBase", multiple: false }
	}
}});

GridList.prototype.init = function () {
	ListBase.prototype.init.apply(this, arguments);
	this._startGridLayoutDelegate();
};

GridList.prototype.exit = function () {
	ListBase.prototype.exit.apply(this, arguments);
	this._destroyGridLayoutDelegate();
};

// Implement IGridConfigurable interface
GridList.prototype.getGridDomRefs = function () {
	return [this.getDomRef("listUl")];
};

// Implement IGridConfigurable interface
GridList.prototype.getGridLayoutConfiguration = function () {
	return this.getCustomLayout();
};

/**
 * Adds the GridLayoutDelegate
 *
 * @private
 */
GridList.prototype._startGridLayoutDelegate = function () {
	if (!this.oGridLayoutDelegate) {
		this.oGridLayoutDelegate = new GridLayoutDelegate();
		this.addEventDelegate(this.oGridLayoutDelegate, this);
	}
};

/**
 * Destroys the GridLayoutDelegate
 *
 * @private
 */
GridList.prototype._destroyGridLayoutDelegate = function () {
	if (this.oGridLayoutDelegate) {
		this.removeEventDelegate(this.oGridLayoutDelegate);
		this.oGridLayoutDelegate.destroy();
		this.oGridLayoutDelegate = null;
	}
};

return GridList;

});