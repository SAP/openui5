jQuery.sap.declare("sap.m.sample.StandardListItemInfo.Formatter");

sap.m.sample.StandardListItemInfo.Formatter = {

	status :  function (sStatus) {
			if (sStatus === "Available") {
				return "Success";
			} else if (sStatus === "Out of Stock") {
				return "Warning";
			} else if (sStatus === "Discontinued"){
				return "Error";
			} else {
				return "None";
			}
	}
};