sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const SemanticColors = {
		Default: "Default",
		Positive: "Positive",
		Negative: "Negative",
		Critical: "Critical",
		Neutral: "Neutral",
	};
	class SemanticColor extends DataType__default {
		static isValid(value) {
			return !!SemanticColors[value];
		}
	}
	SemanticColor.generateTypeAccessors(SemanticColors);

	return SemanticColor;

});
