/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ColumnLayout.
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'sap/ui/layout/library',
	'./FormLayout',
	'./ColumnLayoutRenderer',
	"sap/ui/thirdparty/jquery"
],
	function(Device, ResizeHandler, library, FormLayout, ColumnLayoutRenderer, jQuery) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.layout.form.ColumnLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ColumnLayout</code> control renders a <code>Form</code> control in a column-based responsive way.
	 * Depending on its size, the <code>Form</code> control is divided into one or more columns.
	 * (XL - max. 4 columns, L - max. 3 columns, M -  max. 2 columns and S - 1 column.)
	 *
	 * The <code>FormContainer</code> elements are spread out to the columns depending on the number of <code>FormContainer</code>
	 * elements and their size. For example, if there are 4 columns and 2 <code>FormContainer</code> elements,
	 * each <code>FormContainer</code> element will use 2 columns. If there are 3 columns and 2 <code>FormContainer</code> elements,
	 * the larger one will use 2 columns, the smaller one 1 column. The size of a <code>FormContainer</code> element will be determined
	 * based on the number of visible <code>FormElement</code> elements assigned to it.
	 * If there are more <code>FormContainer</code> elements than columns, every <code>FormContainer</code> element uses only
	 * one column. So the last row of the <code>Form</code> control will not be fully used.
	 *
	 * The default size of the <code>FormContainer</code> element can be overwritten by using <code>ColumnContainerData</code>
	 * as <code>LayoutData</code>. If one <code>FormContainer</code> element has <code>ColumnContainerData</code> set,
	 * the size calculation of the other <code>FormContainer</code> elements might not lead to the expected result.
	 * In this case, use <code>ColumnContainerData</code> also for the other <code>FormContainer</code> elements.
	 *
	 * The <code>FormElement</code> elements are spread out to the columns of a <code>FormContainer</code> element
	 * arranged in a newspaper-like order. The position of the labels and fields depends on the size of the used column.
	 * If there is enough space, the labels are beside the fields, otherwise above the fields.
	 *
	 * The default size of a content control of a <code>FormElement</code> element can be overwritten
	 * using <code>ColumnElementData</code> as <code>LayoutData</code>.
	 * If one control assigned to a <code>FormElement</code> element has <code>ColumnElementData</code> set,
	 * the size calculation of the other controls assigned to the <code>FormElement</code> element
	 * might not lead to the expected result.
	 * In this case, use <code>ColumnElementData</code> for the other controls, assigned to the <code>FormElement</code> element, too.
	 *
	 * The placement of the <code>FormElement</code> elements is made by the browser <code>column-count</code> logic.
	 * So this can be different in different browsers and lead in some cases to other results than might be expected.
	 *
	 * <b>Note:</b>
	 * This control cannot be used stand-alone, it just renders a <code>Form</code> control,
	 * so it must be assigned to a <code>Form</code> control using the <code>layout</code> aggregation.
	 * @extends sap.ui.layout.form.FormLayout
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.56.0
	 * @alias sap.ui.layout.form.ColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnLayout = FormLayout.extend("sap.ui.layout.form.ColumnLayout", /** @lends sap.ui.layout.form.ColumnLayout.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Number of columns for extra-large size.
			 *
			 * The number of columns for extra-large size must not be smaller than the number of columns for large size.
			 */
			columnsXL : {type : "sap.ui.layout.form.ColumnsXL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns for large size.
			 *
			 * The number of columns for large size must not be smaller than the number of columns for medium size.
			 */
			columnsL : {type : "sap.ui.layout.form.ColumnsL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns for medium size.
			 */
			columnsM : {type : "sap.ui.layout.form.ColumnsM", group : "Appearance", defaultValue : 1},

			/**
			 * Defines how many cells a label uses if the column is large.
			 */
			labelCellsLarge : {type : "sap.ui.layout.form.ColumnCells", group : "Appearance", defaultValue : 4},

			/**
			 * Defines how many cells are empty at the end of a row.
			 * This could be used to keep the fields small on large screens.
			 */
			emptyCellsLarge : {type : "sap.ui.layout.form.EmptyCells", group : "Appearance", defaultValue : 0}
		}
	}});

	/* eslint-disable no-lonely-if */

	ColumnLayout.prototype.init = function(){

		this._iBreakPointTablet = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		this._resizeProxy = jQuery.proxy(_handleResize, this);

	};

	ColumnLayout.prototype.exit = function(){

		_cleanup.call(this);

	};

	ColumnLayout.prototype.onBeforeRendering = function( oEvent ){

		if (this.getColumnsM() > this.getColumnsL() || this.getColumnsL() > this.getColumnsXL() ) {
			throw new Error("Column size not correct defined for " + this);
		}

		_cleanup.call(this);

	};

	ColumnLayout.prototype.onAfterRendering = function( oEvent ){

		this._sResizeListener = ResizeHandler.register(this, this._resizeProxy);
		_handleResize.call(this);

	};

	ColumnLayout.prototype.toggleContainerExpanded = function(oContainer){

		oContainer.$().toggleClass("sapUiFormCLContainerColl", !oContainer.getExpanded());

	};

	ColumnLayout.prototype.onLayoutDataChange = function(oEvent){

		this.invalidate();

	};

	ColumnLayout.prototype.onsapup = function(oEvent){

		this.onsapleft(oEvent);

	};

	ColumnLayout.prototype.onsapdown = function(oEvent){

		this.onsapright(oEvent);

	};

	/**
	 * As <code>Elements</code> must not have a DOM reference it is not clear if one exists.
	 * In this layout a <code>FormContainer</code> has an own DOM representation.
	 *
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
	 * @return {Element} The <code>FormContainer</code> element's DOM representation or null
	 * @private
	 */
	ColumnLayout.prototype.getContainerRenderedDomRef = function(oContainer) {

		return oContainer.getDomRef();

	};

	/**
	 * As <code>Elements</code> must not have a DOM reference it is not clear if one exists.
	 * In this layout a <code>FormElement</code> has an own DOM representation.
	 *
	 * @param {sap.ui.layout.form.FormElement} oElement <code>FormElement</code>
	 * @return {Element} The <code>FormElement</code> element's DOM representation or null
	 * @private
	 */
	ColumnLayout.prototype.getElementRenderedDomRef = function(oElement) {

		return oElement.getDomRef();

	};

	/**
	 * Calculates the size and the line breaks for a <code>FormContainer</code> element.
	 * This is needed for the rendering.
	 *
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
	 * @return {object} An object containing the size, the line-break and the first row information for the different sizes
	 * @private
	 */
	ColumnLayout.prototype._getContainerSize = function(oContainer) {

		var oForm = this.getParent();
		var oLD = this.getLayoutDataForElement(oContainer, "sap.ui.layout.form.ColumnContainerData");
		var aContainers = oForm.getVisibleFormContainers();
		var iContainers = aContainers.length;
		var iColumnsM = this.getColumnsM();
		var iColumnsL = this.getColumnsL();
		var iColumnsXL = this.getColumnsXL();

		var oOptions = {
				S: {Size: 1, Break: false, FirstRow: false},
				M: {Size: 1, Break: false, FirstRow: false},
				L: {Size: 1, Break: false, FirstRow: false},
				XL: {Size: 1, Break: false, FirstRow: false}};

		var getOptionsDefault = function(iColumns, oOptions, iContainers, iIndex, bMaxContainer) {
			if (iContainers < iColumns) {
				// if there are less containers than columns and there is a column left
				// the largest container gets this extra column
				oOptions.Size = Math.floor(iColumns / iContainers);
				if (bMaxContainer && oOptions.Size * iContainers < iColumns) {
					oOptions.Size = oOptions.Size + iColumns - oOptions.Size * iContainers;
				}
			}
			// line-break only needed if more than one column
			oOptions.Break = iColumns > 1 && iIndex > 0 && (iIndex % iColumns) === 0;
			oOptions.FirstRow = iContainers > 1 && iIndex < iColumns;
		};

		if (oLD) {
			oOptions.M.Size = oLD.getColumnsM();
			oOptions.L.Size = oLD.getColumnsL();
			oOptions.XL.Size = oLD.getColumnsXL();

			if (oOptions.M.Size > iColumnsM || oOptions.L.Size > iColumnsL || oOptions.XL.Size > iColumnsXL) {
				throw new Error("More cells defined for FormContainer " + oContainer.getId() + " than columns on " + this);
			}
		}

		if (iContainers === 1) {
			// only one container - keep it simple
			if (!oLD) {
				oOptions.M.Size = iColumnsM;
				oOptions.L.Size = iColumnsL;
				oOptions.XL.Size = iColumnsXL;
			}
			oOptions.S.FirstRow = true;
			oOptions.M.FirstRow = true;
			oOptions.L.FirstRow = true;
			oOptions.XL.FirstRow = true;
		} else {
			var iContainer = 0;
			var iMaxElement = 0;
			var iMaxContainer = 0;
			var oOtherLD;
			var bLDUsed = false;
			var iDefaultContainers = 0;
			var iDefaultColumnsM = iColumnsM;
			var iDefaultColumnsL = iColumnsL;
			var iDefaultColumnsXL = iColumnsXL;
			var i = 0;

			for (i = 0; i < iContainers; i++) {
				if (oContainer === aContainers[i]) {
					iContainer = i;
					oOtherLD = oLD;
				} else {
					oOtherLD = this.getLayoutDataForElement(aContainers[i], "sap.ui.layout.form.ColumnContainerData");
				}

				if (!oOtherLD) {
					var aElements = aContainers[i].getVisibleFormElements();
					if (iMaxElement < aElements.length) {
						iMaxElement = aElements.length;
						iMaxContainer = i; // use first container with the max size to be larger
					}
					iDefaultContainers++;
				} else {
					bLDUsed = true;
					iDefaultColumnsM = iDefaultColumnsM - oOtherLD.getColumnsM();
					iDefaultColumnsL = iDefaultColumnsL - oOtherLD.getColumnsL();
					iDefaultColumnsXL = iDefaultColumnsXL - oOtherLD.getColumnsXL();
				}
			}

			oOptions.S.FirstRow = iContainers > 1 && iContainer === 0;
			oOptions.S.Break = iContainer > 0;

			if (!bLDUsed) {
				getOptionsDefault(iColumnsM, oOptions.M, iContainers, iContainer, iContainer === iMaxContainer);
				getOptionsDefault(iColumnsL, oOptions.L, iContainers, iContainer, iContainer === iMaxContainer);
				getOptionsDefault(iColumnsXL, oOptions.XL, iContainers, iContainer, iContainer === iMaxContainer);
			} else {
				// if layout data are used at least for one container a container wise check is needed to
				// determine line break and first row.

				// calculate size (only if there is enough place)
				if (!oLD) {
					if (iDefaultContainers < iDefaultColumnsM) {
						getOptionsDefault(iDefaultColumnsM, oOptions.M, iDefaultContainers, iContainer, iContainer === iMaxContainer);
					}
					if (iDefaultContainers < iDefaultColumnsL) {
						getOptionsDefault(iDefaultColumnsL, oOptions.L, iDefaultContainers, iContainer, iContainer === iMaxContainer);
					}
					if (iDefaultContainers < iDefaultColumnsXL) {
						getOptionsDefault(iDefaultColumnsXL, oOptions.XL, iDefaultContainers, iContainer, iContainer === iMaxContainer);
					}
				}

				// calculate line breaks
				var oSizes = {M: {rowColumns: 0, lineBreak: false, first: true},
						          L: {rowColumns: 0, lineBreak: false, first: true},
				              XL: {rowColumns: 0, lineBreak: false, first: true}};

				var calculateLineBreak = function(oSize, iColumns, iUsedColumns) {
					if (iUsedColumns) {
						if (oSize.rowColumns + iUsedColumns <= iColumns) {
							oSize.rowColumns = oSize.rowColumns + iUsedColumns;
							oSize.lineBreak = false;
						} else {
							oSize.rowColumns = iUsedColumns;
							if (iColumns > 1) {
								oSize.lineBreak = true;
							}
							oSize.first = false;
						}
					} else {
						if (oSize.rowColumns < iColumns) {
							oSize.rowColumns++;
							oSize.lineBreak = false;
						} else {
							oSize.rowColumns = 1;
							if (iColumns > 1) {
								oSize.lineBreak = true;
							}
							oSize.first = false;
						}
					}
				};
				for (i = 0; i < iContainers; i++) {
					if (oContainer === aContainers[i]) {
						oOtherLD = oLD;
					} else {
						oOtherLD = this.getLayoutDataForElement(aContainers[i], "sap.ui.layout.form.ColumnContainerData");
					}

					calculateLineBreak(oSizes.M, iColumnsM, (oOtherLD ? oOtherLD.getColumnsM() : 0));
					calculateLineBreak(oSizes.L, iColumnsL, (oOtherLD ? oOtherLD.getColumnsL() : 0));
					calculateLineBreak(oSizes.XL, iColumnsXL, (oOtherLD ? oOtherLD.getColumnsXL() : 0));

					if (oContainer === aContainers[i]) {
						oOptions.M.Break = oSizes.M.lineBreak;
						oOptions.L.Break = oSizes.L.lineBreak;
						oOptions.XL.Break = oSizes.XL.lineBreak;
						oOptions.M.FirstRow = oSizes.M.first;
						oOptions.L.FirstRow = oSizes.L.first;
						oOptions.XL.FirstRow = oSizes.XL.first;
						break;
					}
				}
			}
		}

		return oOptions;

	};

	/**
	 * Calculates the size and the line breaks for a control inside a <code>FormElement</code> element.
	 * This is needed for the rendering.
	 *
	 * There are only 2 options to order Labels and Fields
	 * a) On small columns (<=600px) -> Labels above Fields
	 * b) On wide columns (>600px) -> Labels before fields
	 * One Element has 12 cells
	 *
	 * @param {sap.ui.core.Control} oField content control
	 * @return {object} An object containing the size, the line-break and spacing information for the different sizes
	 * @private
	 */
	ColumnLayout.prototype._getFieldSize = function(oField) {

		var iColumns = 12;
		var oLD = this.getLayoutDataForElement(oField, "sap.ui.layout.form.ColumnElementData");
		var oOptions = {S: {Size: iColumns, Break: false, Space: 0}, L: {Size: iColumns, Break: false, Space: 0}};
		var iLabelSizeS = iColumns;
		var iLabelSizeL = this.getLabelCellsLarge();

		if (oLD) {
			oOptions.S.Size = oLD.getCellsSmall();
			oOptions.L.Size = oLD.getCellsLarge();
		}

		var oElement = oField.getParent();
		var oLabel = oElement.getLabelControl();

		if (oLabel === oField) {
			if (!oLD) {
				oOptions.S.Size = iLabelSizeS;
				oOptions.L.Size = iLabelSizeL;
			}
		} else {
			var aFields = oElement.getFieldsForRendering();
			var iFields = aFields.length;
			var iColumnsS = iColumns;
			var iColumnsL = iColumns - this.getEmptyCellsLarge();

			if (oLabel) {
				var oLabelLD = this.getLayoutDataForElement(oLabel, "sap.ui.layout.form.ColumnElementData");
				if (oLabelLD) {
					iLabelSizeS = oLabelLD.getCellsSmall();
					iLabelSizeL = oLabelLD.getCellsLarge();
				}
				if (iLabelSizeS < iColumns) {
					iColumnsS = iColumnsS - iLabelSizeS;
				}
				if (iLabelSizeL < iColumns) {
					iColumnsL = iColumnsL - iLabelSizeL;
				}
			} else {
				iLabelSizeS = 0;
				iLabelSizeL = 0;
			}

			if (iFields === 1) {
				// keep standard case simple
				if (!oLD) {
					oOptions.S.Size = iColumnsS;
					oOptions.L.Size = iColumnsL;
				} else if (oLabel) {
					if (oOptions.S.Size > iColumnsS) {
						oOptions.S.Break = true;
					}
					if (oOptions.L.Size > iColumnsL) {
						oOptions.L.Break = true;
					}
				}
			} else {
				// multiple fields
				var i = 0;
				var aRowsS = [];
				var aRowsL = [];
				var oRow = {availableCells: iColumnsS, first: 0, last: 999, firstDefault: -1, defaultFields: 0};
				var iRowS = 0;
				var iRowL = 0;
				var iField = 0;
				var oOtherLD;

				aRowsS.push(jQuery.extend({}, oRow));
				oRow.availableCells = iColumnsL;
				aRowsL.push(jQuery.extend({}, oRow));

				var createNewRow = function(aRows, iRow, iIndex, iColumns) {
					aRows[iRow].last = iIndex - 1;
					aRows.push(jQuery.extend({}, oRow));
					iRow++;
					aRows[iRow].first = iIndex;
					aRows[iRow].availableCells = iColumns;
					return iRow;
				};

				var checkLD = function(aRows, iRow, iCells, iUseColumns, iIndex) {
					if (aRows[iRow].availableCells - aRows[iRow].defaultFields < iCells) {
						// field will not fit into row
						if (iCells <= iUseColumns) {
							iRow = createNewRow(aRows, iRow, iIndex, iUseColumns);
						} else {
							// field to large to be beside Label -> use full row
							iRow = createNewRow(aRows, iRow, iIndex, iColumns);
						}
					}
					aRows[iRow].availableCells = aRows[iRow].availableCells - iCells;
					return iRow;
				};

				var checkDefault = function(aRows, iRow, iColumns, iIndex) {
					if (aRows[iRow].availableCells === aRows[iRow].defaultFields) {
						// field will not fit into row
						iRow = createNewRow(aRows, iRow, iIndex, iColumns);
					}
					if (aRows[iRow].firstDefault < 0) {
						aRows[iRow].firstDefault = iIndex;
					}
					aRows[iRow].defaultFields++;
					return iRow;
				};

				// determine rows and available cells
				for (i = 0; i < iFields; i++) {
					if (oField !== aFields[i]) {
						oOtherLD = this.getLayoutDataForElement(aFields[i], "sap.ui.layout.form.ColumnElementData");
					} else {
						oOtherLD = oLD;
						iField = i;
					}

					if (oOtherLD) {
						iRowS = checkLD(aRowsS, iRowS, oOtherLD.getCellsSmall(), iColumnsS, i);
						iRowL = checkLD(aRowsL, iRowL, oOtherLD.getCellsLarge(), iColumnsL, i);
					} else {
						iRowS = checkDefault(aRowsS, iRowS, iColumnsS, i);
						iRowL = checkDefault(aRowsL, iRowL, iColumnsL, i);
					}
				}

				// determine size of Field
				var determineSize = function(aRows, iField, oLD, oOptions, iLabelSize) {
					var iRemain = 0;
					var oRow;

					for (i = 0; i < aRows.length; i++) {
						if (iField >= aRows[i].first && iField <= aRows[i].last) {
							oRow = aRows[i];
							break;
						}
					}

					if (!oLD) {
						oOptions.Size = Math.floor(oRow.availableCells / oRow.defaultFields);
					}
					if (iField === oRow.first && iField > 0) {
						oOptions.Break = true;
						if (iLabelSize > 0 && iLabelSize < iColumns && oOptions.Size <= iColumns - iLabelSize) {
							oOptions.Space = iLabelSize;
						}
					}
					if (iField === oRow.firstDefault) {
						// add remaining cells to first  default field
						iRemain = oRow.availableCells - oRow.defaultFields * oOptions.Size;
						if (iRemain > 0) {
							oOptions.Size = oOptions.Size + iRemain;
						}
					}
				};

				determineSize(aRowsS, iField, oLD, oOptions.S, iLabelSizeS);
				determineSize(aRowsL, iField, oLD, oOptions.L, iLabelSizeL);
			}

		}

		return oOptions;

	};

	function _cleanup(){

		if (this._sResizeListener) {
			ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

	}

	function _handleResize(oEvent, bNoRowResize){

		var oDomRef = this.getDomRef();
		// Prove if DOM reference exist, and if not - clean up the references.
		if (!oDomRef) {
			_cleanup.call(this);
			return;
		}

		var $DomRef = this.$();
		if (!$DomRef.is(":visible")) {
			return;
		}

		var iWidth = oDomRef.clientWidth;
		var iColumns = 1;
		if (iWidth <= this._iBreakPointTablet) {
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Phone", true);
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Desktop", false).toggleClass("sapUiFormCLMedia-Std-Tablet", false).toggleClass("sapUiFormCLMedia-Std-LargeDesktop", false);
		} else if ((iWidth > this._iBreakPointTablet) && (iWidth <= this._iBreakPointDesktop)) {
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Tablet", true);
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Desktop", false).toggleClass("sapUiFormCLMedia-Std-Phone", false).toggleClass("sapUiFormCLMedia-Std-LargeDesktop", false);
			iColumns = this.getColumnsM();
		} else if ((iWidth > this._iBreakPointDesktop) && (iWidth <= this._iBreakPointLargeDesktop)) {
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Desktop", true);
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Phone", false).toggleClass("sapUiFormCLMedia-Std-Tablet", false).toggleClass("sapUiFormCLMedia-Std-LargeDesktop", false);
			iColumns = this.getColumnsL();
		} else {
			$DomRef.toggleClass("sapUiFormCLMedia-Std-LargeDesktop", true);
			$DomRef.toggleClass("sapUiFormCLMedia-Std-Desktop", false).toggleClass("sapUiFormCLMedia-Std-Phone", false).toggleClass("sapUiFormCLMedia-Std-Tablet", false);
			iColumns = this.getColumnsXL();
		}

		var bWideColumns = this.getLabelCellsLarge() < 12 && iWidth / iColumns > this._iBreakPointTablet;
		$DomRef.toggleClass("sapUiFormCLWideColumns", bWideColumns);
		$DomRef.toggleClass("sapUiFormCLSmallColumns", !bWideColumns);

	}

	return ColumnLayout;

});