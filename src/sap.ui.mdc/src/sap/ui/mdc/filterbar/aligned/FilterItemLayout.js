/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.aligned.FilterItemLayout.
sap.ui.define(['sap/ui/layout/VerticalLayout', 'sap/ui/layout/VerticalLayoutRenderer', 'sap/m/Label'
], function( VerticalLayout, VerticalLayoutRenderer, Label) {
	"use strict";

	/**
	 * Constructor for a new filterBar/aligned/FilterItemLayout.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.ui.layout.VerticalLayout
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @since 1.61.0
	 * @alias sap.ui.mdc.filterbar.aligned.FilterItemLayout
	 */
	var FilterItemLayout = VerticalLayout.extend("sap.ui.mdc.filterbar.aligned.FilterItemLayout", /** @lends sap.ui.mdc.filterbar.aligned.FilterItemLayout.prototype */ {
		metadata: {
			library: "sap.ui.mdc"
		},
		renderer: {
			apiVersion: 2,
			render: VerticalLayoutRenderer.render
		}
	});

	FilterItemLayout.prototype._setLabel = function (oFilterField) {
		this._oLabel = new Label(oFilterField.getId() + "-label");
		this._oLabel.setParent(this);

		oFilterField.connectLabel(this._oLabel);

		if (oFilterField.getFieldPath() === "$search") {
			this._oLabel.setText("\u2008");
		} else {
			this._oLabel.addStyleClass("sapUiMdcFilterBarBaseLabel");
		}
	};

	FilterItemLayout.prototype._getFilterField = function () {
		return this._oFilterField;
	};

	FilterItemLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterItemLayout.prototype.setFilterField = function (oFilterField) {
		this._setLabel(oFilterField);
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterItemLayout.prototype.getContent = function () {
		var aContent = [];
		aContent.push(this._oLabel);
		aContent.push(this._oFilterField);

		return aContent;
	};

	FilterItemLayout.prototype.exit = function () {
		this._oFilterField = null;
		this._sFieldPath = null;

		if (this._oLabel && !this._oLabel.bIsDestroyed) {
			this._oLabel.destroy();
			this._oLabel = undefined;
		}
		VerticalLayout.prototype.exit.apply(this, arguments);
	};

	return FilterItemLayout;

});
