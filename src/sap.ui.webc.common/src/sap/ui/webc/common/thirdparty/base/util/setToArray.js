sap.ui.define(function () { 'use strict';

	const setToArray = s => {
		const arr = [];
		s.forEach(item => {
			arr.push(item);
		});
		return arr;
	};

	return setToArray;

});
