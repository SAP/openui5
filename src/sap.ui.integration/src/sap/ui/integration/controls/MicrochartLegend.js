/*!
* ${copyright}
*/

sap.ui.define([
	"./MicrochartLegendRenderer",
	"sap/m/Text",
	"sap/ui/core/Control",
	"sap/ui/integration/util/BindingHelper"
], function (
	MicrochartLegendRenderer,
	Text,
	Control,
	BindingHelper
) {
	"use strict";

	/**
	 * Constructor for a new MicrochartLegend.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.MicrochartLegend
	 */
	var MicrochartLegend = Control.extend("sap.ui.integration.controls.MicrochartLegend", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * Texts for every legend item.
				 */
				_titles: { type: "sap.m.Text", multiple: true, visibility: "hidden" }
			},
			associations: {
				/**
				 * Chart from the <code>sap.suite.ui.microchart</code> library.
				 */
				chart: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: MicrochartLegendRenderer
	});

	MicrochartLegend.prototype.onAfterRendering = function () {
		this._equalizeWidths();
	};

	MicrochartLegend.prototype._equalizeWidths = function () {
		var $items = this.$().children(".sapUiIntMicrochartLegendItem"),
			fMaxWidth = 0;

		$items.css("width", "");
		$items.each(function () {
			var fCurrWidth = this.getBoundingClientRect().width;

			if (fCurrWidth > fMaxWidth) {
				fMaxWidth = fCurrWidth;
			}
		});

		// Set 'min-width' instead of 'width' as the font-family sometimes is applied later which may trigger growing of the item without noticing.
		// For example 'fMaxWidth' can be 110.20 before the font is applied and 110.60 after. In this case let the item grow with 0.40
		$items.css("min-width", fMaxWidth + "px");
	};

	/**
	 * @param {object[]} aBarsConfig Bars configurations from the manifest.
	 * @param {string} sPath The binding context path.
	 */
	MicrochartLegend.prototype.initItemsTitles = function (aBarsConfig, sPath) {
		this.destroyAggregation("_titles");

		aBarsConfig.forEach(function (oConfig, i) {
			// If the paths of "displayValue" are relative to each item, prepend the item binding context.
			// If the paths are absolute or the value is not binding info at all, it wont be modified.
			var oBindingInfo = BindingHelper.prependRelativePaths(oConfig.legendTitle, sPath + "/" + i);

			var oText = new Text({
				text: oBindingInfo
			});

			oText.addEventDelegate({
				onAfterRendering: this._equalizeWidths
			}, this);

			this.addAggregation("_titles", oText);
		}.bind(this));
	};

	return MicrochartLegend;
});