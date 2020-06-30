/*
 * ! ${copyright}
 */

/**
 * @namespace Provides utitlity functions for OPA tests
 * @name sap.ui.mdc.qunit.p13n.test.Util
 * @author SAP SE
 * @version ${version}
 * @private
 * @since 1.30.0
 */
sap.ui.define([
	'sap/ui/base/Object'
], function(BaseObject) {
	"use strict";

	var Util = BaseObject.extend("sap.ui.mdc.qunit.p13n.test.Util", /** @lends sap.ui.mdc.qunit.p13n.test.Util */
	{});

	/**
	 * @param {sap.m.SegmentedButton || sap.m.List} oNavigationControl
	 */
	Util.getNavigationItem = function(oNavigationControl, sPanelName) {
		if (!oNavigationControl || sPanelName === "") {
			return null;
		}
		var oNavigationItem = null;
		if (sap.ui.Device.system.phone) {
			oNavigationControl.getItems().some(function(oNavigationItem_) {
				if (oNavigationItem_.getTitle() === sPanelName) {
					oNavigationItem = oNavigationItem_;
					return true;
				}
			});
		} else {
			oNavigationControl.getButtons().some(function(oNavigationItem_) {
				if (oNavigationItem_.getText() === sPanelName) {
					oNavigationItem = oNavigationItem_;
					return true;
				}
			});
		}
		return oNavigationItem;
	};

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		var oCore = sap.ui.test.Opa5.getWindow().sap.ui.getCore();
		return oCore.getLibraryResourceBundle(sLibraryName).getText(sTextKey);
	};
	Util.getTextOfChartType = function(sChartType) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.chart.messages");
		return oBundle.getText("info/" + sChartType);
	};

	return Util;
}, /* bExport= */true);
