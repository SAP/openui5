sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const InputTypes = {
		Text: "Text",
		Email: "Email",
		Number: "Number",
		Password: "Password",
		Tel: "Tel",
		URL: "URL",
	};
	class InputType extends DataType__default {
		static isValid(value) {
			return !!InputTypes[value];
		}
	}
	InputType.generateTypeAccessors(InputTypes);

	return InputType;

});
