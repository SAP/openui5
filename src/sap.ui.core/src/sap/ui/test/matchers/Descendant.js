/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/matchers/_Visitor"
], function (Log, _Visitor) {
	"use strict";

	var oLogger = Log.getLogger("sap.ui.test.matchers.Descendant");
	var oVisitor = new _Visitor();

	/**
	 * @class
	 * Checks if a control has a given descendant.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     descendant: "object" // where "object" is a declarative matcher for the descendant
	 * }
	 * </code></pre>
	 *
	 * @param {object|string} vDescendantControl The descendant control to check. If undefined,
	 * it validates every control to true. Can be a control or a control ID
	 * @param {boolean} [bDirect] specifies if the descendant should be a direct child
	 * @public
	 * @name sap.ui.test.matchers.Descendant
	 * @since 1.66
	 */

	return function (vDescendantControl, bDirect) {
		return function (oControl) {
			if (!vDescendantControl) {
				oLogger.debug("No descendant was defined so no controls will be filtered.");
				return true;
			}

			var oDescendantControl;
			if (typeof vDescendantControl === "string") {
				var oAppWindow = oVisitor._getApplicationWindow();
				oDescendantControl = oAppWindow.sap.ui.getCore().byId(vDescendantControl);
			} else {
				oDescendantControl = vDescendantControl;
			}

			var bResult = oVisitor.isMatching(oDescendantControl, function (oAncestor) {
				return oControl === oAncestor;
			}, bDirect);


			if (!bResult) {
				oLogger.debug("Control '" + oControl + "' does not have " + (bDirect ? "direct " : "") + "descendant '" + oDescendantControl);
			}

			return bResult;
		};
	};

}, /* bExport= */ true);
