/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/Device'], function(Device) {
	"use strict";

	return {
		getPageSize: function() {

			// Lacking the capability to detect the rendering performance
			// of the device we assume that "desktop devices"
			// are 5 times faster than "mobile" devices.
			return (Device.system.desktop) ? 250 : 50;
		}
	};
});
