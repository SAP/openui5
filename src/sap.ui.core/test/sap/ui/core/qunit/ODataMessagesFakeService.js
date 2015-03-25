if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(sString, iPosition) {
		iPosition = iPosition === undefined ? 0 : iPosition;
		return this.substr(iPosition, sString.length) === sString;
	}
}




var sServiceUrl = "fakeService://testdata/odata/northwind/";
var mServiceData = {
	collections: {
		"Products": {
			count: 20,
			type: "NorthwindModel.Product",
			properties: {
				"ProductID": { type: "id" },
				"ProductName": { type: "string" },
				"SupplierID": { type: "int", maxValue: 20 },
				"CategoryID": { type: "int", maxValue: 20 },
				"QuantityPerUnit":  { type: "string", choices: ["kg", "pcs", "ml"] },
				"UnitPrice":  { type: "float" },
				"UnitsInStock": { type: "int" },
				"UnitsOnOrder": { type: "int" },
				"ReorderLevel": { type: "int" },
				"Discontinued": { type: "bool" },
			},
			itemMessages: [{ // Messages per Item
				"target": "/ProductName",
				"code": "Item",
				"message": "This Item is very doof",
				"severity": "error",
			}],
			collectionMessages: [{ // Messages per collection
				"code": "BL/308",
				"message": "Steward(ess) Miss Piggy is ill and not available",
				"severity": "info",
			}]
		},
	},
	
	metadata: sNorthwindMetadata
};


var oRandomService = new ODataRandomService(mServiceData);

var xhr = sinon.useFakeXMLHttpRequest(), responseDelay = 50, _setTimeout = window.setTimeout;

xhr.useFilters = true;
xhr.addFilter(function(method, url) {
	return url.indexOf(sServiceUrl) != 0;
});
xhr.onCreate = function(request) {
	request.onSend = function() {
		// Default request answer values:
		var sUrl = request.url;
		var iStart =  sServiceUrl.length;
		var bJson = request.url.indexOf("$format=json") > -1 || request.requestHeaders["Accept"] == "application/json";


		if (sUrl.startsWith(sServiceUrl)) {
			// This one's for us...
			sSubUrl = sUrl.substr(iStart);
			oRandomService.serveUrl({ 
				url: sSubUrl, 
				request: request,
				json: bJson
			});
		}

	}
};









function ODataRandomService(oServiceConfig) {
	this._config = oServiceConfig;
}

