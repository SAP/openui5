sap.ui.define(['./DataType'], function (DataType) { 'use strict';

	const ValueStates = {
		None: "None",
		Success: "Success",
		Warning: "Warning",
		Error: "Error",
		Information: "Information",
	};
	class ValueState extends DataType {
		static isValid(value) {
			return !!ValueStates[value];
		}
	}
	ValueState.generateTypeAccessors(ValueStates);

	return ValueState;

});
