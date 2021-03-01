sap.ui.define(['./DataType'], function (DataType) { 'use strict';

	class Float extends DataType {
		static isValid(value) {
			return Number(value) === value;
		}
	}

	return Float;

});
