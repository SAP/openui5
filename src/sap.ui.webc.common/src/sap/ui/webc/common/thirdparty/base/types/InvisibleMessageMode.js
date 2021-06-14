sap.ui.define(['./DataType'], function (DataType) { 'use strict';

	const InvisibleMessageModes = {
		Polite: "Polite",
		Assertive: "Assertive",
	};
	class InvisibleMessageMode extends DataType {
		static isValid(value) {
			return !!InvisibleMessageModes[value];
		}
	}
	InvisibleMessageMode.generateTypeAccessors(InvisibleMessageModes);

	return InvisibleMessageModes;

});
