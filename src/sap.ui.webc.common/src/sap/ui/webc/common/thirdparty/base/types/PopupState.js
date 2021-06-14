sap.ui.define(['./DataType'], function (DataType) { 'use strict';

	const PopupStates = {
		OPEN: "OPEN",
		CLOSED: "CLOSED",
		OPENING: "OPENING",
		CLOSING: "CLOSING",
	};
	class PopupState extends DataType {
		static isValid(value) {
			return !!PopupStates[value];
		}
	}
	PopupState.generateTypeAccessors(PopupStates);

	return PopupState;

});
