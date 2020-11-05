/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.p13n.FilterGroupLayout.
sap.ui.define(['sap/m/VBox', 'sap/m/VBoxRenderer', 'sap/m/Label'
], function(VBox, VBoxRenderer, Label) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/FilterGroupLayout.
	 * Displays the label above the FilterField
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.m.ColumnListItem
	 * @constructor
	 * @private
	 * @since 1.82.0
	 * @alias sap.ui.mdc.filterbar.p13n.FilterGroupLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterGroupLayout = VBox.extend("sap.ui.mdc.filterbar.p13n.FilterGroupLayout", {
		renderer: VBoxRenderer
	});

	FilterGroupLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterGroupLayout.prototype.setFilterField = function (oFilterField) {
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterGroupLayout.prototype.getItems = function() {
		var aContent = [];
		aContent.push(this._oFilterField);
		return aContent;
	};

	FilterGroupLayout.prototype.exit = function () {
		VBox.prototype.exit.apply(this, arguments);
		this._oFilterField = null;
		this._sFieldPath = null;
	};

	return FilterGroupLayout;

});