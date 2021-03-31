sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/Field",
	"sap/ui/core/library"
], function (ODataTableDelegate, Field, CoreLibrary) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);

	//Shortcut to core messagetype
	var MessageType = CoreLibrary.MessageType;

	BooksTableDelegate.fetchProperties = function (oTable) {
		return ODataTableDelegate.fetchProperties.apply(this, arguments);
	};

	BooksTableDelegate._createColumnTemplate = function (oInfo) {
		var oProps = { value: "{" + (oInfo.path || oInfo.name) + "}", editMode: "Display", width:"100%", multipleLines: false };

		if (oInfo.name === "price") {
			oProps.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oInfo.name) != -1) {
			oProps.multipleLines = true;
		}

		return Promise.resolve(new Field(oProps));
	};

	BooksTableDelegate.validateState = function(oTable, oState){
		var mExistingColumns = {};

		//Map columns for easier access
		mExistingColumns = oState.items.reduce(function(mMap, oProp, iIndex){
			mMap[oProp.name] = oProp;
			return mMap;
		}, {});

		//Check if there is a sorter for a unselected column
		var bShowWarning = oState.sorters.some(function(oSorter){
			return !mExistingColumns[oSorter.name];
		});

		return {
			validation: bShowWarning ? MessageType.Warning : MessageType.None,
			message: "Please note: you have added a sorter for an unselected column!"
		};
	};

	BooksTableDelegate._createColumn = function (sPropertyInfoName, oTable) {
		return ODataTableDelegate._createColumn.apply(this, arguments).then(function (oColumn) {

			var sProp = oColumn.getDataProperty(),
				aSmallCols = ["actions", "stock", "ID"];

			if (sProp === "title") {
				oColumn.setWidth("15rem");
			} else if (sProp != "descr") {
				oColumn.setWidth(aSmallCols.indexOf(sProp) != -1 ? "6rem" : "10rem");
			}

			return oColumn;
		});
	};

	return BooksTableDelegate;
});
