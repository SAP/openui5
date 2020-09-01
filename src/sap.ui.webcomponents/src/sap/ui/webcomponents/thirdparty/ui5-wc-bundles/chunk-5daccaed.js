sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.ListMode.prototype
	 * @public
	 */

	var ListModes = {
	  /**
	   * Default mode (no selection).
	   * @public
	   * @type {None}
	   */
	  None: "None",

	  /**
	   * Right-positioned single selection mode (only one list item can be selected).
	   * @public
	   * @type {SingleSelect}
	   */
	  SingleSelect: "SingleSelect",

	  /**
	   * Left-positioned single selection mode (only one list item can be selected).
	   * @public
	   * @type {SingleSelectBegin}
	   */
	  SingleSelectBegin: "SingleSelectBegin",

	  /**
	   * Selected item is highlighted but no selection element is visible
	   * (only one list item can be selected).
	   * @public
	   * @type {SingleSelectEnd}
	   */
	  SingleSelectEnd: "SingleSelectEnd",

	  /**
	   * Selected item is highlighted and selection is changed upon arrow navigation
	   * (only one list item can be selected - this is always the focused item).
	   * @public
	   * @type {SingleSelectAuto}
	   */
	  SingleSelectAuto: "SingleSelectAuto",

	  /**
	   * Multi selection mode (more than one list item can be selected).
	   * @public
	   * @type {MultiSelect}
	   */
	  MultiSelect: "MultiSelect",

	  /**
	   * Delete mode (only one list item can be deleted via provided delete button)
	   * @public
	   * @type {Delete}
	   */
	  Delete: "Delete"
	};
	/**
	 * @class
	 * Defines the type of <code>ui5-list</code>.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.ListMode
	 * @public
	 * @enum {string}
	 */

	var ListMode =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(ListMode, _DataType);

	  function ListMode() {
	    __chunk_1._classCallCheck(this, ListMode);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ListMode).apply(this, arguments));
	  }

	  __chunk_1._createClass(ListMode, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!ListModes[value];
	    }
	  }]);

	  return ListMode;
	}(__chunk_1.DataType);

	ListMode.generataTypeAcessors(ListModes);

	exports.ListMode = ListMode;

});
//# sourceMappingURL=chunk-5daccaed.js.map
