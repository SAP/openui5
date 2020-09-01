sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.TitleLevel.prototype
	 * @public
	 */

	var TitleLevels = {
	  /**
	   * Renders <code>h1</code> tag.
	   * @public
	   * @type {H1}
	   */
	  H1: "H1",

	  /**
	   * Renders <code>h2</code> tag.
	   * @public
	   * @type {H2}
	   */
	  H2: "H2",

	  /**
	   * Renders <code>h3</code> tag.
	   * @public
	   * @type {H3}
	   */
	  H3: "H3",

	  /**
	   * Renders <code>h4</code> tag.
	   * @public
	   * @type {H4}
	   */
	  H4: "H4",

	  /**
	   * Renders <code>h5</code> tag.
	   * @public
	   * @type {H5}
	   */
	  H5: "H5",

	  /**
	   * Renders <code>h6</code> tag.
	   * @public
	   * @type {H6}
	   */
	  H6: "H6"
	};
	/**
	 * @class
	 * Defines the <code>ui5-title</code> level
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.TitleLevel
	 * @public
	 * @enum {string}
	 */

	var TitleLevel =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(TitleLevel, _DataType);

	  function TitleLevel() {
	    __chunk_1._classCallCheck(this, TitleLevel);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TitleLevel).apply(this, arguments));
	  }

	  __chunk_1._createClass(TitleLevel, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!TitleLevels[value];
	    }
	  }]);

	  return TitleLevel;
	}(__chunk_1.DataType);

	TitleLevel.generataTypeAcessors(TitleLevels);

	exports.TitleLevel = TitleLevel;

});
//# sourceMappingURL=chunk-8b7daeae.js.map
