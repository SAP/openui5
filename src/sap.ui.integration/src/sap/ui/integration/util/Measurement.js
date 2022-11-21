/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/performance/Measurement"
], function (CoreMeasurement) {
	"use strict";

	var bNowAPIExists = performance && performance.now;
	var bMarkAPIExists = performance && performance.mark;

	function measurementStartTime() {
		if (bNowAPIExists) {
			return " Start since page load: " + performance.now();
		}

		return "";
	}

	var mMeasurements = new Map();

	var Measurement = {
		start: function (sId, sDetail) {
			if (!CoreMeasurement.getActive()) {
				return;
			}

			mMeasurements.set(sId, {
				detail: sDetail
			});

			if (bMarkAPIExists){
				performance.mark(sId + "-start");
			}

			CoreMeasurement.start(sId, sDetail + measurementStartTime());
		},
		end: function (sId) {
			if (!CoreMeasurement.getActive()) {
				return;
			}

			var oMeasurement = mMeasurements.get(sId);

			if (bMarkAPIExists) {
				performance.mark(sId + "-end", {
					start: sId,
					detail: oMeasurement.detail
				});
			}

			CoreMeasurement.end(sId);
			oMeasurement.ended = true;
		},
		hasEnded: function (sId) {
			return CoreMeasurement.getActive() && mMeasurements.get(sId).ended;
		}
	};

	return Measurement;

});