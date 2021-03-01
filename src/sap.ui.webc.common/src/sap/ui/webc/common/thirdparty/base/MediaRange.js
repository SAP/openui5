sap.ui.define(function () { 'use strict';

	const querySets = {};
	const _initRangeSet = (name, borders, names) => {
		querySets[name] = {
			borders,
			names,
		};
	};
	const _getCurrentRange = (name, width = window.innerWidth) => {
		const querySet = querySets[name];
		let i = 0;
		if (!querySet) {
			return null;
		}
		for (; i < querySet.borders.length; i++) {
			if (width < querySet.borders[i]) {
				return querySet.names[i];
			}
		}
		return querySet.names[i];
	};
	const RANGESETS = {
		RANGE_4STEPS: "4Step",
	};
	const MediaRange = {
		RANGESETS,
		initRangeSet: _initRangeSet,
		getCurrentRange: _getCurrentRange,
	};
	MediaRange.initRangeSet(MediaRange.RANGESETS.RANGE_4STEPS, [600, 1024, 1440], ["S", "M", "L", "XL"]);

	return MediaRange;

});
