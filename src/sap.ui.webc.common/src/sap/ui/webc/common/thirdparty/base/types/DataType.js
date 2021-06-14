sap.ui.define(function () { 'use strict';

	class DataType {
		static isValid(value) {
		}
		static generateTypeAccessors(types) {
			Object.keys(types).forEach(type => {
				Object.defineProperty(this, type, {
					get() {
						return types[type];
					},
				});
			});
		}
	}

	return DataType;

});
