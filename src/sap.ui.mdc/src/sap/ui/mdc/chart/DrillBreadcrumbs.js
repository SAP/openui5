/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Breadcrumbs", "sap/m/Link"
], (
	Breadcrumbs,
	Link
) => {
	"use strict";
	/**
	 * Delegate class for sap.ui.mdc.Chart and ODataV4. ?????
	 * Enables additional analytical capabilities.?????
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized.?????
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.88
	 * @alias sap.ui.mdc.chart.DrillBreadcrumbs
	 */
	const DrillBreadcrumbs = Breadcrumbs.extend("sap.ui.mdc.chart.DrillBreadcrumbs", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
			},
			aggregations: {
			},
			associations: {
			},
			events: {
				linkPressed: {
					parameters: {
						key: { type: "string" },
						index: { type: "int"}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	DrillBreadcrumbs.prototype.init = function() {
		Breadcrumbs.prototype.init.apply(this, arguments);

		this.addStyleClass("sapUiMDCChartBreadcrumbs");
	};


	/**
	 * Updates the breadcrumbs shown on the MDC Chart
	 *
	 * @param {array} aDrillableItems the drillable items
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillBreadcrumbs.prototype.update = function(aDrillableItems) {

		const aLinks = [];

		// Show/Hide Breadcrumbs
		this.setVisible(aDrillableItems?.length > 0);

		// When chart is bound to non-aggregated entity there is no drill-stack
		// existing
		if (aDrillableItems?.length > 0) {
			// Reverse array to display right order of crumbs
			aDrillableItems.reverse();

			aDrillableItems.forEach(function(oItem, index) {

				// Set current drill position in breadcrumb control
				if (index == 0) {
					this.setCurrentLocationText(oItem.text);
				} else {
					aLinks.push(this._createLink(oItem.key, oItem.text)); //note the links are added in an incorrect order need to reverse
				}

			}, this);
		} else {
			this.setCurrentLocationText("");
		}

		const currLinks = this.getLinks();
		aLinks.reverse();
		let diff = false;

		if (currLinks.length !== aLinks.length) {
			diff = true;
		} else {

			for (let i = 0; i < aLinks.length; i++) {
				if (aLinks[i].getText() != currLinks[i].getText()) {
					diff = true;
					break;
				}
			}
		}

		if (diff) {

			// Clear aggregation before we rebuild it
			if (this.getLinks()) {
				this.destroyLinks();
			}

			for (let i = 0; i < aLinks.length; i++) {
				this.addLink(aLinks[i]);
			}
		}

		return this;

	};

	DrillBreadcrumbs.prototype.onAfterRendering = function(oEvent) {
		Breadcrumbs.prototype.onAfterRendering.apply(this, arguments);

		if (this._bSetFocus) {
			delete this._bSetFocus;
			const oControl = this.getLinks()[0] || this;
			// breadcrumb.focus() does not work. The control does not have a tabindex=0 or -1
			// The ItemNavigation is setting the tabindex in the onAfterRendering. And it only works with an extra setTimeout (..., 200)
			//setTimeout(() => { oControl.focus(); }, 200);
			oControl.focus();
		}
	};

	DrillBreadcrumbs.prototype._createLink = function(sKey, sText) {

		const oLink = new Link({
			text: sText,
			press: function (oEvent) {
				const oLink = oEvent.getSource();
				const iIndex = this.indexOfLink(oLink);
				this.fireLinkPressed({ key: oLink.data().key, index: iIndex });
				this._bSetFocus = true;
			}.bind(this)
		});

		// unique dimension key is needed to remove the item from the mdc chart aggregation on drilling up
		oLink.data("key", sKey);
		return oLink;
	};

	return DrillBreadcrumbs;
});