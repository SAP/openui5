sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	var messageFormatRegEX = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;

	var formatMessage = function formatMessage(text, values) {
	  values = values || [];
	  return text.replace(messageFormatRegEX, function ($0, $1, $2, $3, offset) {
	    if ($1) {
	      return '\'';
	      /* eslint-disable-line */
	    }

	    if ($2) {
	      return $2.replace(/''/g, '\'');
	      /* eslint-disable-line */
	    }

	    if ($3) {
	      return String(values[parseInt($3)]);
	    }

	    throw new Error("[i18n]: pattern syntax error at pos ".concat(offset));
	  });
	};

	var I18nBundleInstances = new Map();
	/**
	 * @class
	 * @public
	 */

	var I18nBundle =
	/*#__PURE__*/
	function () {
	  function I18nBundle(packageName) {
	    __chunk_1._classCallCheck(this, I18nBundle);

	    this.packageName = packageName;
	  }
	  /**
	   * Returns a text in the currently loaded language
	   *
	   * @param {Object|String} textObj key/defaultText pair or just the key
	   * @param params Values for the placeholders
	   * @returns {*}
	   */


	  __chunk_1._createClass(I18nBundle, [{
	    key: "getText",
	    value: function getText(textObj) {
	      if (typeof textObj === "string") {
	        textObj = {
	          key: textObj,
	          defaultText: textObj
	        };
	      }

	      if (!textObj || !textObj.key) {
	        return "";
	      }

	      var bundle = __chunk_1.getI18nBundleData(this.packageName);
	      var messageText = bundle && bundle[textObj.key] ? bundle[textObj.key] : textObj.defaultText || textObj.key;

	      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        params[_key - 1] = arguments[_key];
	      }

	      return formatMessage(messageText, params);
	    }
	  }]);

	  return I18nBundle;
	}();

	var getI18nBundle = function getI18nBundle(packageName) {
	  if (I18nBundleInstances.has(packageName)) {
	    return I18nBundleInstances.get(packageName);
	  }

	  var i18nBundle = new I18nBundle(packageName);
	  I18nBundleInstances.set(packageName, i18nBundle);
	  return i18nBundle;
	};

	exports.getI18nBundle = getI18nBundle;

});
//# sourceMappingURL=chunk-f88e3e0b.js.map
