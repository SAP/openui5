/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	var _oScrollbarSize = {};

	/**
	 * Returns the size (width of the vertical / height of the horizontal) native browser scrollbars.
	 *
	 * This function must only be used when the DOM is ready.
	 *
	 * @function
	 * @param {string} [sClasses=null] The CSS class that should be added to the test element.
	 * @param {boolean} [bForce=false] Force recalculation of size (e.g. when CSS was changed). When no classes are passed all calculated sizes are reset.
	 * @return {object} JSON object with properties <code>width</code> and <code>height</code> (the values are of type number and are pixels).
	 * @private
	 * @exports sap/ui/dom/scrollbarSize
	 */
	var fnScrollbarSize = function(sClasses, bForce) {
		if (typeof sClasses === "boolean") {
			bForce = sClasses;
			sClasses = null;
		}

		var sKey = sClasses || "#DEFAULT"; // # is an invalid character for CSS classes

		if (bForce) {
			if (sClasses) {
				delete _oScrollbarSize[sClasses];
			} else {
				_oScrollbarSize = {};
			}
		}

		if (_oScrollbarSize[sKey]) {
			return _oScrollbarSize[sKey];
		}

		if (!document.body) {
			return {width: 0, height: 0};
		}

		var $Area = jQuery("<DIV/>")
			.css("visibility", "hidden")
			.css("height", "0")
			.css("width", "0")
			.css("overflow", "hidden");

		if (sClasses) {
			$Area.addClass(sClasses);
		}

		$Area.prependTo(document.body);

		var $Dummy = jQuery("<div style=\"visibility:visible;position:absolute;height:100px;width:100px;overflow:scroll;opacity:0;\"></div>");
		$Area.append($Dummy);

		var oDomRef = $Dummy.get(0);
		var iWidth = oDomRef.offsetWidth - oDomRef.scrollWidth;
		var iHeight = oDomRef.offsetHeight - oDomRef.scrollHeight;

		$Area.remove();

		// due to a bug in FireFox when hiding iframes via an outer DIV element
		// the height and width calculation is not working properly - by not storing
		// height and width when one value is 0 we make sure that once the iframe
		// gets visible the height calculation will be redone (see snippix: #64049)
		if (iWidth === 0 || iHeight === 0) {
			return {width: iWidth, height: iHeight};
		}

		_oScrollbarSize[sKey] = {width: iWidth, height: iHeight};

		return _oScrollbarSize[sKey];
	};

	return fnScrollbarSize;

});

