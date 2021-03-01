sap.ui.define(function () { 'use strict';

	const arraysAreEqual = (arr1, arr2) => {
		if (arr1.length !== arr2.length) {
			return false;
		}
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				return false;
			}
		}
		return true;
	};

	return arraysAreEqual;

});
