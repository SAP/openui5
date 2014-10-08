jQuery.sap.declare("sap.ui.demo.poa.model.Config");

sap.ui.demo.poa.model.Config = {};

/**
 * Supply here the service url of the service to fetch data from
 */
sap.ui.demo.poa.model.Config.getServiceUrl = function () {
	return null;
};

/**
 * 
 */
(function () {
	
	// The "reponder" URL parameter defines if the app shall run with mock data
	var responderOn = jQuery.sap.getUriParameters().get("responderOn");
	
	// set the flag for later usage
	sap.ui.demo.poa.model.Config.isMock = ("true" === responderOn) || !sap.ui.demo.poa.model.Config.getServiceUrl();
}
)();