
sap.ui.define([
	"sap/ui/integration/Designtime",
	"sap/base/util/merge"
], function (
	Designtime,
	merge
) {
	"use strict";
	var iValueCount = 0;
	var iNameCount = 0;
	return {
		changeValue: function (sValue) {
			iValueCount++;
			return sValue + " value " + iValueCount;
		},
		changeName: function (sName) {
			iNameCount++;
			return sName + " name " + iNameCount;
		},
		fnValidate: function (value, config, context) {
			//context object contains 2 properties:
			//- requestData
			//  function to request data online
			//- control
			//  current control of the parameter
			return context.requestData({
			  "data": {
				"extension": {
				  "method": "checkCanSeeCourses"
				},
				"path": "/canSeeCourses"
			  }
			}).then(function (canSeeCourses){
				//console.log("validateResult: " + canSeeCourses + " for " + config.manifestpath);
				if (!canSeeCourses) {
					context.control.setEditable(false);
				}
				return true;
			});
		},
		checkValueCount: function (value, config, context) {
			if (value.length < 6) {
				return true;
			}
			return false;
		}
	};
});