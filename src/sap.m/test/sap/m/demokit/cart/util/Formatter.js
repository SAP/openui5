jQuery.sap.declare("util.Formatter");
jQuery.sap.require("model.Config");

util.Formatter = {
		
	price :  function (value) {
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			minFractionDigits: 2,
			groupingEnabled: true,
			groupingSeparator: ".",
			decimalSeparator: ","
		});
		return numberFormat.format(value);
	},
	
	totalPrice : function (value) {
		var bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		return bundle.getText("CART_TOTAL_PRICE") + ": " + util.Formatter.price(value);
	},
	
	_statusTextMap : {
		"A" : sap.ui.getCore().getModel("i18n").getResourceBundle().getText("STATUS_A"),
		"O" : sap.ui.getCore().getModel("i18n").getResourceBundle().getText("STATUS_O"),
		"D" : sap.ui.getCore().getModel("i18n").getResourceBundle().getText("STATUS_D")
	},
	
	statusText : function (status) {
		return (util.Formatter._statusTextMap[status]) ? util.Formatter._statusTextMap[status] : status;
	},
	
	_statusStateMap : {
		"A" : "Success",
		"O" : "Warning",
		"D" : "Error"
	},
	
	statusState : function (status) {
		return (util.Formatter._statusStateMap[status]) ? util.Formatter._statusStateMap[status] : "None";
	},
	
	pictureUrl: function (pictureUrl) {
		return (!model.Config.isMock && pictureUrl) ? model.Config.getHost() + pictureUrl : pictureUrl;
	}
};