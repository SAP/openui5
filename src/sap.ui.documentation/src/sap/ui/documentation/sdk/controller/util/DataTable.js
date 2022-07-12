/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/m/library",
	"../config/datatable",
	"./datatable/filters/DataTableFilterDropDown",
	"./datatable/filters/DataTableFilterRange",
	"sap/ui/documentation/sdk/controller/util/Highlighter",
	"./DataTableUtil"
], function (
	$,
	Input,
	mobileLibrary,
	datatableConfig,
	DataTableFilterDropDown,
	DataTableFilterRange,
	Highlighter,
	DataTableUtil
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	/**
	 *
	 * @constructor
	 */
	function DataTable() {
		// reference to column object
		this.oColumns = [];

		// those are set before a column.draw method is called and
		// are used in the datatable search function to determinate
		// what filter should be applied
		this.oChangedFilters = [];
		this.aShownRows = [];

		// jQeury DataTable API
		this.API = null;
	}

	DataTable.DEFAULT_SORTING = "0,asc";
	DataTable.FILTER_CLASS_WRAPPER = "sapUiDocumentationDatatableFilterWrapper";

	DataTable.FILTER_TYPES = {
		REGEX: "REGEX",
		NORMAL: "NORMAL",
		NUMBER: "NUMBER",
		SELECT: "SELECT",
		CELL_RANGE: "CELL_RANGE",
		NUMBER_RANGE: "NUMBER_RANGE"
	};

	DataTable.prototype.destroy = function () {
		this.oColumns.forEach(function (oColumn) {
			if (oColumn.highlighter) {
				oColumn.highlighter.destroy();
                oColumn.highlighter = null;
			}

			oColumn.aControls.forEach(function (oControl) {
				oControl.destroy();
            });

            oColumn.aControls = [];
		});

		this.oColumns = [];
		this.API.destroy();
	};

	DataTable.prototype.get = function (sProp) {
		return this.oConfig[sProp];
	};

	DataTable.prototype.init = function (sId, oTable, oConfig) {
		this.sId = sId;

		this.oDomTable = oTable;
		this.oConfig = this.getConfig(sId, oConfig);
		// create datatable
		var API = $(oTable)
			.DataTable(
				Object.assign(
					this.oConfig,
					this.getLifeCycleMethods(sId, oConfig)
				)
			);

		API.on('draw', function () {

			if (this.get("highlight")) {
                var sTerms = API.search();

				if (sTerms || this.oChangedFilters.length) {
                    // global search or column filter has a value,
                    // loop through columns and apply global search value,
                    // filter value or both
                    this.oColumns.forEach(function (oColumn, iIndex) {
                        var sFilterValue = this.oChangedFilters[iIndex] && this.oChangedFilters[iIndex].value,
                            bIsArray = Array.isArray(sFilterValue); // filter type select

                        if (bIsArray) {
                            sFilterValue = sFilterValue.reduce(function (sResult, oCheckbox, iIndex) {
                                if (oCheckbox.value) {
                                    sResult += " " + oCheckbox.text;
                                }
                                return sResult;
                            }, "");
                        }

                        if (sFilterValue && !(typeof sFilterValue === "object" /* filter type range */ )) {
                            if (sTerms) {
					            sTerms += " " + sFilterValue;
                            } else {
                                sTerms = sFilterValue;
                            }
                        }

                        this.highlight(iIndex, sTerms);
                    }, this);

				} else {
                    // no filter has value, so we remove highlight
					this.highlight(null, "");
				}

			}

		}.bind(this));

		API.buttons().container()
			.insertBefore('#' + sId + '_length');

		API.on('column-visibility.dt', function (e, settings, iColumnIndex, bVisibleState) {
			this.onColumnVisibilityChange(iColumnIndex, bVisibleState);
		}.bind(this));

		this.oConfig.columns.forEach(function (oParams, iIndex) {
			this.onColumnVisibilityChange(iIndex, oParams.visible);
		}, this);

		return this;
	};

	DataTable.prototype.highlight = function (aColumnIndex, sTerms) {
		if (aColumnIndex === null) {
			// highlight all columns
			this.oColumns.forEach(function (oColumn) {
				oColumn.highlighter.highlight(sTerms);
			});

			return;
		}

		this.oColumns[aColumnIndex].highlighter.highlight(sTerms);
	};

	DataTable.prototype.onColumnVisibilityChange = function (iIndex, bVisible) {
		var oFilterHeader = this.oColumns[iIndex] && this.oColumns[iIndex].filterHeader,
			oColGroup = this.oDomTable.querySelector("colgroup"), // colgroup contains cols which can configure the whole column (ex. width, color, etc.)
			oColGroupChild;

		if (oColGroup) {
			oColGroupChild = oColGroup.children[iIndex];

			if (oColGroupChild) {
				oColGroupChild.classList.toggle("hidden", !bVisible);
			}
		}

		if (oFilterHeader) {
			oFilterHeader.toggle(bVisible);
		}
	};

	DataTable.prototype.handleSearch = function (settings, oData, index, rowData, counter) {
		var sEntryValue,
			aEntryValue,
			oChangedFilterValue,
			oChangedFilterControl,
			aShow = [],
			bShow;


		this.oChangedFilters.forEach(function (oChangedFilter, iIndex) {
			sEntryValue = oData[iIndex];
			oChangedFilterValue = oChangedFilter.value;
			oChangedFilterControl = oChangedFilter.control;

			if (oChangedFilterValue === "") {
				// filter value is probably deleted
				// show all entries
				return;
			}

			switch (true) {
				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.REGEX):
				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.NORMAL):
				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.ALPHA_NUMERIC):
				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.NUMBER):
					// filter if string is contained
					bShow = sEntryValue.toLowerCase().indexOf(oChangedFilterValue.toLowerCase()) > -1;
					break;

				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.NUMBER_RANGE):
					// filter by given range
					var min = oChangedFilterValue.from !== "" ? oChangedFilterValue.from : Number.MIN_SAFE_INTEGER,
						max = oChangedFilterValue.to !== "" ? oChangedFilterValue.to : Number.MAX_SAFE_INTEGER,
						current = parseFloat(sEntryValue) || 0;

					bShow = (isNaN(min) && isNaN(max)) ||
						(isNaN(min) && current <= max) ||
						(min <= current && isNaN(max)) ||
						(min <= current && current <= max);
					break;

				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.CELL_RANGE):
					// filter by given cell range
					var arr = sEntryValue.split("-"),
						fInputValue = parseFloat(oChangedFilterValue);

					bShow = arr[0] <= fInputValue && arr[1] >= fInputValue;
					break;

				case oChangedFilterControl.hasStyleClass(DataTable.FILTER_TYPES.SELECT):
					// select with multiple selectable options
					var hasChecked = oChangedFilterValue.some(function (checkBox) {
						return checkBox.value;
					});

					bShow = !hasChecked || (oChangedFilterValue.findIndex(function (checkBox) {
						aEntryValue = settings.aoData[index].anCells[iIndex].querySelectorAll("li");
						var aEntryValuesAsStrings = [];

						if (aEntryValue.length) {
							for (var i = 0; i < aEntryValue.length; i++) {
								aEntryValuesAsStrings[i] = aEntryValue[i].textContent;
							}
						} else {
							aEntryValuesAsStrings.push(sEntryValue);
						}

						return checkBox.value && (aEntryValuesAsStrings.indexOf(checkBox.text) > -1);
					}, this) > -1);
					break;

				default:
					bShow = true;
			}

			aShow.push(bShow);

		}, this);

		return aShow.indexOf(false) < 0;
	};

	DataTable.prototype.getConfig = function (sId, oConfig) {
		var aOrders = [],
			oNewConfig = JSON.parse(JSON.stringify(datatableConfig.getPreset()));

		oNewConfig.sapTableId = sId;

        // columnDefs is a plugin configuration which cares for sorting
		oNewConfig.columnDefs = [];

		if (oConfig) {

			oNewConfig.save = oConfig['save'] !== false;
			oNewConfig.searching = oConfig['search'] !== false;
			oNewConfig.highlight = oConfig['highlight'] !== false;

			if (oConfig['excel_export']) {
				oNewConfig.buttons.push('csv');
			}

			if (oConfig['paginate']) {
				var iPaginate = parseInt(oConfig['paginate']);
				oNewConfig.pageLength = iPaginate > 0 ? iPaginate : -1;
			}

			oNewConfig.columns = oConfig.columns.map(function (aColumnParams, iColIndex) {
				var result = {
					visible: true
				};

                result.visible = aColumnParams.visible !== false;

                if (aColumnParams.sort) {
                    // find if we already have configured a type of sorting create new config
                    // and push targets (columns)

                    var oSort = oNewConfig.columnDefs.find(function (oSort) {
                        return oSort.type === aColumnParams.sort;
                    });

                    if (oSort) {
                        oSort.targets.push(iColIndex);
                    } else {
                        oNewConfig.columnDefs.push({
                            type: aColumnParams.sort,
                            targets: [iColIndex]
                        });
                    }
                }

				return result;
			});

			oConfig['initial_sort'] = oConfig['initial_sort'] || DataTable.DEFAULT_SORTING;

			if (oConfig['initial_sort'] !== 'none') {
				aOrders = oConfig['initial_sort'].split(';');
				aOrders = aOrders.map(function (aItems) {
					return aItems.split(',');
				});
			}

			oNewConfig.order = aOrders;

		}

		return oNewConfig;
	};

	DataTable.prototype.onFilterChange = function (iColumnIndex, oOptions) {
		// modify global state
		// setting parameters before drawing of column
		this.oChangedFilters[iColumnIndex] = {
			control: oOptions.control,
			value: oOptions.value
		};

		this.API.columns(iColumnIndex).draw();
	};


	DataTable.prototype.getSelectOptions = function (iColumnIndex) {
		// loop through select options and map them to array
		var aOptions = [];

		this.API
			.columns(iColumnIndex)
			.data()
			.unique()
			.sort()[0]
			.forEach(function (sOption) {
				var oOption;

				if (aOptions.indexOf(sOption) > -1) {
					// if options is already in array return as we don't want duplicates
					return;
				}

				try {
					// some options are lists with list items (ul > li),
					// so we wrap them to jQuery objects and push their
					// values to the array of options if they are not already pushed

					// some options may contain special characters ( "(", ")", ";" ...)
					// this throws exception when we wrap them with jQuery and stops
					// javascript execution
					oOption = $(sOption);
				} catch (error) {
					oOption = null;
				}

				if (oOption && oOption.length > 0) {
					oOption.find('li').each(function (i, sOption) {
						if (aOptions.indexOf(sOption.textContent) < 0) {
							aOptions.push(sOption.textContent);
						}
					});
				} else {
					aOptions.push(sOption);
				}

			});

		aOptions.sort(DataTableUtil.sortAlphaNumeric);

		return aOptions;
	};

	DataTable.prototype.getLifeCycleMethods = function (sId, oConfig) {
		var that = this;

		return {
			initComplete: function () {
				that.API = this.api();

				// Create new table row to append filters
				var oTableHeader = $('#' + sId + ' > thead'),
					oNewTableRow = $('<tr/>'),
					oFilterHeader,
					oHighlighter,
					iIndex = 0;

				this.api().columns().every(function () {
					// loop each column and create filter (table header(th)/filterHeader) from column filter params
					// append to the newly created table row
					// attach change events and modify state to use later when
					// table is about to redraw itself
					var iLocalIndex = iIndex,
						aColumnParams = oConfig.columns[iIndex],
						aOptions = [],
						oFilter,
						bIsTypeSelect = aColumnParams.filter === "select";

					oFilterHeader = $('<th/>');
					oFilterHeader.addClass(DataTable.FILTER_CLASS_WRAPPER);

					that.oColumns[iIndex] = {};
					that.oColumns[iIndex].aControls = [];
					that.oColumns[iIndex].filterHeader = oFilterHeader;

					if (that.get("highlight")) {
						oHighlighter = new Highlighter([].slice.call(this.nodes()), {
							useExternalStyles: false,
							shouldBeObserved: true,
							isCaseSensitive: false
						});

						that.oColumns[iIndex].highlighter = oHighlighter;
					}

					if (bIsTypeSelect) {
						aOptions = that.getSelectOptions(iIndex);
					}

					// prepare filter
					oFilter = DataTable.getFilterByType(aColumnParams.filter, aOptions);

					// append filter
					if (oFilter.control) {
						that.oColumns[iIndex].aControls.push(oFilter.control);

						oFilter.control.attachEvent(oFilter.event, function (oEvent) {
							that.onFilterChange(iLocalIndex, {
								value: oEvent.getParameter("value"),
								control: oFilter.control
							});
						});
						oFilter.control.placeAt(oFilterHeader[0]);
					}

					oNewTableRow.append(oFilterHeader);

					iIndex++;
				});

				oTableHeader.append(oNewTableRow);
			}
		};
	};

	DataTable.getFilterByType = function (sTypeValue, aOptions) {
		var oControl, sEvent = "liveChange";

		switch (sTypeValue) {
			case 'number-range':
				oControl = new DataTableFilterRange({
					from: new Input({ type: InputType.Number, placeholder: "From" }),
					to: new Input({ type: InputType.Number, placeholder: "To" })
				}).addStyleClass(DataTable.FILTER_TYPES.NUMBER_RANGE);
				break;

			case 'select':
				sEvent = "change";
				oControl = new DataTableFilterDropDown({
					options: aOptions
				}).addStyleClass(DataTable.FILTER_TYPES.SELECT);
				break;

			case 'none':
				oControl = '';
				break;

			default:
				// inputs
				var sFilterType = DataTable.FILTER_TYPES.NORMAL,
					sInputType = InputType.Text;

				if (sTypeValue === 'regex') {
					sFilterType = DataTable.FILTER_TYPES.REGEX;
				} else if (sTypeValue === 'cell-range') {
					sFilterType = DataTable.FILTER_TYPES.CELL_RANGE;
					sInputType = InputType.Number;
				} else if (sTypeValue === 'number') {
					sFilterType = DataTable.FILTER_TYPES.NUMBER;
					sInputType = InputType.Number;
				}

				oControl = new Input({
					type: sInputType,
					placeholder: "Filter"
				}).addStyleClass(sFilterType);
		}

		return { control: oControl, event: sEvent };
	};

	return DataTable;
});