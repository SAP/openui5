sap.ui.define(['exports'], function (exports) { 'use strict';

	const getCaretPosition = field => {
		let caretPos = 0;
		if (document.selection) {
			field.focus();
			const selection = document.selection.createRange();
			selection.moveStart("character", -field.value.length);
			caretPos = selection.text.length;
		} else if (field.selectionStart || field.selectionStart === "0") {
			caretPos = field.selectionDirection === "backward" ? field.selectionStart : field.selectionEnd;
		}
		return caretPos;
	};
	const setCaretPosition = (field, caretPos) => {
		if (field.createTextRange) {
			const range = field.createTextRange();
			range.move("character", caretPos);
			range.select();
		} else if (field.selectionStart) {
			field.focus();
			field.setSelectionRange(caretPos, caretPos);
		} else {
			field.focus();
		}
	};

	exports.getCaretPosition = getCaretPosition;
	exports.setCaretPosition = setCaretPosition;

	Object.defineProperty(exports, '__esModule', { value: true });

});
