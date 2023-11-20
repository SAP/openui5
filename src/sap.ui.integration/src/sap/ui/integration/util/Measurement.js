/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/config"
], function (BaseConfig) {
	"use strict";

	var bMarkAPIExists = performance && performance.mark;
	var bMeasureAPIExists = performance && performance.measure;

	/**
	 * Contains static methods for work with performance markers.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @class
	 */
	var Measurement = {
		/**
		 * Adds a start marker with performance.mark().
		 * @param {string} sId The id of the marker. Suffix "-start" will be added at the end.
		 * @param {string} sDetail Details for the marker.
		 * @returns {PerformanceMark} The start marker.
		 */
		start: function (sId, sDetail) {
			if (!this.getActive()) {
				return null;
			}

			return performance.mark(sId + "-start", {
				detail: sDetail
			});
		},
		/**
		 * Adds an end marker with performance.mark().
		 * Also adds a measurement between the end and the start marker with performance.measure().
		 * @param {string} sId The base id of the marker. Suffix "-end" will be added at the end.
		 * @returns {PerformanceMark} The end marker.
		 */
		end: function (sId) {
			if (!this.getActive()) {
				return null;
			}

			var oStartMark = performance.getEntriesByName(sId + "-start")[0],
				oEndMark,
				sDetail = "";

			if (oStartMark) {
				sDetail = oStartMark.detail;
			}

			oEndMark = performance.mark(sId + "-end", {
				start: sId,
				detail: sDetail
			});

			performance.measure(sId, {
				start: sId + "-start",
				end: sId + "-end",
				detail: sDetail
			});

			return oEndMark;
		},
		/**
		 * Checks if an end marker was already added.
		 * @param {string} sId The base id of the marker.
		 * @returns {boolean} True if the end marker is there. False otherwise.
		 */
		hasEnded: function (sId) {
			if (!this.getActive()) {
				return false;
			}

			var oEndMark = performance.getEntriesByName(sId + "-end")[0];

			return !!oEndMark;
		},
		/**
		 * Should the performance measurement be activated.
		 * @returns {boolean} True if it should be active. False otherwise.
		 */
		getActive: function () {
			var bActive = BaseConfig.get({
				name: "sapUiXxMeasureCards",
				type: BaseConfig.Type.Boolean,
				external: true
			}); // @todo

			return bActive && bMarkAPIExists && bMeasureAPIExists;
		}
	};

	return Measurement;

});