var mHeaders = {
	xml: {
		"Content-Type" : "application/xml;charset=utf-8",
		"DataServiceVersion" : "1.0;"
	},
	atom: {
		"Content-Type" : "application/atom+xml;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	},
	json: {
		"Content-Type" : "application/json;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	},
	text: {
		"Content-Type" : "text/plain;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	}
};



ODataRandomService.prototype.serveUrl = function(mOptions) {
	this._url     = mOptions.url;
	this._request = mOptions.request;
	this._useJson = !!mOptions.json;

	aMatches = this._url.match(/^(.*)\?(.*)$/)
	if (aMatches) {
		sPath   = aMatches[1];
		sParams = aMatches[2];
	} else {
		sPath   = sSubUrl;
		sParams = "";
	}

	var sCollection = "";
	var sItem = "";
	var sPostfix = "";
	aMatches = sPath.match(/^([A-Za-z0-9]+)([\(\)(0-9)])*\/(.*)$/);
	if (aMatches && aMatches.length === 3) {
		sCollection = aMatches[1];
		sPostfix = aMatches[2];
	} else if (aMatches && aMatches.length === 4) {
		sCollection = aMatches[1];
		sItem = aMatches[2];
		sPostfix = aMatches[3];
	} else {
		sCollection = sPath;
	}

	if (sPath == "") {
		// Main service URL
		this._answerService(mServiceData);
	} else if (sPath == "$metadata") {
		this._answerMetadata();
	} else if (sPostfix == "$count" && mServiceData.collections[sCollection]) {
		this._answerCollectionCount(mServiceData.collections[sCollection]);
	} else if (!sItem && mServiceData.collections[sCollection]) {
		// Return the whole collection
		this._answerCollection(sCollection, mServiceData.collections[sCollection]);
	} else if (sItem && mServiceData.collections[sCollection]) {
		// return Data for one Item
		this._answerCollectionItem(sItem, sCollection, mServiceData.collections[sCollection]);
	} else {
		this._answerError();
	}
}


ODataRandomService.prototype._answer = function(iStatus, mHeaders, sAnswer) {
	if (this._request.async === true) {
		var oRequest = this._request;
		_setTimeout(function() {
			oRequest.respond(iStatus, mHeaders, sAnswer);
		}.bind(this), responseDelay);
	} else {
		this._request.respond(iStatus, mHeaders, sAnswer);
	}
}

ODataRandomService.prototype._answerError = function(iStatus, mHeaders, sAnswer) {
	var mAnswer = {
		error: {
			code: "GNARF/42",
			message: {
				lang: "en-US",
				value: "Good news everyone: Something horrible happened!"
			}
		}
	};

	var sType = this._useJson ? "json" : "atom";
	var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "error");

	this._answer(200, mHeaders[sType], sAnswer);
};

ODataRandomService.prototype._createXmlAnswer = function(mAnswer, sType) {
	var sAnswer = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

	if (sType === "error") {
		// This is an error response
		sAnswer += "<m:error xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">";
		sAnswer += "<m:code>" + mAnswer.error.code + "</m:code>";
		sAnswer += "<m:message xml:lang=\"" +  mAnswer.error.message.lang + "\">" + mAnswer.error.message.value + "</m:message>";
		sAnswer += "</m:error>";
	} else if (sType === "service") {
		sAnswer += "<service xmlns=\"http://www.w3.org/2007/app\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\">";
		sAnswer += "<workspace>";
		sAnswer += "<atom:title>Default</atom:title>";
		
		for (var i = 0; i < mAnswer.d.EntitySets.length; ++i) {
			var sName = mAnswer.d.EntitySets[i];
			sAnswer += "<collection href=\"" + sName + "\">";
			sAnswer += "<atom:title>" + sName + "</atom:title>";
			sAnswer += "</collection>";
		}
		
		sAnswer += "</workspace>";
		sAnswer += "</service>";
	} else if (sType === "collection") {
		sAnswer += "<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">"; // TODO: xml:base needed?
		// sAnswer += "<id>" + NOTINJSON. + "</id>";
		// sAnswer += "<title>" + NOTINJSON. + "</title>";
		// sAnswer += "<updated>" + NOTINJSON. + "</updated>";
		// sAnswer += "<link rel=\"self\" title=\"" + NOTINJSON. + "\" href=\"" + NOTINJSON + "\" />";
		
		for (var i = 0; i < mAnswer.d.results.length; ++i) {
			var mEntry = mAnswer.d.results[i];
			sAnswer += "<entry>";
			
			sAnswer += "<id>" + mEntry.__metadata.id + "</id>";
			sAnswer += "<content type=\"application/xml\">";
			sAnswer += "<m:properties>";
			
			for (var sProp in mEntry) {
				if (sProp === "__metadata") {
					continue;
				}

				sAnswer += "<d:" + sProp + ">";
				sAnswer += mEntry[sProp];
				sAnswer += "</d:" + sProp + ">";
			}
			
			sAnswer += "</m:properties>";
			sAnswer += "</content>";
			
			sAnswer += "</entry>";
		}
		
		sAnswer += "</feed>";
		
		
	} else if (sType === "entity") {
		throw "nö";
	}
	
	return sAnswer;
};

ODataRandomService.prototype._answerMetadata = function() {
	this._answer(200, mHeaders["xml"], sNorthwindMetadata);
}

ODataRandomService.prototype._answerService = function(oServiceData) {
	var mAnswer = {
		d: {
			EntitySets: oServiceData.collections
		}
	};

	var sType = this._useJson ? "json" : "atom";
	var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "service");

	this._answer(200, mHeaders[sType], sAnswer);
}

ODataRandomService.prototype._answerCollectionCount = function(oColData) {
	this._answer(200, mHeaders["text"], "" + oColData.count);
}

ODataRandomService.prototype._answerCollection = function(sColName, oColData) {
	var aItems = [];
	var aMessages = [];
	
	for (var i = 0; i < oColData.count; ++i) {
		var sItemUrl = sServiceUrl + sColName + "(" + (i + 1) + ")";
		
		var mItem = {
			"__metadata": {
				"id": sItemUrl,
				"uri": sItemUrl,
				"type": oColData.type
			},
		};
		
		for (var sName in oColData.properties) {
			mItem[sName] = this._createData(oColData.properties[sName], i + 1);
		}
		
		aItems.push(mItem);
		
		if (oColData.itemMessages) {
			for (var n = 0; n < oColData.itemMessages.length; ++n) {
				var mMessage = jQuery.extend({}, oColData.itemMessages[n]);
				mMessage.target = "(" + (i + 1) + ")" + oColData.itemMessages[n].target;
				aMessages.push(mMessage);
			}
		}
	}
	
	
	var mAnswer = {
		d: {
			results: aItems
		}
	}
	
	if (oColData.message) {
		aMessages.push(oColData.message);
	}

	if (oColData.collectionMessages) {
		for (var i = 0; i < oColData.collectionMessages.length; ++i) {
			var mMessage = jQuery.extend({}, oColData.collectionMessages[i]);
			mMessage.target = "/" + sColName;
			aMessages.push(mMessage);
		}
	}
	
	var sType = this._useJson ? "json" : "atom";
	var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "collection");

	var mHead = jQuery.extend({}, mHeaders[sType]);
	mHead["sap-message"] = this._createMessageHeader(aMessages);
	
	this._answer(200, mHead, sAnswer);
}

