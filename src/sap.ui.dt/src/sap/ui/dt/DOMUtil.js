/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.Utils.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	/**
	 * Class for DOM Utils.
	 * 
	 * @class
	 * Utility functionality for DOM
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.Utils
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DOMUtil = {};

	DOMUtil.getSize = function(oDomRef) {
		return {
			width : oDomRef.offsetWidth,
			height : oDomRef.offsetHeight
		};
	};

	DOMUtil.getPosition = function(oDomRef, oParentDomRef) {
		var mOffset = jQuery(oDomRef).offset();

		if (oParentDomRef) {
			var mParentOffset = jQuery(oParentDomRef).offset();
			mOffset.left -= mParentOffset.left;
			mOffset.top -= mParentOffset.top;
		}
		return mOffset;
	};

	DOMUtil.getZIndex = function(oDomRef) {
		var $ElementDomRef = jQuery(oDomRef);
		var zIndex = $ElementDomRef.zIndex() || $ElementDomRef.css("z-index");
		return zIndex;
	};

	DOMUtil.getDomRefForCSSSelector = function(oDomRef, sCSSSelector) {
		if (!sCSSSelector) {
			return false;
		}

		if (sCSSSelector === ":sap-domref") {
			return oDomRef;
		}
		// ":sap-domref > sapMPage" scenario
		if (sCSSSelector.indexOf(":sap-domref") > -1) {
			return document.querySelector(sCSSSelector.replace(":sap-domref", "#" + this.getEscapedString(oDomRef.id)));
		}
		return oDomRef ? oDomRef.querySelector(sCSSSelector) : undefined;
	};

	DOMUtil.getEscapedString = function(sString) {
		return sString.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
	};

	return DOMUtil;
}, /* bExport= */ true);