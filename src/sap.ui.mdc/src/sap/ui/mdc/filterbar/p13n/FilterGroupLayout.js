/*
 * ! ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.p13n.FilterGroupLayout.
sap.ui.define(['sap/m/CustomListItem', 'sap/m/CustomListItemRenderer', 'sap/m/Label'
], function(CustomListItem, CustomListItemRenderer, Label) {
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
	var FilterGroupLayout = CustomListItem.extend("sap.ui.mdc.filterbar.p13n.FilterGroupLayout", {
		renderer: CustomListItemRenderer
	});

	FilterGroupLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterGroupLayout.prototype.setFilterField = function (oFilterField) {
		this._sLabel = oFilterField.getLabel();
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterGroupLayout.prototype.getContent = function() {
		var aContent = [];
		var oLabel = new Label({
			text: this._sLabel,
			required: "{required}"
		});

		oLabel.setParent(this);

		aContent.push(oLabel);

		aContent.push(this._oFilterField);

		return aContent;
	};

	FilterGroupLayout.prototype.exit = function () {
		this._oFilterField = null;
		this._sFieldPath = null;
	};

	return FilterGroupLayout;

});