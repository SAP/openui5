sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d'], function (__chunk_1, __chunk_2) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li id=\"", "\" role=\"separator\" style=\"list-style-type: none;\"></li>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context._id));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-tab-separator"
	};
	/**
	 * @class
	 * The <code>ui5-tab-separator</code> represents a vertical line to separate tabs inside a <code>ui5-tabcontainer</code>.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TabSeparator
	 * @extends UI5Element
	 * @tagname ui5-tab-separator
	 * @public
	 */

	var TabSeparator =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TabSeparator, _UI5Element);

	  function TabSeparator() {
	    __chunk_1._classCallCheck(this, TabSeparator);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TabSeparator).apply(this, arguments));
	  }

	  __chunk_1._createClass(TabSeparator, [{
	    key: "isSeparator",
	    get: function get() {
	      return true;
	    }
	  }], [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }]);

	  return TabSeparator;
	}(__chunk_1.UI5Element);

	TabSeparator.define();

	return TabSeparator;

});
//# sourceMappingURL=TabSeparator.js.map
