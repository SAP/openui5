/*!
 * ${copyright}
 */

jQuery.sap.declare("sap.ui.demokit.icex.model.Config");

sap.ui.demokit.icex.model.Config = {};

sap.ui.demokit.icex.model.Config.getPageSize = function() {

	// Lacking the capability to detect the rendering performance
	// of the device we assume that "desktop devices"
	// are 5 times faster than "mobile" devices.
	return (sap.ui.Device.system.desktop) ? 250 : 50;
};
