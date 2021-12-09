sap.ui.define([
	"./GridTable.delegate",
	"./Books.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator',
	"sap/ui/model/odata/type/Int32",
	"sap/m/Text"
], function (ODataTableDelegate, BooksFBDelegate, Field, Link, FieldDisplay, FilterUtil, DelegateUtil, Core, Filter, FilterOperator, Int32Type, Text) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);

	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	BooksTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		return oODataProps.then(function (aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the fieldHelp for some of the properties. Without fieldHelp the filter panel will not provide the expected VH.
			// TODO fieldHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty){
				if (oProperty.name === "title") {
					oProperty.caseSensitive = false;
				}

				if (oProperty.name === "subgenre_code") {
					oProperty.label = "Sub Genre";
				}

				if (oProperty.name === "ID" || oProperty.name === "author_ID") {
					oProperty.typeConfig.typeInstance = new Int32Type({groupingEnabled: false}, {nullable: false}); // needed for Field in table
					oProperty.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
				}

			});

			return aProperties;
		});
	};

	BooksTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return BooksFBDelegate.addItem(sPropertyName, oTable)
				.then(function(oFilterField) {

					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					if (sPropertyName === "author_ID") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH1"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "title") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH4"));
					} else if (sPropertyName === "published") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHPublished"));
						oFilterField.setOperators(["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"]);
					} else if (sPropertyName === "language_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHLanguage"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "stock") {
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["BT"]);
					} else if (sPropertyName === "classification_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHClassification"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "genre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "subgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHSubGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "detailgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHDetailGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "currency_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH-Currency"));
						oFilterField.setDisplay(FieldDisplay.Value);
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["EQ"]);
					}
					return oFilterField;
				});
			}
		};
	};

	BooksTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		if (oProperty.name === "currency_code") { // Just use text to test rendering Text vs Field
			return new Text({
				text: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
				width:"100%"
			});
		}

		var oCtrlProperties = {
			value: {path: oProperty.path || oProperty.name, type: oProperty.typeConfig.typeInstance},
			editMode: "Display",
			width:"100%",
			multipleLines: false
		};


		if (oProperty.name === "price") {
			oCtrlProperties.value = "{parts: [{path: 'price'}, {path: 'currency_code'}], type: 'sap.ui.model.type.Currency'}";
		}

		if (["title", "descr"].indexOf(oProperty.name) != -1) {
			oCtrlProperties.multipleLines = true;
		}

		if (oProperty.name === "language_code") {
			oCtrlProperties.additionalValue = "{language/name}";
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHLanguage");
		}

		if (oProperty.name === "genre_code") {
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHGenreSingle");
		}

		if (oProperty.name === "subgenre_code") {
			oCtrlProperties.display = FieldDisplay.Description;
			oCtrlProperties.fieldHelp = getFullId(oTable, "FHSubGenreSingle");
		}

		if (oProperty.name === "title") {

			oCtrlProperties = {
				id: "tFieldLinkTitle",
				value: "{title}",
				editMode: "Display",
				multipleLines: true,
				fieldInfo: new Link({
					sourceControl:"tFieldLinkTitle",
					delegate: {
						name: "sap/ui/mdc/flp/FlpLinkDelegate",
						payload: {
							semanticObjects: ["FakeFlpSemanticObject"],
							mainSemanticObject: "FakeFlpSemanticObject"
						}
					}
				})
			};

		}

		if (oProperty.name === "author_ID") {

			oCtrlProperties = {
				id: "tFieldLinkAuthor",
				value: {path: 'author_ID', type: new Int32Type({groupingEnabled: false}, {nullable: false})},
				additionalValue:"{author/name}",
				display: FieldDisplay.DescriptionValue,
				editMode: "Display",
				fieldInfo: new Link({
					delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
				})
			};

		}

		if (oProperty.name === "classification_code") {
			oCtrlProperties.additionalValue = "{classification/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		if (oProperty.name === "detailgenre_code") {
			oCtrlProperties.additionalValue = "{detailgenre/title}";
			oCtrlProperties.display = FieldDisplay.Description;
		}

		return new Field(oCtrlProperties);
	};

	BooksTableDelegate.addItem = function (sPropertyName, oTable, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

			if (oProperty.name === "title") {
				oColumn.setWidth("15rem");
			} else if (oProperty.name === "currency_code") {
				oColumn.setWidth("5rem");
			} else if (oProperty.name != "descr") {
				oColumn.setWidth(["actions", "stock", "ID"].indexOf(oProperty.name) != -1 ? "6rem" : "10rem");
			}

			//oColumn.getTemplate().destroy();
			// if (oColumn._oTemplateClone) {
			// 	oColumn._oTemplateClone.destroy();
			// 	delete oColumn._oTemplateClone;
			// }

			var oTemplate = BooksTableDelegate._createColumnTemplate(oTable, oProperty);
			oColumn.setTemplate(oTemplate);

			return oColumn;
		});
	};

	BooksTableDelegate.updateBindingInfo = function(oTable, oDelegatePayload, oBindingInfo) {
		ODataTableDelegate.updateBindingInfo.apply(this, arguments);

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		var oDataStateIndicator = oTable.getDataStateIndicator();
		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			if (oBindingInfo.filters) { // adjust already created filters as it may come from FilterBar or from Table-Filtering
				var aPropertiesMetadata = oTable.getPropertyHelper().getProperties();

				var fnAdjustDate = function(sValue, bStart) {
					if (sValue && typeof sValue === "string" && sValue.indexOf("T") > 0) {
						var aParts = sValue.split("T");
						var sDate = aParts[0];
						var sTime = aParts[1];
						aParts = sDate.split("-");
						var iYear = parseInt(aParts[0]);
						var iMonth = parseInt(aParts[1]) - 1;
						var iDay = parseInt(aParts[2]);
						var iIndex = sTime.indexOf("+") !== -1 ? sTime.indexOf("+") : sTime.indexOf("-");
						var sOffset = sTime.slice(iIndex);
						var sSign = sOffset[0];
						var iOffsetHours = parseInt(sOffset.substr(1, 2));
						var iOffsetMinutes = parseInt(sOffset.substr(4));
						sTime = sTime.substr(0, iIndex);
						aParts = sTime.split(":");
						var iHours = parseInt(aParts[0]);
						var iMinutes = parseInt(aParts[1]);
						aParts = aParts[2].split(".");
						var iSeconds = parseInt(aParts[0]);
						var iMilliseconds = parseInt(aParts[1]);
						if (sSign === "-") {
							iMinutes = iMinutes + iOffsetMinutes;
							iHours = iHours + iOffsetHours;
						} else {
							iMinutes = iMinutes - iOffsetMinutes;
							iHours = iHours - iOffsetHours;
						}
						var oDate = new Date(Date.UTC(iYear, iMonth, iDay, iHours, iMinutes, iSeconds, iMilliseconds));
						var sYear = oDate.getUTCFullYear().toString();
						iMonth = oDate.getUTCMonth() + 1;
						var sMonth = iMonth < 10 ? "0" + iMonth : iMonth.toString();
						iDay = oDate.getUTCDate();
						var sDay = iDay < 10 ? "0" + iDay : iDay.toString();
						iHours = oDate.getUTCHours();
						var sHours = iHours < 10 ? "0" + iHours : iHours.toString();
						iMinutes = oDate.getUTCMinutes();
						var sMinutes = iMinutes < 10 ? "0" + iMinutes : iMinutes.toString();
						iSeconds = oDate.getUTCSeconds();
						iMilliseconds = bStart ? 0 : 999;
						var fSeconds = iSeconds + iMilliseconds / 1000;
						var sSeconds = iSeconds < 10 ? "0" + fSeconds.toPrecision(4) : fSeconds.toPrecision(5);
						var sNewValue =  sYear + "-" + sMonth + "-" + sDay + "T" + sHours + ":" + sMinutes + ":" + sSeconds + "Z";
						return sNewValue;
					} else {
						return sValue;
					}
				};

				var fnAdjustDateTimeFilter = function(oFilter) {
					if (oFilter.sOperator === FilterOperator.EQ && oFilter.oValue1 && typeof oFilter.oValue1 === "string" && oFilter.oValue1.indexOf("T") > 0) {
						// as milliseconds stored at service - convert into a range
						var vValue = oFilter.oValue1;
						oFilter.oValue1 = fnAdjustDate(vValue, true);
						oFilter.oValue2 = fnAdjustDate(vValue, false);
						oFilter.sOperator = FilterOperator.BT;
					} else if (oFilter.sOperator === FilterOperator.BT || oFilter.sOperator === FilterOperator.NB) {
						oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, true);
						oFilter.oValue2 = fnAdjustDate(oFilter.oValue2, false);
					} else if (oFilter.sOperator === FilterOperator.LT || oFilter.sOperator === FilterOperator.GE) {
						oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, true);
					} else if (oFilter.sOperator === FilterOperator.GT || oFilter.sOperator === FilterOperator.LE) {
						oFilter.oValue1 = fnAdjustDate(oFilter.oValue1, false);
					}
				};

				var fnAdjustFilter = function(oFilter) {
					if (oFilter.aFilters) {
						for (var j = 0; j < oFilter.aFilters.length; j++) {
							fnAdjustFilter(oFilter.aFilters[j]);
						}
					} else {
						var oProperty = FilterUtil.getPropertyByKey(aPropertiesMetadata, oFilter.sPath);
						if (oProperty.typeConfig.typeInstance.getMetadata().getName() === "sap.ui.model.odata.type.DateTimeOffset") {
							fnAdjustDateTimeFilter(oFilter);
						}
					}
				};

				fnAdjustFilter(oBindingInfo.filters);
			}

		}

	};

	return BooksTableDelegate;
});
