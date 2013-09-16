jQuery.sap.declare("utils.formatter");

// jQuery.sap.require("sap.ui.core.format.DateFormat");

utils.formatter = {
	Enable: function(value) {
		return value !== 0;
	},
	RowCount: function() {
		var height = $(window).height();
		return (parseInt((height - 640) / 120) + 3);
	}
};