ODataRandomService.prototype._createMessageHeader = function(aMessages) {
	var mMessage = {
		"code": aMessages[0].code,
		"message": aMessages[0].message,
		"severity": aMessages[0].severity,
		"target": aMessages[0].target,
		"details": []
	}
	
	for (var i = 1 /* skip first */; i < aMessages.length; ++i) {
		mMessage.details.push({
			"code": aMessages[i].code,
			"message": aMessages[i].message,
			"severity": aMessages[i].severity,
			"target": aMessages[i].target,
		});
	}
	
	return JSON.stringify(mMessage);
}

ODataRandomService.prototype._createData = function(mOptions, sId) {
	switch (mOptions.type) {
		case "string":
			if (mOptions.choices) {
				return mOptions.choices[Math.floor(Math.random() * mOptions.choices.length)];
			} else {
				return this._createRandomString();
			}

		case "id":
			return sId;

		case "int":
			var iMax = mOptions.maxValue ? mOptions.maxValue : 99;
			return Math.round(Math.random() * iMax);

		case "float":
			var iMax = mOptions.maxValue ? mOptions.maxValue : 99;
			return Math.random() * iMax;

		case "bool":
			return Math.random >= 0.5;

		default:
			return "INVALID DATA TYPE!!!";
	}
}

ODataRandomService.prototype._createRandomString = function(iSyllables) {
	var aSyllables = [[
		"b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z",
		"th", "sh", "ph",
		"bl", "cl", "kl", "pl", "sl",
		"gn", "kn", "pn", "sn",
		"br", "cr", "dr", "fr", "gr", "kr", "pr", "tr"
	], [
		"a", "e", "i", "o", "u", "y",
		"ai", "au", "ay",
		"ei", "ey",
		"ou", "oy",
	]];
	var iSizes = [
		aSyllables[0].length, aSyllables[1].length
	];

	if (iSyllables === undefined) {
		iSyllables = 5;
	}

	var sString = "";

	var s = 0;
	for (var i = 0; i < iSyllables; i++) {
		sString += aSyllables[s][Math.floor(Math.random() * iSizes[s])];
		s = s == 0 ? 1 : 0;
	}

	return sString;
}







var sNorthwindDataJSON = {
	"d" : {
		"EntitySets" : [ "Categories", "CustomerDemographics", "Customers", "Employees", "Order_Details", "Orders", "Products", "Regions", "Shippers", "Suppliers", "Territories", "Alphabetical_list_of_products", "Category_Sales_for_1997", "Current_Product_Lists", "Customer_and_Suppliers_by_Cities", "Invoices", "Order_Details_Extendeds", "Order_Subtotals", "Orders_Qries", "Product_Sales_for_1997", "Products_Above_Average_Prices", "Products_by_Categories", "Sales_by_Categories", "Sales_Totals_by_Amounts", "Summary_of_Sales_by_Quarters", "Summary_of_Sales_by_Years" ]
	}
};

