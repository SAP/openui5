sap.ui.define(function () { 'use strict';

	const getClassCopy = (klass, constructorCallback) => {
		return class classCopy extends klass {
			constructor() {
				super();
				constructorCallback && constructorCallback();
			}
		};
	};

	return getClassCopy;

});
