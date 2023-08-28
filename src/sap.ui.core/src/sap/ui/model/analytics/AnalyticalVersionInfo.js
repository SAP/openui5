/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	var AnalyticalVersionInfo = {
		NONE: null,
		V1: 1,
		V2: 2,
		// find out which model is used
		getVersion: function (oODataModelInstance) {
			var iVersion;
			var sODataModelName;

			// check if the given object has metadata and a class name
			if (oODataModelInstance && oODataModelInstance.getMetadata) {
				sODataModelName = oODataModelInstance.getMetadata().getName();
			}

			switch (sODataModelName) {
				case "sap.ui.model.odata.ODataModel": iVersion = this.V1; break;
				case "sap.ui.model.odata.v2.ODataModel": iVersion = this.V2; break;
				default: iVersion = this.NONE;
					Log.info("AnalyticalVersionInfo.getVersion(...) - The given object is no"
						+ " instance of ODataModel V1 or V2!");
					break;
			}
			return iVersion;
		}
	};

	return AnalyticalVersionInfo;
}, true);