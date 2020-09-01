sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	/**
	 * Different states.
	 */

	var ValueStates = {
	  None: "None",
	  Success: "Success",
	  Warning: "Warning",
	  Error: "Error",
	  Information: "Information"
	};

	var ValueState =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(ValueState, _DataType);

	  function ValueState() {
	    __chunk_1._classCallCheck(this, ValueState);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ValueState).apply(this, arguments));
	  }

	  __chunk_1._createClass(ValueState, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!ValueStates[value];
	    }
	  }]);

	  return ValueState;
	}(__chunk_1.DataType);

	ValueState.generataTypeAcessors(ValueStates);

	exports.ValueState = ValueState;

});
//# sourceMappingURL=chunk-02a372c1.js.map
