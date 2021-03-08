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
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProps) {
			var aFrontProps = [{
				description: undefined,
				filterable: true,
				label: "Author",
				maxLength: undefined,
				name: "author/name",
				path: "author/name",
				precision: undefined,
				scale: undefined,
				sortable: false,
				type: "Edm.String",
				typeConfig: oTable.getTypeUtil().getTypeConfig("Edm.String")
			}];
			aProps.forEach(function(oProperty){
				if (oProperty.name === "language_code") {
					oProperty.fieldHelp = "FHLanguage";
				}

				if (oProperty.name === "genre_code") {
					oProperty.fieldHelp = "FHGenre";
					oProperty.label = "Genre";
				}

				if (oProperty.name === "subgenre_code") {
					oProperty.fieldHelp = "FHSubGenreSingle";
					oProperty.label = "Sub Genre";
				}
			});
			return aFrontProps.concat(aProps);
		});
	};

	BooksTableDelegate._createColumnTemplate = function (oInfo) {

		var oProps = { value: "{" + (oInfo.path || oInfo.name) + "}", editMode: "Display", width:"100%", multipleLines: false };


		if (oInfo.name === "price") {
			oProps.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oInfo.name) != -1) {
			oProps.multipleLines = true;
		}

		if (oInfo.name === "language_code") {

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLink",
				value: "{language/name}",
				editMode: "Display"
			}));

		}

		if (oInfo.name === "title") {

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLinkTitle",
				value: "{title}",
				editMode: "Display",

				multipleLines: true,
				fieldInfo: new sap.ui.mdc.Link({ sourceControl:"fTitle", delegate: {
					name: "sap/ui/mdc/flp/FlpLinkDelegate", payload: {
						semanticObjects: ["FakeFlpSemanticObject"],
						mainSemanticObject: "FakeFlpSemanticObject"
					}
				} })
			}));

		}

		if (oInfo.name === "author_name") {

			return Promise.resolve(new sap.ui.mdc.Field({
				id: "tFieldLink",
				value: "{author/name}",
				editMode: "Display",
				multipleLines: true,
				fieldInfo: new sap.ui.mdc.Link({ delegate: { name: 'sap/ui/v4demo/delegate/Books.Link.delegate' } })
			}));

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
