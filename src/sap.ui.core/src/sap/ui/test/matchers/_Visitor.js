/*!
 * ${copyright}
 */

// private
sap.ui.define([
	'sap/ui/test/matchers/Matcher'
], function (Matcher) {
	"use strict";

	return Matcher.extend("sap.ui.test.matchers._Visitor", {
		// oControl or one of its ancestors must satisfy a condition
		// fnMatch=condition; gets 1 arguments: current control
		// bDirect=false; only direct parent or go up the entire tree
		isMatching: function (oControl, fnMatch, bDirect) {
			if (fnMatch(oControl)) {
				return true;
			}

			var oAppWindow = this._getApplicationWindow(),
			oAppWindowJQuery = oAppWindow.jQuery,
			oStaticArea = oAppWindow.sap.ui.require("sap/ui/core/Core").getStaticAreaRef();

			var oParent = oControl.getParent();
			if (bDirect) {
				return fnMatch(oParent);
			}

			while (oParent) {
				if (fnMatch(oParent)) {
					return true;
				}
				oParent = (oParent.isA("sap.ui.core.UIComponent") &&  !oAppWindowJQuery.contains(oStaticArea, oControl.getDomRef()))
					? oParent.oContainer : oParent.getParent();
			}

			return false;
		}
	});

});
