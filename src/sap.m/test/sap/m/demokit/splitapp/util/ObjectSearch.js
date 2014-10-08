jQuery.sap.declare("util.ObjectSearch");

util.ObjectSearch = {

	getPath : function (oData, sProperty, oValue) {
		return this._getPath(oData, sProperty, oValue, "/");
	},
	
	_getPath : function (oData, sProperty, oValue, sPath) {
		
		// iterate attributes
		for (var p in oData) {
			if (oData[p] instanceof Array) {
				
				// step down into recursion for arrays
				for (var i = 0 ; i < oData[p].length ; i++) {
					var result = this._getPath(oData[p][i], sProperty, oValue, sPath + p + "/" + i + "/");
					if (result) {
						return result;
					}
				}
				
			} else {
				
				// check property
				if (p === sProperty && oData[p] === oValue) {
					return sPath;
				}
			}
		}
		return null;
	}
};