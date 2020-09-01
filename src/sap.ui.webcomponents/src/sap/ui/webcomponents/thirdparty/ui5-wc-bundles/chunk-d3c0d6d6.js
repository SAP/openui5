sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	/**
	* @public
	*/

	var metadata = {
	  tag: "ui5-option",
	  properties:
	  /** @lends  sap.ui.webcomponents.main.Option.prototype */
	  {
	    /**
	     * Defines the selected state of the <code>ui5-option</code>.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    selected: {
	      type: Boolean
	    },

	    /**
	     * Defines the <code>icon</code> source URI.
	     * <br><br>
	     * <b>Note:</b>
	     * SAP-icons font provides numerous buil-in icons. To find all the available icons, see the
	     * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
	     *
	     * @type {string}
	     * @public
	     */
	    icon: {
	      type: String,
	      defaultValue: null
	    },

	    /**
	     * Defines the value of the <code>ui5-select</code> inside an HTML Form element when this <code>ui5-option</code> is selected.
	     * For more information on HTML Form support, see the <code>name</code> property of <code>ui5-select</code>.
	     *
	     * @type {string}
	     * @public
	     */
	    value: {
	      type: String
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Option.prototype */
	  {}
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-option</code> component defines the content of an opton in the <code>ui5-select</code>.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Option
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-option
	 * @public
	 */

	var Option =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Option, _UI5Element);

	  function Option() {
	    __chunk_1._classCallCheck(this, Option);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Option).apply(this, arguments));
	  }

	  __chunk_1._createClass(Option, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }]);

	  return Option;
	}(__chunk_1.UI5Element);

	Option.define();

	exports.Option = Option;

});
//# sourceMappingURL=chunk-d3c0d6d6.js.map
