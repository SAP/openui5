sap.ui.define(function () { 'use strict';

	class DataType {
		static isValid(value) {
		}
		static attributeToProperty(attributeValue) {
			return attributeValue;
		}
		static propertyToAttribute(propertyValue) {
			return `${propertyValue}`;
		}
		static valuesAreEqual(value1, value2) {
			return value1 === value2;
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
