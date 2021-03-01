sap.ui.define(function () { 'use strict';

	const getRoundedTimestamp = millisecondsUTC => {
		if (!millisecondsUTC) {
			millisecondsUTC = new Date().getTime();
		}
		const rounded = millisecondsUTC - (millisecondsUTC % (24 * 60 * 60 * 1000));
		return rounded / 1000;
	};

	return getRoundedTimestamp;

});
