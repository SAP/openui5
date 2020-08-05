/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.p13n.FilterColumnLayout.
sap.ui.define(['sap/m/ColumnListItem', 'sap/m/ColumnListItemRenderer', 'sap/m/Label'
], function(ColumnListItem, ColumnListItemRenderer, Label) {
	"use strict";

	/**
	 * Constructor for a new filterBar/p13n/FilterColumnLayout.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.m.ColumnListItem
	 * @constructor
	 * @private
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.FilterColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterColumnLayout = ColumnListItem.extend("sap.ui.mdc.filterbar.p13n.FilterColumnLayout", {
		renderer: ColumnListItemRenderer
	});

	FilterColumnLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterColumnLayout.prototype.setFilterField = function (oFilterField) {
		this._sLabel = oFilterField.getLabel();
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterColumnLayout.prototype.getCells = function() {
		var aContent = [];

		var oLabel = new Label({
			text: this._sLabel
		});

		oLabel.setParent(this);

		aContent.push(oLabel);

		aContent.push(this._oFilterField);

		return aContent;
	};

	FilterColumnLayout.prototype.exit = function () {
		this._oFilterField = null;
		this._sFieldPath = null;
	};

	return FilterColumnLayout;

});
