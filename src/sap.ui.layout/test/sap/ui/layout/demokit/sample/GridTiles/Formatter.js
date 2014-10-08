jQuery.sap.declare("sap.ui.layout.sample.GridTiles.Formatter");

sap.ui.layout.sample.GridTiles.Formatter = {
	
	categoryIcon : function (sValue) {
		var sIcon;
		switch (sValue) {
		case "Projector":
			sIcon = "sap-icon://projector";
			break;
		case "Graphics Card":
			sIcon = "sap-icon://measure";
			break;
		case "Accessory":
			sIcon = "sap-icon://widgets";
			break;
		case "Printer":
			sIcon = "sap-icon://print";
			break;
		case "Monitor":
			sIcon = "sap-icon://sys-monitor";
			break;
		case "Laptop":
			sIcon = "sap-icon://laptop";
			break;
		case "Keyboard":
			sIcon = "sap-icon://collections-management";
			break;
		default:
			sIcon = "sap-icon://product";
		}
		return sIcon;
	}
};