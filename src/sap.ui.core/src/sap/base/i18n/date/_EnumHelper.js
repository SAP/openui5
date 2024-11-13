/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	let _fnRegisterEnum;
	const mEarlyRegistrations = new Map();

	return {

		/**
		 * The final registerEnum function is injected from the DataType class.
		 * @param {function} registerEnum the final registerEnum function of the DataType class
		 */
		inject: function(registerEnum) {
			if (!_fnRegisterEnum) {
				_fnRegisterEnum = registerEnum;
				mEarlyRegistrations.forEach((mEnumContent, sName) => {
					_fnRegisterEnum(sName, mEnumContent);
				});
			}
		},

		/**
		 * Registers an enum.
		 * While the final registerEnum() function is not injected yet,
		 * the enums are collected and will be correctly registered once the DataType class injects
		 * its registerEnum() function.
		 * @param {*} sName the name of the enum in dot-syntax
		 * @param {*} mEnumContent the enum content
		 */
		register: function(sName, mEnumContent) {
			if (_fnRegisterEnum) {
				_fnRegisterEnum(sName, mEnumContent);
			} else {
				mEarlyRegistrations.set(sName, mEnumContent);
			}
		}
	};
});