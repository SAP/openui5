/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.p13n.FilterGroupLayout.
sap.ui.define(['sap/ui/core/Control'
], function (Control) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/FilterGroupLayout.
	 * Displays the label above the FilterField
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @private
	 * @since 1.82.0
	 * @alias sap.ui.mdc.filterbar.p13n.FilterGroupLayout
	 */
	var FilterGroupLayout = Control.extend("sap.ui.mdc.filterbar.p13n.FilterGroupLayout", {
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(oControl.getItems()[0]);
				oRm.close("div");
			}
		}
	});

	FilterGroupLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterGroupLayout.prototype.setFilterField = function (oFilterField) {
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterGroupLayout.prototype.getAccessibilityInfo = function () {
		return {
			children: this.getItems()
		};
	};

	FilterGroupLayout.prototype.getItems = function () {
		var aContent = [];
		aContent.push(this._oFilterField);
		return aContent;
	};

	FilterGroupLayout.prototype.exit = function () {
		Control.prototype.exit.apply(this, arguments);
		this._oFilterField = null;
		this._sFieldPath = null;
	};

	return FilterGroupLayout;

});