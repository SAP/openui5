/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ResponsiveGridLayout.
sap.ui.define(['jquery.sap.global', 'sap/ui/layout/Grid', 'sap/ui/layout/GridData', './FormLayout', 'sap/ui/layout/library'],
	function(jQuery, Grid, GridData, FormLayout, library) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.layout.form.ResponsiveGridLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Renders a <code>Form</code> using a responsive grid. Internally the <code>Grid</code> control is used for rendering.
	 * Using this layout, the <code>Form</code> is rendered in a responsive way.
	 * Depending on the available space, the <code>FormContainers</code> are rendered in one or different columns and the labels are rendered in the same row as the fields or above the fields.
	 * This behavior can be influenced by the properties of this layout control.
	 *
	 * On the <code>FormContainers</code>, labels and content fields, <code>GridData</code> can be used to change the default rendering.
	 * <code>GridData</code> is not supported for <code>FormElements</code>.
	 *
	 * <b>Note:</b> If <code>GridData</code> is used, this may result in a much more complex layout than the default one.
	 * This means that in some cases, the calculation for the other content may not bring the expected result.
	 * In such cases, <code>GridData</code> should be used for all content controls to disable the default behavior.
	 *
	 * This control cannot be used standalone, it only renders a <code>Form</code>, so it must be assigned to a <code>Form</code>.
	 * @extends sap.ui.layout.form.FormLayout
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.ResponsiveGridLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveGridLayout = FormLayout.extend("sap.ui.layout.form.ResponsiveGridLayout", /** @lends sap.ui.layout.form.ResponsiveGridLayout.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Default span for labels in extra large size.
			 *
			 * <b>Note:</b> If the default value -1 is not overwritten with the meaningful one then the <code>labelSpanL</code> value is used.
			 * @since 1.34.0
			 */
			labelSpanXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Default span for labels in large size.
			 *
			 * <b>Note:</b> If <code>adjustLabelSpanThis</code> is set, this property is only used if more than 1 <code>FormContainer</code> is in one line. If only 1 <code>FormContainer</code> is in the line, then the <code>labelSpanM</code> value is used.
			 * @since 1.16.3
			 */
			labelSpanL : {type : "int", group : "Misc", defaultValue : 4},

			/**
			 * Default span for labels in medium size.
			 *
			 * <b>Note:</b> If <code>adjustLabelSpanThis</code> is set this property is used for full-size <code>FormContainers</code>. If more than one <code>FormContainer</code> is in one line, <code>labelSpanL</code> is used.
			 * @since 1.16.3
			 */
			labelSpanM : {type : "int", group : "Misc", defaultValue : 2},

			/**
			 * Default span for labels in small size.
			 * @since 1.16.3
			 */
			labelSpanS : {type : "int", group : "Misc", defaultValue : 12},

			/**
			 * If set, the usage of <code>labelSpanL</code> and <code>labelSpanM</code> are dependent on the number of <code>FormContainers</code> in one row.
			 * If only one <code>FormContainer</code> is displayed in one row, <code>labelSpanM</code> is used to define the size of the label.
			 * This is the same for medium and large <code>Forms</code>.
			 * This is done to align the labels on forms where full-size <code>FormContainers</code> and multiple-column rows are used in the same <code>Form</code>
			 * (because every <code>FormContainer</code> has its own grid inside).
			 *
			 * If not set, the usage of <code>labelSpanL</code> and <code>labelSpanM</code> are dependent on the <code>Form</code> size.
			 * The number of <code>FormContainers</code> doesn't matter in this case.
			 * @since 1.34.0
			 */
			adjustLabelSpan : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Number of grid cells that are empty at the end of each line on extra large size.
			 *
			 * <b>Note:</b> If the default value -1 is not overwritten with the meaningful one then the <code>emptySpanL</code> value is used.
			 * @since 1.34.0
			 */
			emptySpanXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Number of grid cells that are empty at the end of each line on large size.
			 * @since 1.16.3
			 */
			emptySpanL : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Number of grid cells that are empty at the end of each line on medium size.
			 * @since 1.16.3
			 */
			emptySpanM : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Number of grid cells that are empty at the end of each line on small size.
			 * @since 1.16.3
			 */
			emptySpanS : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Number of columns for extra large size.
			 *
			 * The number of columns for extra large size must not be smaller than the number of columns for large size.
			 * <b>Note:</b> If the default value -1 is not overwritten with the meaningful one then the <code>columnsL</code> value is used (from the backward compatibility reasons).
			 * @since 1.34.0
			 */
			columnsXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Number of columns for large size.
			 *
			 * The number of columns for large size must not be smaller than the number of columns for medium size.
			 * @since 1.16.3
			 */
			columnsL : {type : "int", group : "Misc", defaultValue : 2},

			/**
			 * Number of columns for medium size.
			 * @since 1.16.3
			 */
			columnsM : {type : "int", group : "Misc", defaultValue : 1},

			/**
			 * If the <code>Form</code> contains only one single <code>FormContainer</code> and this property is set,
			 * the <code>FormContainer</code> is displayed using the full size of the <code>Form</code>.
			 * In this case the properties <code>columnsXL</code>, <code>columnsL</code> and <code>columnsM</code> are ignored.
			 *
			 * In all other cases the <code>FormContainer</code> is displayed in the size of one column.
			 * @since 1.34.0
			 */
			singleContainerFullSize : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Breakpoint (in pixel) between large size and extra large (XL) size.
			 * @since 1.34.0
			 */
			breakpointXL : {type : "int", group : "Misc", defaultValue : 1440},

			/**
			 * Breakpoint (in pixel) between Medium size and Large size.
			 * @since 1.16.3
			 */
			breakpointL : {type : "int", group : "Misc", defaultValue : 1024},

			/**
			 * Breakpoint (in pixel) between Small size and Medium size.
			 * @since 1.16.3
			 */
			breakpointM : {type : "int", group : "Misc", defaultValue : 600}
		}
	}});

	/*
	 * The ResponsiveGridLayout uses Grid controls to render the Form
	 * If more than one FormContainer is used, there is an outer Grid (mainGrid) that holds the FormContainers.
	 * Each FormContainer holds its own Grid where the FormElements content is placed.
	 * If a FormContainer has a Title or is expandable it is rendered as a ResponsiveGridLayoutPanel.
	 * The panels and Grid layouts are stored in this.mContainers. This has the following structure:
	 * - For each FormContainer there is an entry inside the object. (this.mContainers[FormContainerId])
	 * - For each FormContainer there is an array with 2 entries:
	 *   - [0]: The Panel that renders the Container (undefined if no panel is used)
	 *   - [1]: The Grid that holds the Containers content
	 *          - the getLayoutData function of this Grid is overwritten to get the LayoutData of the FormContainer
	 *            (If no panel is used)
	 *
	 * It must make sure that this object is kept up to date, so for this reason it is filled onBeforeRendering. Entries that are no longer used are deleted.
	 *
	*/

	sap.ui.core.Control.extend("sap.ui.layout.form.ResponsiveGridLayoutPanel", {

		metadata : {
			aggregations: {
				"content"   : {type: "sap.ui.layout.Grid", multiple: false}
			},
			associations: {
				"container" : {type: "sap.ui.layout.form.FormContainer", multiple: false},
				"layout"    : {type: "sap.ui.layout.form.ResponsiveLayout", multiple: false}
			}
		},

		getLayoutData :  function(){

			// only ResponsiveFlowLayoutData are interesting
			var oContainer = sap.ui.getCore().byId(this.getContainer());
			var oLayout    = sap.ui.getCore().byId(this.getLayout());
			var oLD;
			if (oLayout && oContainer) {
				oLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.GridData");
			}
			if (oLD) {
				return oLD;
			} else {
				return this.getAggregation("layoutData");
			}

		},

		getCustomData :  function(){

			var oContainer = sap.ui.getCore().byId(this.getContainer());
			if (oContainer) {
				return oContainer.getCustomData();
			}

		},

		refreshExpanded :  function(){

			var oContainer = sap.ui.getCore().byId(this.getContainer());
			if (oContainer) {
				if (oContainer.getExpanded()) {
					this.$().removeClass("sapUiRGLContainerColl");
				} else {
					this.$().addClass("sapUiRGLContainerColl");
				}
			}
		},

		renderer : function(oRm, oPanel) {

			var oContainer = sap.ui.getCore().byId(oPanel.getContainer());
			var oLayout    = sap.ui.getCore().byId(oPanel.getLayout());
			var oContent   = oPanel.getContent();

			var bExpandable = oContainer.getExpandable();
			var sTooltip = oContainer.getTooltip_AsString();
			var oToolbar = oContainer.getToolbar();
			var oTitle = oContainer.getTitle();

			oRm.write("<div");
			oRm.writeControlData(oPanel);
			oRm.addClass("sapUiRGLContainer");
			if (bExpandable && !oContainer.getExpanded()) {
				oRm.addClass("sapUiRGLContainerColl");
			}
			if (oToolbar) {
				oRm.addClass("sapUiFormContainerToolbar");
			} else if (oTitle) {
				oRm.addClass("sapUiFormContainerTitle");
			}

			if (sTooltip) {
				oRm.writeAttributeEscaped('title', sTooltip);
			}
			oRm.writeClasses();

			oLayout.getRenderer().writeAccessibilityStateContainer(oRm, oContainer);

			oRm.write(">");

			// container header
			if (oToolbar) {
				oRm.renderControl(oToolbar);
			} else if (oContainer.getTitle()) {
				oLayout.getRenderer().renderTitle(oRm, oTitle, oContainer._oExpandButton, bExpandable, false, oContainer.getId());
			}

			if (oContent) {
				oRm.write("<div");
				oRm.addClass("sapUiRGLContainerCont");
				oRm.writeClasses();
				oRm.write(">");
				// container is not expandable or is expanded -> render elements
				oRm.renderControl(oContent);
				oRm.write("</div>");
			}

			oRm.write("</div>");
		}

	});

	/* eslint-disable no-lonely-if */

	ResponsiveGridLayout.prototype.init = function(){

		this.mContainers = {}; //association of container to panel and Grid
		this.oDummyLayoutData = new GridData(this.getId() + "--Dummy");
	};

	ResponsiveGridLayout.prototype.exit = function(){

		var that = this;

		// clear panels
		for ( var sContainerId in this.mContainers) {
			_cleanContainer(that, sContainerId);
		}

		// clear main Grid
		if (this._mainGrid) {
			this._mainGrid.destroy();
			delete this._mainGrid;
		}

		this.oDummyLayoutData.destroy();
		this.oDummyLayoutData = undefined;

	};

	ResponsiveGridLayout.prototype.onBeforeRendering = function( oEvent ){

		var oForm = this.getParent();
		if (!oForm || !(oForm instanceof sap.ui.layout.form.Form)) {
			// layout not assigned to form - nothing to do
			return;
		}

		oForm._bNoInvalidate = true; // don't invalidate Form if only the Grids, Panels and LayoutData are created or changed)
		var that = this;
		_createPanels(that, oForm);
		_createMainGrid(that, oForm);
		oForm._bNoInvalidate = false;

	};

	ResponsiveGridLayout.prototype.onAfterRendering = function( oEvent ){

		// if main grid is used, deregister resize listeners of container grids. Because resize is triggered from main grid
		// container grids can't resize if main grid is not resized.
		if (this._mainGrid && this._mainGrid.__bIsUsed ) {
			for ( var sContainerId in this.mContainers) {
				if (this.mContainers[sContainerId][1]._sContainerResizeListener) {
					sap.ui.core.ResizeHandler.deregister(this.mContainers[sContainerId][1]._sContainerResizeListener);
					this.mContainers[sContainerId][1]._sContainerResizeListener = null;
				}
			}
		}

	};

	/*
	 * If onAfterRendering of a field is processed, the width must be set to 100% (if no other width set)
	 */
	ResponsiveGridLayout.prototype.contentOnAfterRendering = function(oFormElement, oControl){

		FormLayout.prototype.contentOnAfterRendering.apply(this, arguments);

		if (oControl.getWidth && ( !oControl.getWidth() || oControl.getWidth() == "auto" ) && oControl.getMetadata().getName() != "sap.ui.commons.Image") {
			oControl.$().css("width", "100%");
		}

	};

	ResponsiveGridLayout.prototype.toggleContainerExpanded = function(oContainer){

		//adapt the corresponding panel
		var sContainerId = oContainer.getId();
		if (this.mContainers[sContainerId] && this.mContainers[sContainerId][0]) {
			var oPanel = this.mContainers[sContainerId][0];
			oPanel.refreshExpanded();
		}

	};

	ResponsiveGridLayout.prototype.onLayoutDataChange = function(oEvent){

		var oSource = oEvent.srcControl;

		// if layoutData changed for a Container, Element, or Field call the
		// onLayoutDataChange function of the parent ResponsiveFlowLayout

		if (oSource instanceof sap.ui.layout.form.FormContainer) {
			if (this._mainGrid) {
				this._mainGrid.onLayoutDataChange(oEvent);
			}
		} else if (!(oSource instanceof sap.ui.layout.form.FormElement)) { // LayoutData on FormElement not supported in ResponsiveGridLayout
			var oParent = oSource.getParent();
			if (oParent instanceof sap.ui.layout.form.FormElement) {
				var oContainer = oParent.getParent();
				var sContainerId = oContainer.getId();
				if (this.mContainers[sContainerId] && this.mContainers[sContainerId][1]) {
					this.mContainers[sContainerId][1].onLayoutDataChange(oEvent);
				}
			}
		}

	};

	ResponsiveGridLayout.prototype.onsapup = function(oEvent){
		this.onsapleft(oEvent);
	};

	ResponsiveGridLayout.prototype.onsapdown = function(oEvent){
		this.onsapright(oEvent);
	};

	/**
	 * As Elements must not have a DOM reference it is not clear if one exists.
	 * If the <code>FormContainer</code> has a title or is expandable an internal panel is rendered.
	 * In this case, the panel's DOM reference is returned, otherwise the DOM reference
	 * of the <code>Grid</code> rendering the container's content.
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	ResponsiveGridLayout.prototype.getContainerRenderedDomRef = function(oContainer) {

		if (this.getDomRef()) {
			var sContainerId = oContainer.getId();
			if (this.mContainers[sContainerId]) {
				if (this.mContainers[sContainerId][0]) {
					var oPanel = this.mContainers[sContainerId][0];
					return oPanel.getDomRef();
				}else if (this.mContainers[sContainerId][1]){
					// no panel used -> return Grid
					var oGrid = this.mContainers[sContainerId][1];
					return oGrid.getDomRef();
				}
			}
		}

		return null;

	};

	/**
	 * As Elements must not have a DOM reference it is not clear if one exists.
	 * In this Layout a <code>FormElement</code> has no DOM representation,
	 * so null will always be returned
	 * @param {sap.ui.layout.form.FormElement} oElement <code>FormElement</code>
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	ResponsiveGridLayout.prototype.getElementRenderedDomRef = function(oElement) {

		return null;

	};

	function _createPanels( oLayout, oForm ) {

		var aContainers = oForm.getFormContainers();
		var iLength = aContainers.length;
		var iVisibleContainers = 0;
		var iVisibleContainer = 0;
		var aVisibleContainers = [];
		var oPanel;
		var oGrid;
		var oContainer;
		var sContainerId;
		var i = 0;
		for ( i = 0; i < iLength; i++) {
			oContainer = aContainers[i];
			oContainer._checkProperties();
			if (oContainer.getVisible()) {
				iVisibleContainers++;
				aVisibleContainers.push(oContainer);
			}
		}
		for ( i = 0; i < iVisibleContainers; i++) {
			oContainer = aVisibleContainers[i];
			if (oContainer.getVisible()) {
				iVisibleContainer++;
				sContainerId = oContainer.getId();
				oPanel = undefined;
				oGrid = undefined;
				var oContainerNext = aVisibleContainers[i + 1];
				if (oLayout.mContainers[sContainerId] && oLayout.mContainers[sContainerId][1]) {
					// Grid already created
					oGrid = oLayout.mContainers[sContainerId][1];
				} else {
					oGrid = _createGrid(oLayout, oContainer);
				}

				var oTitle = oContainer.getTitle();
				var oToolbar = oContainer.getToolbar();
				if (oToolbar || oTitle || oContainer.getExpandable()) {
					// only if container has a title a panel is used
					if (oLayout.mContainers[sContainerId] && oLayout.mContainers[sContainerId][0]) {
						// Panel already created
						oPanel = oLayout.mContainers[sContainerId][0];
					} else {
						oPanel = _createPanel(oLayout, oContainer, oGrid);
						_changeGetLayoutDataOfGrid(oGrid, true);
					}
					_setLayoutDataForLinebreak(oPanel, oContainer, iVisibleContainer, oContainerNext, iVisibleContainers);
				} else {
					if (oLayout.mContainers[sContainerId] && oLayout.mContainers[sContainerId][0]) {
						// panel not longer needed
						_deletePanel(oLayout.mContainers[sContainerId][0]);
					}
					_changeGetLayoutDataOfGrid(oGrid, false);
					_setLayoutDataForLinebreak(oGrid, oContainer, iVisibleContainer, oContainerNext, iVisibleContainers);
				}

				oLayout.mContainers[sContainerId] = [oPanel, oGrid];
			}
		}

		var iObjectLength = _objectLength(oLayout.mContainers);
		if (iVisibleContainers < iObjectLength) {
			// delete old containers panels
			for ( sContainerId in oLayout.mContainers) {
				var bFound = false;
				for ( i = 0; i < iLength; i++) {
					oContainer = aContainers[i];
					if (sContainerId == oContainer.getId() && oContainer.getVisible()) {
						bFound = true;
						break;
					}
				}
				if (!bFound) {
					_cleanContainer(oLayout, sContainerId);
				}
			}
		}

	}

	function _createPanel( oLayout, oContainer, oGrid ) {

		var sContainerId = oContainer.getId();
		var oPanel = new sap.ui.layout.form.ResponsiveGridLayoutPanel(sContainerId + "---Panel", {
			container: oContainer,
			layout   : oLayout,
			content : oGrid
		});

		return oPanel;

	}

	/*
	 * clear content before delete panel
	 */
	function _deletePanel( oPanel ) {

		oPanel.setContent("");
		oPanel.setLayout("");
		oPanel.setContainer("");
		oPanel.destroy();

	}

	function _createGrid( oLayout, oContainer ) {

		var sId = oContainer.getId() + "--Grid";

		var oGrid = new Grid(sId, {vSpacing: 0, hSpacing: 0, containerQuery: true});
		oGrid.__myParentLayout = oLayout;
		oGrid.__myParentContainerId = oContainer.getId();
		oGrid.addStyleClass("sapUiFormResGridCont");

		oGrid.getContent = function(){
			var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
			if (oContainer) {
				var aContent = [];
				var aElements = oContainer.getFormElements();
				var aFields;
				var oLabel;
				for ( var i = 0; i < aElements.length; i++) {
					var oElement = aElements[i];
					if (oElement.getVisible()) {
						oLabel = oElement.getLabelControl();
						if (oLabel) {
							aContent.push(oLabel);
						}
						aFields = oElement.getFields();
						for ( var j = 0; j < aFields.length; j++) {
							aContent.push(aFields[j]);
						}
					}
				}
				return aContent;
			} else {
				return false;
			}
		};

		oGrid._getLayoutDataForControl = function(oControl) {
			var oLayout = this.__myParentLayout;
			var oLD = oLayout.getLayoutDataForElement(oControl, "sap.ui.layout.GridData");

			var oElement = oControl.getParent();
			var oLabel = oElement.getLabelControl();
			if (oLD) {
				if (oLabel == oControl) {
					oLD._setStylesInternal("sapUiFormElementLbl");
				}
				return oLD;
			} else {
				// calculate Layout Data for control
				var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
				var oContainerLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.GridData");
				var oForm = oContainer.getParent();
				// for overall grid, label has default Span of 2, but in L 2 Containers are in one line, so 2 Grids are in one line
				var iLabelLSpan = oLayout.getLabelSpanL();
				var iLabelMSpan = oLayout.getLabelSpanM();
				var iLabelSSpan = oLayout.getLabelSpanS();

				if (oLayout.getAdjustLabelSpan()) {
					if (oForm.getFormContainers().length >= 1 && oLayout.getColumnsM() > 1) {
						// More than one Container in line
						iLabelMSpan = oLayout.getLabelSpanL();
					}
					if (oContainerLD) {
						if (oContainerLD._getEffectiveSpanLarge() == 12) {
							// If Container has the Full width in large Screen, use 2 as Label Span to be in line
							iLabelLSpan = oLayout.getLabelSpanM();
							iLabelMSpan = oLayout.getLabelSpanM();
						}
					}
					if (oForm.getFormContainers().length == 1 || oLayout.getColumnsL() == 1) {
						// only one container -> it's full size
						iLabelLSpan = oLayout.getLabelSpanM();
						iLabelMSpan = oLayout.getLabelSpanM();
					}
				}

				// If no explicit value of Label span for XL is set then the value of the Label span for L is used (from the backwardcompatibility reasons).
				var iLabelXLSpan = oLayout.getLabelSpanXL();
				if (iLabelXLSpan < 0) {
					iLabelXLSpan = iLabelLSpan;
				}

				if (oLabel == oControl) {
					oLayout.oDummyLayoutData.setSpan("XL" + iLabelXLSpan + " L" + iLabelLSpan + " M" + iLabelMSpan + " S" + iLabelSSpan);
					oLayout.oDummyLayoutData.setLinebreak(true);
					oLayout.oDummyLayoutData._setStylesInternal("sapUiFormElementLbl");
					return oLayout.oDummyLayoutData;
				} else {
					var iLSpan = 12 - oLayout.getEmptySpanL();
					var iMSpan = 12 - oLayout.getEmptySpanM();
					var iSSpan = 12 - oLayout.getEmptySpanS();

					// If no explicit value for XL empty span is set then the value of the L empty span is used (from the backwardcompatibility reasons).
					var iXLSpan = iLSpan;
					var iEmptyXLSpan = oLayout.getEmptySpanXL();
					if (iEmptyXLSpan > -1) {
						iXLSpan = 12 - iEmptyXLSpan;
					}

					var iEffectiveSpan;
					if (oLabel) {
						var oLabelLD = oLayout.getLayoutDataForElement(oLabel, "sap.ui.layout.GridData");
						if (oLabelLD) {
							iEffectiveSpan = oLabelLD._getEffectiveSpanLarge();
							if (iEffectiveSpan) {
								iLabelLSpan = iEffectiveSpan;
							}

							iEffectiveSpan = oLabelLD._getEffectiveSpanXLarge();
							if (iEffectiveSpan) {
								iLabelXLSpan = iEffectiveSpan;
							}
							if (iLabelXLSpan < 0) {
								iLabelXLSpan = iLabelLSpan;
							}

							iEffectiveSpan = oLabelLD._getEffectiveSpanMedium();
							if (iEffectiveSpan) {
								iLabelMSpan = iEffectiveSpan;
							}
							iEffectiveSpan = oLabelLD._getEffectiveSpanSmall();
							if (iEffectiveSpan) {
								iLabelSSpan = iEffectiveSpan;
							}
						}

						if (iLabelXLSpan < 12) {
							iXLSpan = iXLSpan - iLabelXLSpan;
						}
						if (iLabelLSpan < 12) {
							iLSpan = iLSpan - iLabelLSpan;
						}
						if (iLabelMSpan < 12) {
							iMSpan = iMSpan - iLabelMSpan;
						}
						if (iLabelSSpan < 12) {
							iSSpan = iSSpan - iLabelSSpan;
						}
					}

					var aFields = oElement.getFields();
					var iLength = aFields.length;
					var iDefaultFields = 1; // because current field has no LayoutData
					var bFirstField = false;
					for ( var i = 0; i < iLength; i++) {
						var oField = aFields[i];
						if (oField != oControl) {
							// check if other fields have layoutData
							var oFieldLD = oLayout.getLayoutDataForElement(oField, "sap.ui.layout.GridData");
							// is Spans are too large - ignore in calculation....
							if (oFieldLD) {
								iEffectiveSpan = oFieldLD._getEffectiveSpanLarge();
								if (iEffectiveSpan && iEffectiveSpan < iLSpan) {
									iLSpan = iLSpan - iEffectiveSpan;
								}

								var iEffectiveSpanXL = oFieldLD._getEffectiveSpanXLarge();
								if (iEffectiveSpanXL) {
									if (iEffectiveSpanXL < iXLSpan) {
										iXLSpan = iXLSpan - iEffectiveSpanXL;
									}
								} else {
									if (iEffectiveSpan && iEffectiveSpan < iXLSpan) {
										iXLSpan = iXLSpan - iEffectiveSpan;
									}
								}

								iEffectiveSpan = oFieldLD._getEffectiveSpanMedium();
								if (iEffectiveSpan && iEffectiveSpan < iMSpan) {
									iMSpan = iMSpan - iEffectiveSpan;
								}
								iEffectiveSpan = oFieldLD._getEffectiveSpanSmall();
								if (iEffectiveSpan && iEffectiveSpan < iSSpan) {
									iSSpan = iSSpan - iEffectiveSpan;
								}
							} else {
								iDefaultFields++;
							}
						} else {
							if (iDefaultFields == 1) {
								bFirstField = true;
							}
						}
					}
					var iMyXLSpan, iMyLSpan, iMyMSpan, iMySSpan = 12;
					if (bFirstField) {
						var iRest = iXLSpan - Math.floor(iXLSpan / iDefaultFields) * iDefaultFields;
						iMyXLSpan = Math.floor(iXLSpan / iDefaultFields) + iRest;
						iRest = iLSpan - Math.floor(iLSpan / iDefaultFields) * iDefaultFields;
						iMyLSpan = Math.floor(iLSpan / iDefaultFields) + iRest;
						iRest = iMSpan - Math.floor(iMSpan / iDefaultFields) * iDefaultFields;
						iMyMSpan = Math.floor(iMSpan / iDefaultFields) + iRest;
						if (iLabelSSpan < 12) {
							// label is defined to not be full size -> make fields left of it
							iRest = iSSpan - Math.floor(iSSpan / iDefaultFields) * iDefaultFields;
							iMySSpan = Math.floor(iSSpan / iDefaultFields) + iRest;
						}
					} else {
						iMyXLSpan = Math.floor(iXLSpan / iDefaultFields);
						iMyLSpan = Math.floor(iLSpan / iDefaultFields);
						iMyMSpan = Math.floor(iMSpan / iDefaultFields);
						if (iLabelSSpan < 12) {
							// label is defined to not be full size -> make fields left of it
							iMySSpan = Math.floor(iSSpan / iDefaultFields);
						}
					}

					oLayout.oDummyLayoutData.setSpan("XL" + iMyXLSpan + " L" + iMyLSpan + " M" + iMyMSpan + " S" + iMySSpan);
					oLayout.oDummyLayoutData.setLinebreak(bFirstField && !oLabel);
					oLayout.oDummyLayoutData._setStylesInternal(undefined);
					return oLayout.oDummyLayoutData;
				}

				return oLD;
			}
		};

		// change resize handler so that the container Grids always get the same Media size like the main grid
		oGrid._onParentResizeOrig = oGrid._onParentResize;
		oGrid._onParentResize = function() {

			// Prove if Dom reference exist, and if not - clean up the references.
			if (!this.getDomRef()) {
				this._cleanup();
				return;
			}

			if (!jQuery(this.getDomRef()).is(":visible")) {
				return;
			}

			var oLayout = this.__myParentLayout;
			if (!oLayout._mainGrid || !oLayout._mainGrid.__bIsUsed ) {
				// no main grid used -> only 1 container
				var aContainers = oLayout.getParent().getFormContainers();
				var oFirstContainer;
				for (var i = 0; i < aContainers.length; i++) {
					if (aContainers[i].getVisible()) {
						oFirstContainer = aContainers[i];
						break;
					}
				}
				if (!oFirstContainer || !oLayout.mContainers[oFirstContainer.getId()] || oFirstContainer.getId() != this.__myParentContainerId) {
					// Form seems to be invalidated (container changed) but rerendering still not done
					// -> ignore resize, it will be rerendered soon
					return;
				}
				if (oLayout.mContainers[this.__myParentContainerId][0]) {
					// panel used -> get size from panel
					var oDomRef = oLayout.mContainers[this.__myParentContainerId][0].getDomRef();

					var iCntWidth = oDomRef.clientWidth;
					if (iCntWidth <= oLayout.getBreakpointM()) {
						this._toggleClass("Phone");
					} else if ((iCntWidth > oLayout.getBreakpointM()) && (iCntWidth <= oLayout.getBreakpointL())) {
						this._toggleClass("Tablet");
					} else if ((iCntWidth > oLayout.getBreakpointL()) && (iCntWidth <= oLayout.getBreakpointXL())) {
						this._toggleClass("Desktop");
					} else {
						this._toggleClass("LargeDesktop");
					}
				} else {
					this._setBreakPointTablet(oLayout.getBreakpointM());
					this._setBreakPointDesktop(oLayout.getBreakpointL());
					this._setBreakPointLargeDesktop(oLayout.getBreakpointXL());
					this._onParentResizeOrig();
				}
			} else {
				var $DomRefMain = oLayout._mainGrid.$();

				if ($DomRefMain.hasClass("sapUiRespGridMedia-Std-Phone")) {
					this._toggleClass("Phone");
				} else if ($DomRefMain.hasClass("sapUiRespGridMedia-Std-Tablet")) {
					this._toggleClass("Tablet");
				} else if ($DomRefMain.hasClass("sapUiRespGridMedia-Std-Desktop")) {
					this._toggleClass("Desktop");
				} else {
					this._toggleClass("LargeDesktop");
				}
			}
		};

		oGrid._getAccessibleRole = function() {

			var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
			var oLayout = this.__myParentLayout;
			if (oLayout._mainGrid && oLayout._mainGrid.__bIsUsed && !oContainer.getToolbar() && !oContainer.getTitle() && !oContainer.getExpandable()) {
				return "form";
			}

		};

		return oGrid;

	}

	/*
	 * clear internal variables before delete grid
	 */
	function _deleteGrid( oGrid ) {

		if (oGrid.__myParentContainerId) {
			oGrid.__myParentContainerId = undefined;
		}
		oGrid.__myParentLayout = undefined;

		oGrid.destroy();

	}

	function _changeGetLayoutDataOfGrid( oGrid, bOriginal ) {
		// only GridData are from interest

		if (bOriginal) {
			if (oGrid.__originalGetLayoutData) {
				oGrid.getLayoutData = oGrid.__originalGetLayoutData;
				delete oGrid.__originalGetLayoutData;
			}
		} else if (!oGrid.__originalGetLayoutData) {
			oGrid.__originalGetLayoutData = oGrid.getLayoutData;
			oGrid.getLayoutData = function(){
				var oLayout = this.__myParentLayout;
				var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);

				var oLD;
				if (oContainer) {
					oLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.GridData");
				}

				if (oLD) {
					return oLD;
				} else {
					return this.getAggregation("layoutData");
				}
			};
		}

	}

	// every second container gets a Linebreak for large screens
	// oControl could be a Panel or a Grid( if no panel used)
	function _setLayoutDataForLinebreak( oControl, oContainer, iVisibleContainer, oContainerNext, iVisibleContainers ) {

		var oLayout;
		if (oControl instanceof sap.ui.layout.form.ResponsiveGridLayoutPanel) {
			oLayout = sap.ui.getCore().byId(oControl.getLayout());
		} else {
			oLayout = oControl.__myParentLayout;
		}

		var oLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.GridData");
		if (!oLD) {
			// only needed if container has no own LayoutData
			var iColumnsM = oLayout.getColumnsM();
			var iColumnsL = oLayout.getColumnsL();
			// If the columsnXL is not set the value of columnsL is used
			var iColumnsXL = oLayout.getColumnsXL();

			var bLinebreakL = (iVisibleContainer % iColumnsL) == 1;
			var bLastL = (iVisibleContainer % iColumnsL) == 0;
			var bLastRowL = iVisibleContainer > (iVisibleContainers - iColumnsL + (iVisibleContainers % iColumnsL));
			var bFirstRowL = iVisibleContainer <= iColumnsL;
			var bLinebreakM = (iVisibleContainer % iColumnsM) == 1;
			var bLastM = (iVisibleContainer % iColumnsM) == 0;
			var bLastRowM = iVisibleContainer > (iVisibleContainers - iColumnsM + (iVisibleContainers % iColumnsM));
			var bFirstRowM = iVisibleContainer <= iColumnsM;

			var bLinebreakXL = false;
			var bLastXL = bLastL;
			var bLastRowXL = bLastRowL;
			var bFirstRowXL = bFirstRowL;
			if (iColumnsXL > 0) {
				bLinebreakXL = (iVisibleContainer % iColumnsXL) == 1;
				bLastXL = (iVisibleContainer % iColumnsXL) == 0;
				bLastRowXL = iVisibleContainer > (iVisibleContainers - iColumnsXL + (iVisibleContainers % iColumnsXL));
				bFirstRowXL = iVisibleContainer <= iColumnsXL;
			}

			if (oContainerNext) {
				var oLDNext = oLayout.getLayoutDataForElement(oContainerNext, "sap.ui.layout.GridData");
				if (oLDNext && ( oLDNext.getLinebreak() || oLDNext.getLinebreakXL() )) {
					bLastXL = true;
					bLastRowXL = false;
				}
				if (oLDNext && ( oLDNext.getLinebreak() || oLDNext.getLinebreakL() )) {
					bLastL = true;
					bLastRowL = false;
				}
				if (oLDNext && ( oLDNext.getLinebreak() || oLDNext.getLinebreakM() )) {
					bLastM = true;
					bLastRowM = false;
				}
			}

			var sStyle = "";

			if (bLastXL) {
				sStyle = "sapUiFormResGridLastContXL";
			}
			if (bLastL) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridLastContL";
			}
			if (bLastM) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridLastContM";
			}

			if (bLastRowXL) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridLastRowXL";
			}
			if (bLastRowL) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridLastRowL";
			}
			if (bLastRowM) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridLastRowM";
			}

			if (bFirstRowXL) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridFirstRowXL";
			}
			if (bFirstRowL) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridFirstRowL";
			}
			if (bFirstRowM) {
				if (sStyle) {
					sStyle = sStyle + " ";
				}
				sStyle = sStyle + "sapUiFormResGridFirstRowM";
			}

			oLD = oControl.getLayoutData();
			if (!oLD) {
				oLD = new GridData(oControl.getId() + "--LD", { linebreakL: bLinebreakL, linebreakM: bLinebreakM });
				oControl.setLayoutData( oLD );
			} else {
				oLD.setLinebreakL(bLinebreakL);
				oLD.setLinebreakM(bLinebreakM);
			}
			if (iColumnsXL > 0) {
				oLD.setLinebreakXL(bLinebreakXL);
			}
			oLD._setStylesInternal(sStyle);
		}

	}

	function _cleanContainer( oLayout, sContainerId ) {

		var aContainerContent = oLayout.mContainers[sContainerId];

		//delete Grid
		var oGrid = aContainerContent[1];
		if (oGrid) {
			_deleteGrid(oGrid);
		}

		//delete panel
		var oPanel = aContainerContent[0];
		if (oPanel) {
			_deletePanel(oPanel);
		}

		delete oLayout.mContainers[sContainerId];

	}

	function _createMainGrid( oLayout, oForm ) {

		var aContainers = oForm.getFormContainers();
		var aVisibleContainers = [];
		var oContainer;
		var iLength = 0;
		var iContentLenght = 0;
		var i = 0;
		var j = 0;

		// count only visible containers
		for ( i = 0; i < aContainers.length; i++) {
			oContainer = aContainers[i];
			if (oContainer.getVisible()) {
				iLength++;
				aVisibleContainers.push(oContainer);
			}
		}

		// special case: only one container -> do not render an outer ResponsiveFlowLayout
		if (iLength > 1 || !oLayout.getSingleContainerFullSize()) {
			var iSpanM = Math.floor(12 / oLayout.getColumnsM());
			var iSpanL = Math.floor(12 / oLayout.getColumnsL());
			var iSpanXL;
			var sDefaultSpan = "";

			// If the columsnXL is not set the value of columnsL is used
			var iColumnsXL = oLayout.getColumnsXL();
			if (iColumnsXL >= 0) {
				// if no columns for XL are defined ude no default span for XL. The grid then uses automatically the L one.
				iSpanXL = Math.floor(12 / iColumnsXL);
				sDefaultSpan = sDefaultSpan + "XL" + iSpanXL + " ";
			}
			sDefaultSpan = sDefaultSpan + "L" + iSpanL + " M" + iSpanM + " S12";

			if (!oLayout._mainGrid) {
				oLayout._mainGrid = new Grid(oForm.getId() + "--Grid",{
					defaultSpan: sDefaultSpan,
					hSpacing: 0,
					vSpacing: 0,
					containerQuery: true
					}).setParent(oLayout);
				oLayout._mainGrid.addStyleClass("sapUiFormResGridMain");
				// change resize handler so that the main grid triggers the resize of it's children
				oLayout._mainGrid._onParentResizeOrig = oLayout._mainGrid._onParentResize;
				oLayout._mainGrid._onParentResize = function() {
					this._onParentResizeOrig();

					for ( var sContainerId in oLayout.mContainers) {
						oLayout.mContainers[sContainerId][1]._onParentResize();
					}

				};
			} else {
				oLayout._mainGrid.setDefaultSpan(sDefaultSpan);
				// update containers
				var aLayoutContent = oLayout._mainGrid.getContent();
				iContentLenght = aLayoutContent.length;
				var bExchangeContent = false;
				// check if content has changed
				for ( i = 0; i < iContentLenght; i++) {
					var oContentElement = aLayoutContent[i];
					oContainer = undefined;
					if (oContentElement.getContainer) {
						// it's a panel
						oContainer = sap.ui.getCore().byId(oContentElement.getContainer());
					} else {
						// it's a Grid
						oContainer = sap.ui.getCore().byId(oContentElement.__myParentContainerId);
					}
					if (oContainer && oContainer.getVisible()) {
						var oVisibleContainer = aVisibleContainers[j];
						if (oContainer != oVisibleContainer) {
							// order of containers has changed
							bExchangeContent = true;
							break;
						}

						var aContainerContent = oLayout.mContainers[oContainer.getId()];
						if (aContainerContent[0] && aContainerContent[0] != oContentElement) {
							// container uses panel but panel not the same element in content
							bExchangeContent = true;
							break;
						}
						if (!aContainerContent[0] && aContainerContent[1] && aContainerContent[1] != oContentElement) {
							// container uses no panel but Grid not the same element in content
							bExchangeContent = true;
							break;
						}
						j++;
					} else {
						// no container exits for content -> just remove this content
						oLayout._mainGrid.removeContent(oContentElement);
					}
				}
				if (bExchangeContent) {
					// remove all content and add it new.
					oLayout._mainGrid.removeAllContent();
					iContentLenght = 0;
				}
			}
			oLayout._mainGrid._setBreakPointTablet(oLayout.getBreakpointM());
			oLayout._mainGrid._setBreakPointDesktop(oLayout.getBreakpointL());
			oLayout._mainGrid._setBreakPointLargeDesktop(oLayout.getBreakpointXL());
			oLayout._mainGrid.__bIsUsed = true;

			if (iContentLenght < iLength) {
				// new containers added
				var iStartIndex = 0;
				if (iContentLenght > 0) {
					iStartIndex = iContentLenght--;
				}
				for ( i = iStartIndex; i < aContainers.length; i++) {
					oContainer = aContainers[i];
					if (oContainer.getVisible()) {
						var sContainerId = oContainer.getId();
						if (oLayout.mContainers[sContainerId]) {
							if (oLayout.mContainers[sContainerId][0]) {
								// panel used
								oLayout._mainGrid.addContent(oLayout.mContainers[sContainerId][0]);
							} else if (oLayout.mContainers[sContainerId][1]) {
								// no panel - used Grid directly
								oLayout._mainGrid.addContent(oLayout.mContainers[sContainerId][1]);
							}
						}
					}
				}
			}
		} else if ( oLayout._mainGrid ) {
			oLayout._mainGrid.__bIsUsed = false;
		}

	}

	function _objectLength(oObject){

		var iLength = 0;

		if (!Object.keys) {
			jQuery.each(oObject, function(){
				iLength++;
			});
		} else {
			iLength = Object.keys(oObject).length;
		}

		return iLength;

	}

	return ResponsiveGridLayout;

}, /* bExport= */ true);
