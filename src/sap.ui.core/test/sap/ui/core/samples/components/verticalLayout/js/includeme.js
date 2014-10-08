var foo = function(id, sSize){
	var elem = jQuery.sap.byId(id);
	if (elem){
		elem.css("font-size", sSize);
	}
};