var sNorthwindProductsDataJSON = {
	"d" : {
		"results" : [ {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(1)",
		"uri" : "fakeService://testdata/odata/northwind/Products(1)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(1)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(1)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(1)/Supplier"
			}
		},
		"ProductID" : 1,
		"ProductName" : "Chai",
		"SupplierID" : 1,
		"CategoryID" : 1,
		"QuantityPerUnit" : "10 boxes x 20 bags",
		"UnitPrice" : "18.0000",
		"UnitsInStock" : 39,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 10,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(2)",
		"uri" : "fakeService://testdata/odata/northwind/Products(2)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(2)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(2)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(2)/Supplier"
			}
		},
		"ProductID" : 2,
		"ProductName" : "Chang",
		"SupplierID" : 1,
		"CategoryID" : 1,
		"QuantityPerUnit" : "24 - 12 oz bottles",
		"UnitPrice" : "19.0000",
		"UnitsInStock" : 17,
		"UnitsOnOrder" : 40,
		"ReorderLevel" : 25,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(3)",
		"uri" : "fakeService://testdata/odata/northwind/Products(3)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(3)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(3)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(3)/Supplier"
			}
		},
		"ProductID" : 3,
		"ProductName" : "Aniseed Syrup",
		"SupplierID" : 1,
		"CategoryID" : 2,
		"QuantityPerUnit" : "12 - 550 ml bottles",
		"UnitPrice" : "10.0000",
		"UnitsInStock" : 13,
		"UnitsOnOrder" : 70,
		"ReorderLevel" : 25,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(4)",
		"uri" : "fakeService://testdata/odata/northwind/Products(4)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(4)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(4)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(4)/Supplier"
			}
		},
		"ProductID" : 4,
		"ProductName" : "Chef Anton\'s Cajun Seasoning",
		"SupplierID" : 2,
		"CategoryID" : 2,
		"QuantityPerUnit" : "48 - 6 oz jars",
		"UnitPrice" : "22.0000",
		"UnitsInStock" : 53,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(5)",
		"uri" : "fakeService://testdata/odata/northwind/Products(5)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(5)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(5)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(5)/Supplier"
			}
		},
		"ProductID" : 5,
		"ProductName" : "Chef Anton\'s Gumbo Mix",
		"SupplierID" : 2,
		"CategoryID" : 2,
		"QuantityPerUnit" : "36 boxes",
		"UnitPrice" : "21.3500",
		"UnitsInStock" : 0,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : true
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(6)",
		"uri" : "fakeService://testdata/odata/northwind/Products(6)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(6)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(6)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(6)/Supplier"
			}
		},
		"ProductID" : 6,
		"ProductName" : "Grandma\'s Boysenberry Spread",
		"SupplierID" : 3,
		"CategoryID" : 2,
		"QuantityPerUnit" : "12 - 8 oz jars",
		"UnitPrice" : "25.0000",
		"UnitsInStock" : 120,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 25,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(7)",
		"uri" : "fakeService://testdata/odata/northwind/Products(7)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(7)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(7)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(7)/Supplier"
			}
		},
		"ProductID" : 7,
		"ProductName" : "Uncle Bob\'s Organic Dried Pears",
		"SupplierID" : 3,
		"CategoryID" : 7,
		"QuantityPerUnit" : "12 - 1 lb pkgs.",
		"UnitPrice" : "30.0000",
		"UnitsInStock" : 15,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 10,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(8)",
		"uri" : "fakeService://testdata/odata/northwind/Products(8)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(8)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(8)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(8)/Supplier"
			}
		},
		"ProductID" : 8,
		"ProductName" : "Northwoods Cranberry Sauce",
		"SupplierID" : 3,
		"CategoryID" : 2,
		"QuantityPerUnit" : "12 - 12 oz jars",
		"UnitPrice" : "40.0000",
		"UnitsInStock" : 6,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(9)",
		"uri" : "fakeService://testdata/odata/northwind/Products(9)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(9)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(9)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(9)/Supplier"
			}
		},
		"ProductID" : 9,
		"ProductName" : "Mishi Kobe Niku",
		"SupplierID" : 4,
		"CategoryID" : 6,
		"QuantityPerUnit" : "18 - 500 g pkgs.",
		"UnitPrice" : "97.0000",
		"UnitsInStock" : 29,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : true
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(10)",
		"uri" : "fakeService://testdata/odata/northwind/Products(10)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(10)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(10)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(10)/Supplier"
			}
		},
		"ProductID" : 10,
		"ProductName" : "Ikura",
		"SupplierID" : 4,
		"CategoryID" : 8,
		"QuantityPerUnit" : "12 - 200 ml jars",
		"UnitPrice" : "31.0000",
		"UnitsInStock" : 31,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(11)",
		"uri" : "fakeService://testdata/odata/northwind/Products(11)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(11)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(11)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(11)/Supplier"
			}
		},
		"ProductID" : 11,
		"ProductName" : "Queso Cabrales",
		"SupplierID" : 5,
		"CategoryID" : 4,
		"QuantityPerUnit" : "1 kg pkg.",
		"UnitPrice" : "21.0000",
		"UnitsInStock" : 22,
		"UnitsOnOrder" : 30,
		"ReorderLevel" : 30,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(12)",
		"uri" : "fakeService://testdata/odata/northwind/Products(12)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(12)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(12)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(12)/Supplier"
			}
		},
		"ProductID" : 12,
		"ProductName" : "Queso Manchego La Pastora",
		"SupplierID" : 5,
		"CategoryID" : 4,
		"QuantityPerUnit" : "10 - 500 g pkgs.",
		"UnitPrice" : "38.0000",
		"UnitsInStock" : 86,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(13)",
		"uri" : "fakeService://testdata/odata/northwind/Products(13)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(13)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(13)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(13)/Supplier"
			}
		},
		"ProductID" : 13,
		"ProductName" : "Konbu",
		"SupplierID" : 6,
		"CategoryID" : 8,
		"QuantityPerUnit" : "2 kg box",
		"UnitPrice" : "6.0000",
		"UnitsInStock" : 24,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 5,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(14)",
		"uri" : "fakeService://testdata/odata/northwind/Products(14)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(14)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(14)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(14)/Supplier"
			}
		},
		"ProductID" : 14,
		"ProductName" : "Tofu",
		"SupplierID" : 6,
		"CategoryID" : 7,
		"QuantityPerUnit" : "40 - 100 g pkgs.",
		"UnitPrice" : "23.2500",
		"UnitsInStock" : 35,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(15)",
		"uri" : "fakeService://testdata/odata/northwind/Products(15)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(15)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(15)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(15)/Supplier"
			}
		},
		"ProductID" : 15,
		"ProductName" : "Genen Shouyu",
		"SupplierID" : 6,
		"CategoryID" : 2,
		"QuantityPerUnit" : "24 - 250 ml bottles",
		"UnitPrice" : "15.5000",
		"UnitsInStock" : 39,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 5,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(16)",
		"uri" : "fakeService://testdata/odata/northwind/Products(16)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(16)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(16)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(16)/Supplier"
			}
		},
		"ProductID" : 16,
		"ProductName" : "Pavlova",
		"SupplierID" : 7,
		"CategoryID" : 3,
		"QuantityPerUnit" : "32 - 500 g boxes",
		"UnitPrice" : "17.4500",
		"UnitsInStock" : 29,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 10,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(17)",
		"uri" : "fakeService://testdata/odata/northwind/Products(17)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(17)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(17)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(17)/Supplier"
			}
		},
		"ProductID" : 17,
		"ProductName" : "Alice Mutton",
		"SupplierID" : 7,
		"CategoryID" : 6,
		"QuantityPerUnit" : "20 - 1 kg tins",
		"UnitPrice" : "39.0000",
		"UnitsInStock" : 0,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : true
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(18)",
		"uri" : "fakeService://testdata/odata/northwind/Products(18)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(18)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(18)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(18)/Supplier"
			}
		},
		"ProductID" : 18,
		"ProductName" : "Carnarvon Tigers",
		"SupplierID" : 7,
		"CategoryID" : 8,
		"QuantityPerUnit" : "16 kg pkg.",
		"UnitPrice" : "62.5000",
		"UnitsInStock" : 42,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(19)",
		"uri" : "fakeService://testdata/odata/northwind/Products(19)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(19)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(19)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(19)/Supplier"
			}
		},
		"ProductID" : 19,
		"ProductName" : "Teatime Chocolate Biscuits",
		"SupplierID" : 8,
		"CategoryID" : 3,
		"QuantityPerUnit" : "10 boxes x 12 pieces",
		"UnitPrice" : "9.2000",
		"UnitsInStock" : 25,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 5,
		"Discontinued" : false
		}, {
		"__metadata" : {
		"id" : "fakeService://testdata/odata/northwind/Products(20)",
		"uri" : "fakeService://testdata/odata/northwind/Products(20)",
		"type" : "NorthwindModel.Product"
		},
		"Category" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(20)/Category"
			}
		},
		"Order_Details" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(20)/Order_Details"
			}
		},
		"Supplier" : {
			"__deferred" : {
				"uri" : "fakeService://testdata/odata/northwind/Products(20)/Supplier"
			}
		},
		"ProductID" : 20,
		"ProductName" : "Sir Rodney\'s Marmalade",
		"SupplierID" : 8,
		"CategoryID" : 3,
		"QuantityPerUnit" : "30 gift boxes",
		"UnitPrice" : "81.0000",
		"UnitsInStock" : 40,
		"UnitsOnOrder" : 0,
		"ReorderLevel" : 0,
		"Discontinued" : false
		} ],
	// "__next" : "fakeService://testdata/odata/northwind/Products/?$skiptoken=20"
	}
};

