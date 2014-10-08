jQuery.sap.declare("util.Sorter");

util.Sorter = {
	
	sortByName : function(a, b) {
		if (!a || !a.name) {
			return -1;
		} else if (!b || !b.name) {
			return 1;
		} else {
			var aName = a.name.toLowerCase();
			var bName = b.name.toLowerCase();
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		}
	}
 };