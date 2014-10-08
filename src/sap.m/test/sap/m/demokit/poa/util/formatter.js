jQuery.sap.declare("sap.ui.demo.poa.util.formatter");

jQuery.sap.require("sap.ui.core.format.DateFormat");

sap.ui.demo.poa.util.formatter = {
	
	_statusStateMap : {
		"Neu" : "Warning",
		"Initial" : "Success"
	},
	
	StatusState :  function (value) {
		return (value && sap.ui.demo.poa.util.formatter._statusStateMap[value]) ? sap.ui.demo.poa.util.formatter._statusStateMap[value] : "None";
	},
	
	Quantity :  function (value) {
		try {
			return (value) ? parseFloat(value).toFixed(0) : value;
		} catch (err) {
			return "Not-A-Number";
		}
	},
	
	Date : function (value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"}); 
			return oDateFormat.format(new Date(value));
		} else {
			return value;
		}
	},
	
	AttachmentMap : {
		"ppt" : "ppt-attachment",
		"pdf" : "pdf-attachment",
		"zip" : "attachment-zip-file"
	},
	
	AttachmentIcon : function (value) {
		var map = sap.ui.demo.poa.util.formatter.AttachmentMap;
		var code = (value && map[value]) ? map[value] : "question-mark";
		return "sap-icon://" + code;
	}
};