var oProducts1JSON = {
	"d" : {
	"__metadata" : {
	"id" : "fakeService://testdata/odata/northwind/Products(1)",
	"uri" : "fakeService://testdata/odata/northwind/Products(1)",
	"type" : "NorthwindModel.Product"
	},
	"Category" : {
		"__deferred" : {
			"uri" : "fakeService://testdata/odata/northwind/Products(1)/Category"
		}
	},
	"Order_Details" : {
		"__deferred" : {
			"uri" : "fakeService://testdata/odata/northwind/Products(1)/Order_Details"
		}
	},
	"Supplier" : {
		"__deferred" : {
			"uri" : "fakeService://testdata/odata/northwind/Products(1)/Supplier"
		}
	},
	"ProductID" : 1,
	"ProductName" : "Chai",
	"SupplierID" : 1,
	"CategoryID" : 1,
	"QuantityPerUnit" : "10 boxes x 20 bags",
	"UnitPrice" : "18.0000",
	"UnitsInStock" : 39,
	"UnitsOnOrder" : 0,
	"ReorderLevel" : 10,
	"Discontinued" : false
	}
};

var sNorthwindError400XML = '<?xml version="1.0" encoding="utf-8"?><m:error xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><m:code /><m:message xml:lang="en-US">ERROR MESSAGE!!!</m:message></m:error>';
var sNorthwindError400JSON = {
	"odata.error" : {
	"code" : "",
	"message" : {
	"lang" : "en-US",
	"value" : "ERROR MESSAGE!!!."
	}
	}
};
var sNorthwindError501JSON = {
	"odata.error" : {
	"code" : "ErrorCode",
	"message" : {
	"lang" : "en-US",
	"value" : "ERROR MESSAGE!!!."
	}
	}
};


var sNorthwindMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
	<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
		<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
					FromRole="Categories" />\
			</EntityType>\
			<EntityType Name="CustomerDemographic">\
				<Key>\
					<PropertyRef Name="CustomerTypeID" />\
				</Key>\
				<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
					Unicode="true" />\
				<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
					FromRole="CustomerDemographics" />\
			</EntityType>\
			<EntityType Name="Customer">\
				<Key>\
					<PropertyRef Name="CustomerID" />\
				</Key>\
				<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
					FromRole="Customers" />\
				<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
					ToRole="CustomerDemographics" FromRole="Customers" />\
			</EntityType>\
			<EntityType Name="Employee">\
				<Key>\
					<PropertyRef Name="EmployeeID" />\
				</Key>\
				<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
				<Property Name="BirthDate" Type="Edm.DateTime" />\
				<Property Name="HireDate" Type="Edm.DateTime" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
				<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="ReportsTo" Type="Edm.Int32" />\
				<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
					ToRole="Employees1" FromRole="Employees" />\
				<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
					FromRole="Employees1" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
					FromRole="Employees" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
					FromRole="Employees" />\
			</EntityType>\
			<EntityType Name="Order_Detail">\
				<Key>\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
					FromRole="Order_Details" />\
				<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Products" FromRole="Order_Details" />\
			</EntityType>\
			<EntityType Name="Order">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
					FromRole="Orders" />\
				<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
					FromRole="Orders" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
					ToRole="Order_Details" FromRole="Orders" />\
				<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
					FromRole="Orders" />\
			</EntityType>\
			<EntityType Name="Product">\
				<Key>\
					<PropertyRef Name="ProductID" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
					FromRole="Products" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Order_Details" FromRole="Products" />\
				<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
					FromRole="Products" />\
			</EntityType>\
			<EntityType Name="Region">\
				<Key>\
					<PropertyRef Name="RegionID" />\
				</Key>\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
					ToRole="Territories" FromRole="Region" />\
			</EntityType>\
			<EntityType Name="Shipper">\
				<Key>\
					<PropertyRef Name="ShipperID" />\
				</Key>\
				<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
					FromRole="Shippers" />\
			</EntityType>\
			<EntityType Name="Supplier">\
				<Key>\
					<PropertyRef Name="SupplierID" />\
				</Key>\
				<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
					FromRole="Suppliers" />\
			</EntityType>\
			<EntityType Name="Territory">\
				<Key>\
					<PropertyRef Name="TerritoryID" />\
				</Key>\
				<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
				FromRole="Territories" />\
				<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
					FromRole="Territories" />\
			</EntityType>\
			<EntityType Name="Alphabetical_list_of_product">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
			</EntityType>\
			<EntityType Name="Category_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Current_Product_List">\
				<Key>\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Customer_and_Suppliers_by_City">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="Relationship" />\
				</Key>\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
			</EntityType>\
			<EntityType Name="Invoice">\
				<Key>\
					<PropertyRef Name="CustomerName" />\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="Salesperson" />\
					<PropertyRef Name="ShipperName" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Details_Extended">\
				<Key>\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Subtotal">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Orders_Qry">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Product_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_Above_Average_Price">\
				<Key>\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
			</EntityType>\
			<EntityType Name="Sales_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Sales_Totals_by_Amount">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Quarter">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Year">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<Association Name="FK_Products_Categories">\
				<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Categories">\
						<PropertyRef Name="CategoryID" />\
					</Principal>\
					<Dependent Role="Products">\
						<PropertyRef Name="CategoryID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="CustomerCustomerDemo">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
				<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Orders_Customers">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Customers">\
						<PropertyRef Name="CustomerID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="CustomerID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Employees_Employees">\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Employees">\
						<PropertyRef Name="EmployeeID" />\
					</Principal>\
					<Dependent Role="Employees1">\
						<PropertyRef Name="ReportsTo" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Orders_Employees">\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Employees">\
						<PropertyRef Name="EmployeeID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="EmployeeID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="EmployeeTerritories">\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Order_Details_Orders">\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Orders">\
						<PropertyRef Name="OrderID" />\
					</Principal>\
					<Dependent Role="Order_Details">\
						<PropertyRef Name="OrderID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Order_Details_Products">\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Products">\
						<PropertyRef Name="ProductID" />\
					</Principal>\
					<Dependent Role="Order_Details">\
						<PropertyRef Name="ProductID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Orders_Shippers">\
				<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Shippers">\
						<PropertyRef Name="ShipperID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="ShipVia" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Products_Suppliers">\
				<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Suppliers">\
						<PropertyRef Name="SupplierID" />\
					</Principal>\
					<Dependent Role="Products">\
						<PropertyRef Name="SupplierID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Territories_Region">\
				<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Region">\
						<PropertyRef Name="RegionID" />\
					</Principal>\
					<Dependent Role="Territories">\
						<PropertyRef Name="RegionID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
		</Schema>\
		<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
				xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
				<EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
				<EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
				<EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
				<EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
				<EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
				<EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
				<EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
				<EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
				<EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
				<EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
				<EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
				<EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
				<EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
				<EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
				<EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
				<EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
				<EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
				<EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
				<EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
				<EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
				<EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
				<EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
				<EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
				<EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
				<EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
				<EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
				<AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
					<End Role="Categories" EntitySet="Categories" />\
					<End Role="Products" EntitySet="Products" />\
				</AssociationSet>\
				<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
					<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
					<End Role="Customers" EntitySet="Customers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
					<End Role="Customers" EntitySet="Customers" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Employees1" EntitySet="Employees" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Products" EntitySet="Products" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
					<End Role="Orders" EntitySet="Orders" />\
					<End Role="Shippers" EntitySet="Shippers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
					<End Role="Products" EntitySet="Products" />\
					<End Role="Suppliers" EntitySet="Suppliers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
					<End Role="Region" EntitySet="Regions" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>';

