
/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.p13n.FilterColumnLayout.
sap.ui.define(['sap/m/ColumnListItem', 'sap/m/ColumnListItemRenderer', 'sap/m/Label'
], function(ColumnListItem, ColumnListItemRenderer, Label) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/FilterColumnLayout.
     * Displays FilterFields with labels as cells
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.m.ColumnListItem
	 * @constructor
	 * @private
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.FilterColumnLayout
	 */
	const FilterColumnLayout = ColumnListItem.extend("sap.ui.mdc.filterbar.p13n.FilterColumnLayout", {
		metadata: {
			library: "sap.ui.mdc"
		},
		renderer: ColumnListItemRenderer
	});

	FilterColumnLayout.prototype._getFieldPath = function () {
		return this._oFilterField ? this._oFilterField.getPropertyKey() : null;
	};

	FilterColumnLayout.prototype.setFilterField = function (oFilterField) {
		this._oFilterField = oFilterField;
		this._sLabel = oFilterField.getLabel();
	};

	FilterColumnLayout.prototype.getCells = function() {
		const aContent = [];

		const oLabel = new Label({
			text: this._sLabel
		});

		oLabel.setParent(this);

		aContent.push(oLabel);

		aContent.push(this._oFilterField);

		return aContent;
	};

	FilterColumnLayout.prototype.exit = function () {
		ColumnListItem.prototype.exit.apply(this, arguments);
		this._oFilterField = null;
	};

	return FilterColumnLayout;
});
