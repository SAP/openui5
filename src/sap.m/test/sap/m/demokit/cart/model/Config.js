jQuery.sap.declare("model.Config");

model.Config = {};

(function () {
	var responderOn = jQuery.sap.getUriParameters().get("responderOn");
	model.Config.isMock = ("true" === responderOn);
}
)();

model.Config.getServiceUrl = function () {
	
	return  model.Config.getHost() + "/sap/opu/odata/IWBEP/EPM_DEVELOPER_SCENARIO_SRV/";

};

model.Config.getUser = function () {
	
	return "ESPM_TEST";

};

model.Config.getPwd = function () {
	
	return "Espm1234";

};

model.Config.getHost = function () {
	
	return "../../../../../proxy/http/ec2-54-225-119-138.compute-1.amazonaws.com:50000";

};