sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/thirdparty/sinon"
], function (Controller, sinon) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.AnalyticsCloudContent", {
		onInit: function () {

			// to run use browser with cors turned off
			// <chrome dir>./chrome.exe --user-data-dir="C://chrome-dev-disabled-security" --disable-web-security
			// for login - see credentials in related Jira item

			// Turn off sinon fake server as it interferes with the requests and brakes the widget.
			const oSinonXhr = sinon.useFakeXMLHttpRequest();
			oSinonXhr.restore();
		}
	});
});