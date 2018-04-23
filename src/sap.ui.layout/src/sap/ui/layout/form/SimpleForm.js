/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.SimpleForm.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control',
               './Form', './FormContainer', './FormElement', './FormLayout',
               'sap/ui/base/ManagedObjectObserver', 'sap/ui/layout/library', 'sap/ui/core/ResizeHandler'],
	function(jQuery, Control, Form, FormContainer, FormElement, FormLayout,
             ManagedObjectObserver, library, ResizeHandler) {
	"use strict";

	// shortcut for sap.ui.layout.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = library.form.SimpleFormLayout;

	var ResponsiveLayout;
	var ResponsiveFlowLayoutData;
	var ResponsiveGridLayout;
	var GridLayout;
	var GridContainerData;
	var GridElementData;

	/**
	 * Constructor for a new sap.ui.layout.form.SimpleForm.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>SimpleForm</code> provides an easy-to-use API to create simple forms.
	 * Inside a <code>SimpleForm</code>, a <code>Form</code> control is created along with its
	 * <code>FormContainers</code> and <code>FormElements</code>, but the complexity in the API is removed.
	 * <ul>
	 * <li>A new <code>Title</code> or <code>Toolbar</code> starts a new group (<code>FormContainer</code>) in the form.</li>
	 * <li>A new <code>Label</code> starts a new row (<code>FormElement</code>) in the form.</li>
	 * <li>All other controls will be assigned to the row (<code>FormElement</code>) that started with the last label.</li>
	 * </ul>
	 * Use <code>LayoutData</code> to influence the layout for special cases in the Input/Display controls.
	 *
	 * <b>Note:</b> If a more complex form is needed, use <code>Form</code> instead.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.SimpleForm
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SimpleForm = Control.extend("sap.ui.layout.form.SimpleForm", /** @lends sap.ui.layout.form.SimpleForm.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * The maximum amount of groups (<code>FormContainers</code>) per row that is used before a new row is started.
			 *
			 * <b>Note:</b> If a <code>ResponsiveGridLayout</code> is used as a <code>layout</code>, this property is not used.
			 * Please use the properties <code>ColumnsL</code> and <code>ColumnsM</code> in this case.
			 */
			maxContainerCols : {type : "int", group : "Appearance", defaultValue : 2},

			/**
			 * The overall minimum width in pixels that is used for the <code>SimpleForm</code>.
			 *
			 * If the available width is below the given <code>minWidth</code> the <code>SimpleForm</code> will create a new row for the next group (<code>FormContainer</code>).
			 * The default value is -1, meaning that inner groups (<code>FormContainers</code>) will be stacked until <code>maxContainerCols</code> is reached,
			 * irrespective of whether a <code>width</code> is reached or the available parents width is reached.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveLayout</code> is used as a layout.
			 */
			minWidth : {type : "int", group : "Appearance", defaultValue : -1},

			/**
			 * Width of the form.
			 * @since 1.28.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Applies a device-specific and theme-specific line height and label alignment to the form rows if the form has editable content.
			 * If set, all (not only the editable) rows of the form will get the line height of editable fields.
			 *
			 * The accessibility <code>aria-readonly</code> attribute is set according to this property.
			 *
			 * <b>Note:</b> The setting of the property has no influence on the editable functionality of the form's content.
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Specifies the min-width in pixels of the label in all form rows.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveLayout</code> is used as a layout.
			 */
			labelMinWidth : {type : "int", group : "Misc", defaultValue : 192},

			/**
			 * The <code>FormLayout</code> that is used to render the <code>SimpleForm</code>.
			 *
			 * We recommend using the <code>ResponsiveGridLayout</code> for rendering a <code>SimpleForm</code>,
			 * as its responsiveness uses the space available in the best way possible.
			 *
			 * <b>Note</b> If possible, set the <code>layout</code> before adding content to prevent calculations for the default layout.
			 */
			layout : {type : "sap.ui.layout.form.SimpleFormLayout", group : "Misc", defaultValue : SimpleFormLayout.ResponsiveLayout},

			/**
			 * Default span for labels in extra large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * If the default value -1 is not overwritten with the meaningful one then the <code>labelSpanL</code> value is used (from the backward compatibility reasons).
			 * @since 1.34.0
			 */
			labelSpanXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Default span for labels in large size.
			 *
			 * <b>Note:</b> If <code>adjustLabelSpanThis</code> is set, this property is only used if more than 1 <code>FormContainer</code> is in one line.
			 * If only 1 <code>FormContainer</code> is in the line, then the <code>labelSpanM</code> value is used.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			labelSpanL : {type : "int", group : "Misc", defaultValue : 4},

			/**
			 * Default span for labels in medium size.
			 *
			 * <b>Note:</b> If <code>adjustLabelSpanThis</code> is set, this property is used for full-size <code>FormContainers</code>.
			 * If more than one <code>FormContainer</code> is in one line, <code>labelSpanL</code> is used.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			labelSpanM : {type : "int", group : "Misc", defaultValue : 2},

			/**
			 * Default span for labels in small size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
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
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.34.0
			 */
			adjustLabelSpan : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Number of grid cells that are empty at the end of each line on extra large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * If the default value -1 is not overwritten with the meaningful one then the <code>emptySpanL</code> value is used (from the backward compatibility reasons).
			 * @since 1.34.0
			 */
			emptySpanXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Number of grid cells that are empty at the end of each line on large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			emptySpanL : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Number of grid cells that are empty at the end of each line on medium size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			emptySpanM : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Number of grid cells that are empty at the end of each line on small size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			emptySpanS : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Form columns for extra large size.
			 * The number of columns for extra large size must not be smaller than the number of columns for large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * If the default value -1 is not overwritten with the meaningful one then the <code>columnsL</code> value is used (from the backward compatibility reasons).
			 * @since 1.34.0
			 */
			columnsXL : {type : "int", group : "Misc", defaultValue : -1},

			/**
			 * Form columns for large size.
			 * The number of columns for large size must not be smaller than the number of columns for medium size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			columnsL : {type : "int", group : "Misc", defaultValue : 2},

			/**
			 * Form columns for medium size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			columnsM : {type : "int", group : "Misc", defaultValue : 1},

			/**
			 * If the <code>Form</code> contains only one single <code>FormContainer</code> and this property is set,
			 * the <code>FormContainer</code> is displayed using the full size of the <code>Form</code>.
			 * In this case the properties <code>columnsL</code> and <code>columnsM</code> are ignored.
			 *
			 * In all other cases the <code>FormContainer</code> is displayed in the size of one column.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.34.0
			 */
			singleContainerFullSize : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Breakpoint between Medium size and Large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.34.0
			 */
			breakpointXL : {type : "int", group : "Misc", defaultValue : 1440},

			/**
			 * Breakpoint between Medium size and Large size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			breakpointL : {type : "int", group : "Misc", defaultValue : 1024},

			/**
			 * Breakpoint between Small size and Medium size.
			 *
			 * <b>Note:</b> This property is only used if a <code>ResponsiveGridLayout</code> is used as a layout.
			 * @since 1.16.3
			 */
			breakpointM : {type : "int", group : "Misc", defaultValue : 600},

			/**
			 * Specifies the background color of the <code>SimpleForm</code> content.
			 *
			 * The visualization of the different options depends on the used theme.
			 *
			 * @since 1.36.0
			 */
			backgroundDesign : {type : "sap.ui.layout.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Translucent}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content of the form is structured in the following way:
			 * <ul>
			 * <li>Add a <code>Title</code> or <code>Toolbar</code> control to start a new group (<code>FormContainer</code>).</li>
			 * <li>Add a <code>Label</code> control to start a new row (<code>FormElement</code>).</li>
			 * <li>Add controls as input fields, text fields or other as needed.</li>
			 * <li>Use <code>LayoutData</code> to influence the layout for special cases in the single controls.
			 * For example, if a <code>ResponsiveLayout</code> is used as a layout,
			 * the form content is weighted using weight 3 for the labels and weight 5 for the fields part.
			 * By default the label column is 192 pixels wide.
			 * If your input controls should influence their width, you can add <code>sap.ui.layout.ResponsiveFlowLayoutData</code>
			 * to them via <code>setLayoutData</code> method.
			 * Ensure that the sum of the weights in the <code>ResponsiveFlowLayoutData</code> is not more than 5,
			 * as this is the total width of the input control part of each form row.</li>
			 * </ul>
			 * Example for a row where the <code>Input</code> weight 4 and the second <code>Input</code> weight 1 (using <code>ResponsiveLayout</code>):
			 * <pre>
			 * new sap.m.Label({text:"Label"});
			 * new sap.m.Input({value:"Weight 4", layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({weight:4})}),
			 * new sap.m.Input({value:"Weight 1", layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({weight:1})}),
			 * </pre>
			 *
			 * For example, if a <code>ResponsiveGridLayout</code> is used as a layout, there are 12 cells in one row.
			 * Depending on the screen size the labels use the defined <code>labelSpan</code>.
			 * The remaining cells are used for the fields (and <code>emptySpan</code> if defined).
			 * The available cells are distributed to all fields in the row. If one field should use a fixed number of cells
			 * you can add <code>sap.ui.layout.GridData</code> to them via <code>setLayoutData</code> method.
			 * If there are additional fields in the row they will get the remaining cells.
			 * </ul>
			 * Example for a row with two <code>Input</code> controls where one uses four cells on small screens,
			 * one cell on medium screens and 2 cells on larger screens (using <code>ResponsiveGridLayout</code>):
			 * <pre>
			 * new sap.m.Label({text:"Label"});
			 * new sap.m.Input({value:"auto size"}),
			 * new sap.m.Input({value:"fix size", layoutData: new sap.ui.layout.GridData({span: "XL1 L1 M2 S4"})}),
			 * </pre>
			 *
			 * <b>Warning:</b> Do not put any layout or other container controls in here. This could damage the visual layout,
			 * keyboard support and screen-reader support. Only labels, titles, toolbars and form controls are allowed.
			 * Views are also not supported. Allowed form controls implement the interface <code>sap.ui.core.IFormContent</code>.
			 *
			 * If editable controls are used as content, the <code>editable</code> property must be set to <code>true</code>,
			 * otherwise to <code>false</code>. If the <code>editable</code> property is set incorrectly, there will be visual issues
			 * like wrong label alignment or wrong spacing between the controls.
			 */
			content : {type : "sap.ui.core.Element", multiple : true, singularName : "content"},

			/**
			 * Hidden, for internal use only.
			 */
			form : {type : "sap.ui.layout.form.Form", multiple : false, visibility : "hidden"},

			/**
			 * Title element of the <code>SimpleForm</code>. Can either be a <code>Title</code> element, or a string.
			 * @since 1.16.3
			 */
			title : {type : "sap.ui.core.Title", altTypes : ["string"], multiple : false},

			/**
			 * Toolbar of the <code>SimpleForm</code>.
			 *
			 * <b>Note:</b> If a <code>Toolbar</code> is used, the <code>Title</code> is ignored.
			 * If a title is needed inside the <code>Toolbar</code> it must be added at content to the <code>Toolbar</code>.
			 * In this case add the <code>Title</code> to the <code>ariaLabelledBy</code> association.
			 * @since 1.36.0
			 */
			toolbar : {type : "sap.ui.core.Toolbar", multiple : false}
		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
			 * @since 1.32.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		designTime: true
	}});

	SimpleForm.prototype.init = function() {

		this._iMaxWeight = 8;
		this._iLabelWeight = 3;
		this._iCurrentWidth = 0;
		var oForm = new Form(this.getId() + "--Form");
		// use title of SimpleForm in Form
		oForm.getTitle = function(){
			return this.getParent().getTitle();
		};
		oForm._origInvalidate = oForm.invalidate;
		oForm.invalidate = function(oOrigin) {
			if (this.bOutput) {
				// if Form is not rendered don't invalidate SimpleForm and parents
				this._origInvalidate(oOrigin);
			}
			if (this._bIsBeingDestroyed) {
				return;
			}
			var oSimpleForm = this.getParent();
			if (oSimpleForm) {
				oSimpleForm._formInvalidated(oOrigin);
			}
		};

		oForm.getAriaLabelledBy = function(){
			var oSimpleForm = this.getParent();
			if (oSimpleForm) {
				return oSimpleForm.getAriaLabelledBy();
			}else {
				return null;
			}
		};

		oForm._origOnLayoutDataChange = oForm.onLayoutDataChange;
		oForm.onLayoutDataChange = function(oEvent) {
			this._origOnLayoutDataChange(oEvent);

			var oSimpleForm = this.getParent();
			if (oSimpleForm) {
				oSimpleForm._onLayoutDataChange(oEvent);
			}
		};

		this.setAggregation("form",oForm);
		this._aElements = null;
		this._aLayouts = [];
		this._changedFormContainers = [];
		this._changedFormElements = [];

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

	};

	SimpleForm.prototype.exit = function() {

		var oForm = this.getAggregation("form");
		oForm.invalidate = oForm._origInvalidate;

		_removeResize.call(this);

		for (var i = 0; i < this._aLayouts.length; i++) {
			var oLayout = sap.ui.getCore().byId(this._aLayouts[i]);
			if (oLayout && oLayout.destroy) {
				oLayout.destroy();
			}
		}
		this._aLayouts = [];
		this._aElements = null;
		this._changedFormContainers = [];
		this._changedFormElements = [];

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	/*
	 * Update FormContainers, FormElements and LayoutData before controls are rendered
	 */
	SimpleForm.prototype.onBeforeRendering = function() {

		_removeResize.call(this);

		var oForm = this.getAggregation("form");
		if (!this._bResponsiveLayoutRequested && !this._bGridLayoutRequested && !this._bResponsiveGridLayoutRequested) {
			// if Layout is still loaded do it after it is loaded
			var bLayout = true;
			if (!oForm.getLayout()) {
				bLayout = _setFormLayout.call(this);
			}

			if (bLayout) {
				_updateLayout.call(this);
			}
		}

	};

	SimpleForm.prototype.onAfterRendering = function() {

		if (this.getLayout() == SimpleFormLayout.ResponsiveLayout) {
			this._bChangedByMe = true;
			this.$().css("visibility", "hidden"); //avoid that a wrong layouting is visible
			this._applyLinebreaks();

			//attach the resize handler
			this._sResizeListenerId = ResizeHandler.register(this.getDomRef(),  jQuery.proxy(this._resize, this));
			this._bChangedByMe = false;
		}

	};

	SimpleForm.prototype.setEditable = function(bEditable) {

		this._bChangedByMe = true;
		this.setProperty("editable", bEditable, true);

		var oForm = this.getAggregation("form");
		oForm.setEditable(bEditable);

		this._bChangedByMe = false;
		return this;

	};

	SimpleForm.prototype.setToolbar = function(oToolbar) {

		this._bChangedByMe = true;
		var oForm = this.getAggregation("form");
		oForm.setToolbar(oToolbar);

		this._bChangedByMe = false;
		return this;

	};

	SimpleForm.prototype.getToolbar = function() {

		var oForm = this.getAggregation("form");
		return oForm.getToolbar();

	};

	SimpleForm.prototype.destroyToolbar = function() {

		this._bChangedByMe = true;
		var oForm = this.getAggregation("form");
		oForm.destroyToolbar();

		this._bChangedByMe = false;
		return this;

	};

	SimpleForm.prototype.setLabelMinWidth = function(iLabelMinWidth) {

		this.setProperty("labelMinWidth", iLabelMinWidth, true);

		if (this.getLayout() == SimpleFormLayout.ResponsiveLayout) {
			this._bLayoutDataChangedByMe = true;
			var aContent = this.getContent();
			for (var i = 0; i < aContent.length; i++) {
				var oElement = aContent[i];
				if (oElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
					var oLayoutData = _getFieldLayoutData.call(this, oElement);
					if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") && _isMyLayoutData.call(this, oLayoutData)) {
						oLayoutData.setMinWidth(iLabelMinWidth);
					}
				}
			}
			this._bLayoutDataChangedByMe = false;
		}

		return this;

	};

	/*
	 * Overwrite generated functions to use internal array to look for aggregation
	 */
	SimpleForm.prototype.indexOfContent = function(oObject) {

		var aChildren = this._aElements;
		if (aChildren) {
			for (var i = 0; i < aChildren.length; i++) {
				if (aChildren[i] == oObject) {
					return i;
				}
			}
		}
		return -1;

	};

	SimpleForm.prototype.addContent = function(oElement) {

		oElement = this.validateAggregation("content", oElement, /* multiple */ true);

		if (this.indexOfContent(oElement) >= 0) {
			// element is already there, remove before adding it
			jQuery.sap.log.warning("SimpleForm.addContent: Content element '" + oElement + "' already assigned. Please remove before adding!", this);
			this.removeContent(oElement);
		}

		if (!this._aElements) {
			this._aElements = [];
		}

		// try to find corresponding FormElement and FormContainer to update them
		this._bChangedByMe = true;
		var iLength = this._aElements.length;
		var oLastElement;
		var oForm = this.getAggregation("form");
		var oFormContainer;
		var oFormElement;
		var oParent;
		var oLayoutData;

		if (oElement instanceof sap.ui.core.Title || oElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
			//start a new container with a title
			oFormContainer = _createFormContainer.call(this, oElement);
			oForm.addFormContainer(oFormContainer);
			this._changedFormContainers.push(oFormContainer);
		} else if (oElement.getMetadata().isInstanceOf("sap.ui.core.Label")) { // if the control implements the label interface
			// new label -> create new FormElement
			// determine Container from last Content element
			if (iLength > 0) {
				oLastElement = this._aElements[iLength - 1];
				oParent = oLastElement.getParent();
				if (oParent instanceof FormElement) {
					oFormContainer = oParent.getParent();
				} else if (oParent instanceof FormContainer) {
					oFormContainer = oParent;
				}
			}
			if (!oFormContainer) {
				oFormContainer = _createFormContainer.call(this);
				oForm.addFormContainer(oFormContainer);
				this._changedFormContainers.push(oFormContainer);
			}

			oFormElement = _addFormElement.call(this, oFormContainer, oElement);
		} else {
			// new Field -> add to last FormElement
			if (iLength > 0) {
				oLastElement = this._aElements[iLength - 1];
				oParent = oLastElement.getParent();
				if (oParent instanceof FormElement) {
					oFormContainer = oParent.getParent();
					oFormElement = oParent;
					oLayoutData = _getFieldLayoutData.call(this, oElement);
					if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") &&
							!_isMyLayoutData.call(this, oLayoutData) && oLayoutData.getLinebreak()) {
						oFormElement = _addFormElement.call(this, oFormContainer);
					}
				} else if (oParent instanceof FormContainer) {
					oFormContainer = oParent;
					oFormElement = _addFormElement.call(this, oFormContainer);
				}
			} else {
				// no FormContainer and FormElement exists
				oFormContainer = _createFormContainer.call(this);
				oForm.addFormContainer(oFormContainer);
				this._changedFormContainers.push(oFormContainer);
				oFormElement = _addFormElement.call(this, oFormContainer);
			}

			_createFieldLayoutData.call(this, oElement, 5, false, true);

			oFormElement.addField(oElement);
			_markFormElementForUpdate(this._changedFormElements, oFormElement);
		}

		this._aElements.push(oElement);
		this._oObserver.observe(oElement, {properties: ["visible"]});
		this.invalidate();
		this._bChangedByMe = false;
		return this;

	};

	SimpleForm.prototype.insertContent = function(oElement, iIndex) {

		oElement = this.validateAggregation("content", oElement, /* multiple */ true);

		if (this.indexOfContent(oElement) >= 0) {
			// element is already there, remove before insert it
			jQuery.sap.log.warning("SimpleForm.insertContent: Content element '" + oElement + "' already assigned. Please remove before insert!", this);
			this.removeContent(oElement);
		}

		if (!this._aElements) {
			this._aElements = [];
		}

		var iLength = this._aElements.length;
		var iNewIndex;
		if (iIndex < 0) {
			iNewIndex = 0;
		} else if (iIndex > iLength) {
			iNewIndex = iLength;
		} else {
			iNewIndex = iIndex;
		}
		if (iNewIndex !== iIndex) {
			jQuery.sap.log.warning("SimpleForm.insertContent: index '" + iIndex + "' out of range [0," + iLength + "], forced to " + iNewIndex);
		}

		if (iNewIndex == iLength) {
			// just added to the end -> use add function
			this.addContent(oElement);
			return this;
		}

		this._bChangedByMe = true;
		var oOldElement = this._aElements[iNewIndex];
		var oForm = this.getAggregation("form");
		var oFormContainer;
		var oFormElement;
		var oOldFormContainer;
		var oOldFormElement;
		var iContainerIndex;
		var iElementIndex = 0;
		var iFieldIndex;
		var aFields;
		var aFormElements;
		var aFormContainers;
		var i = 0;
		var oField;
		var oLayoutData;

		if (oElement instanceof sap.ui.core.Title || oElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
			//start a new container with a title
			if (iIndex == 0 && !(oOldElement instanceof sap.ui.core.Title || oOldElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar"))) {
				// special case - index==0 and first container has no title -> just add title to Container
				oFormContainer = oOldElement.getParent().getParent();
				if (oElement instanceof sap.ui.core.Title) {
					oFormContainer.setTitle(oElement);
				} else {
					oFormContainer.setToolbar(oElement);
				}
			} else {
				oFormContainer = _createFormContainer.call(this, oElement);
				if (oOldElement instanceof sap.ui.core.Title || oOldElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
					// insert before old container
					oOldFormContainer = oOldElement.getParent();
					iContainerIndex = oForm.indexOfFormContainer(oOldFormContainer);
				} else {
					// insert after old container
					oOldFormElement = oOldElement.getParent();
					oOldFormContainer = oOldFormElement.getParent();
					iContainerIndex = oForm.indexOfFormContainer(oOldFormContainer) + 1;
					iElementIndex = oOldFormContainer.indexOfFormElement(oOldFormElement);

					// check if old FormElement must be splited
					if (!oOldElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
						iFieldIndex = oOldFormElement.indexOfField(oOldElement);
						if (iFieldIndex > 0 || oOldFormElement.getLabel()) {
							// split FormElement
							oFormElement = _addFormElement.call(this, oFormContainer);
							this._changedFormElements.push(oFormElement);
							_markFormElementForUpdate(this._changedFormElements, oOldFormElement);
							// move all Fields after index into new FormElement
							aFields = oOldFormElement.getFields();
							for ( i = iFieldIndex; i < aFields.length; i++) {
								oField = aFields[i];
								oFormElement.addField(oField);
							}
							iElementIndex++;
						}
					}
					// move all FormElements after the new content into the new container
					aFormElements = oOldFormContainer.getFormElements();
					for ( i = iElementIndex; i < aFormElements.length; i++) {
						oFormContainer.addFormElement(aFormElements[i]);
					}
				}
				oForm.insertFormContainer(oFormContainer, iContainerIndex);
			}
			this._changedFormContainers.push(oFormContainer);
		} else if (oElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
			if (oOldElement instanceof sap.ui.core.Title || oOldElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
				// add new FormElement to previous container
				oOldFormContainer = oOldElement.getParent();
				iContainerIndex = oForm.indexOfFormContainer(oOldFormContainer);
				aFormContainers = oForm.getFormContainers();
				if (iContainerIndex == 0) {
					// it's the first container - insert new container before
					oFormContainer = _createFormContainer.call(this);
					oForm.insertFormContainer(oFormContainer, iContainerIndex);
					this._changedFormContainers.push(oFormContainer);
				} else {
					oFormContainer = aFormContainers[iContainerIndex - 1];
				}
				oFormElement = _addFormElement.call(this, oFormContainer, oElement);
			} else if (oOldElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
				// insert new form element before this one
				oOldFormContainer = oOldElement.getParent().getParent();
				iElementIndex = oOldFormContainer.indexOfFormElement(oOldElement.getParent());
				oFormElement = _insertFormElement.call(this, oOldFormContainer, oElement, iElementIndex);
			} else {
				// split FormElement
				oOldFormElement = oOldElement.getParent();
				oOldFormContainer = oOldFormElement.getParent();
				iElementIndex = oOldFormContainer.indexOfFormElement(oOldFormElement) + 1;
				iFieldIndex = oOldFormElement.indexOfField(oOldElement);

				if (iFieldIndex == 0 && !oOldFormElement.getLabel()) {
					// special case: FormElement has no label and inserted before first Field
					oFormElement = oOldFormElement;
					oFormElement.setLabel(oElement);
					_createFieldLayoutData.call(this, oElement, this._iLabelWeight, false, true, this.getLabelMinWidth());
				} else {
					oFormElement = _insertFormElement.call(this, oOldFormContainer, oElement, iElementIndex);
					_markFormElementForUpdate(this._changedFormElements, oOldFormElement);

					// move all Fields after index into new FormElement
					aFields = oOldFormElement.getFields();
					for ( i = iFieldIndex; i < aFields.length; i++) {
						oField = aFields[i];
						oFormElement.addField(oField);
					}
				}
			}
			this._changedFormElements.push(oFormElement);
		} else { // new field
			oLayoutData = _getFieldLayoutData.call(this, oElement);
			if (oOldElement instanceof sap.ui.core.Title || oOldElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
				// add new Field to last FormElement of previous FormContainer
				oOldFormContainer = oOldElement.getParent();
				iContainerIndex = oForm.indexOfFormContainer(oOldFormContainer);

				if (iContainerIndex == 0) {
					// it's the first FormContainer - insert new FormContainer before
					oFormContainer = _createFormContainer.call(this);
					oForm.insertFormContainer(oFormContainer, iContainerIndex);
					this._changedFormContainers.push(oFormContainer);
				} else {
					aFormContainers = oForm.getFormContainers();
					oFormContainer = aFormContainers[iContainerIndex - 1];
				}

				aFormElements = oFormContainer.getFormElements();
				if (aFormElements.length == 0) {
					// FormContainer has no FormElements -> create one
					oFormElement = _addFormElement.call(this, oFormContainer);
				} else if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") &&
									 !_isMyLayoutData.call(this, oLayoutData) && oLayoutData.getLinebreak()) {
					oFormElement = _addFormElement.call(this, oFormContainer);
				} else {
					oFormElement = aFormElements[aFormElements.length - 1];
				}

				oFormElement.addField(oElement);
			} else if (oOldElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
				// add new field to previous FormElement
				oOldFormElement = oOldElement.getParent();
				oFormContainer = oOldFormElement.getParent();
				iElementIndex = oFormContainer.indexOfFormElement(oOldFormElement);

				if (iElementIndex == 0) {
					// it's already the first FormElement -> insert a new one before
					oFormElement = _insertFormElement.call(this, oFormContainer, null, 0);
				} else if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") &&
									 !_isMyLayoutData.call(this, oLayoutData) && oLayoutData.getLinebreak()) {
					oFormElement = _insertFormElement.call(this, oFormContainer, null, iElementIndex);
				} else {
					aFormElements = oFormContainer.getFormElements();
					oFormElement = aFormElements[iElementIndex - 1];
				}
				oFormElement.addField(oElement);
			} else {
				// insert new field into same FormElement before old field
				oFormElement = oOldElement.getParent();
				iFieldIndex = oFormElement.indexOfField(oOldElement);
				if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") &&
						!_isMyLayoutData.call(this, oLayoutData) && oLayoutData.getLinebreak() && iFieldIndex > 0) {
					// split FormElement
					oFormContainer = oFormElement.getParent();
					iElementIndex = oFormContainer.indexOfFormElement(oFormElement);
					_markFormElementForUpdate(this._changedFormElements, oFormElement);
					aFields = oFormElement.getFields();
					oFormElement = _insertFormElement.call(this, oFormContainer, undefined, iElementIndex + 1);
					oFormElement.addField(oElement);

					// move all Fields after index into new FormElement
					for ( i = iFieldIndex; i < aFields.length; i++) {
						oField = aFields[i];
						oFormElement.addField(oField);
					}
				} else {
					oFormElement.insertField(oElement, iFieldIndex);
				}
			}
			_markFormElementForUpdate(this._changedFormElements, oFormElement);

			_createFieldLayoutData.call(this, oElement, 5, false, true);
		}

		this._aElements.splice(iNewIndex, 0, oElement);
		this._oObserver.observe(oElement, {properties: ["visible"]});
		this.invalidate();
		this._bChangedByMe = false;
		return this;

	};

	SimpleForm.prototype.removeContent = function(vElement) {

		var oElement = null;
		var iIndex = -1;
		var i = 0;

		if (this._aElements) {

			if (typeof (vElement) == "string") { // ID of the element is given
				vElement = sap.ui.getCore().byId(vElement);
			}

			if (typeof (vElement) == "object") { // the element itself is given or has just been retrieved
				for (i = 0; i < this._aElements.length; i++) {
					if (this._aElements[i] == vElement) {
						vElement = i;
						break;
					}
				}
			}

			if (typeof (vElement) == "number") { // "vElement" is the index now
				if (vElement < 0 || vElement >= this._aElements.length) {
					jQuery.sap.log.warning("Element.removeAggregation called with invalid index: Items, " + vElement);
				} else {
					iIndex = vElement;
					oElement = this._aElements[iIndex];
				}
			}
		}
		if (oElement) {
			this._bChangedByMe = true;
			var oForm = this.getAggregation("form");
			var oFormContainer;
			var oFormElement;
			var aFormElements;
			var aFields;

			if (oElement instanceof sap.ui.core.Title || oElement.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
				oFormContainer = oElement.getParent();
				oFormContainer.setTitle(null);
				oFormContainer.setToolbar(null);
				if (iIndex > 0) {
					// if it's the first FormContainer -> just remove title
					// remove FormContainer and add content to previous FormContainer
					aFormElements = oFormContainer.getFormElements();
					var iContainerIndex = oForm.indexOfFormContainer(oFormContainer);
					var oPrevFormContainer = oForm.getFormContainers()[iContainerIndex - 1];
					if (aFormElements.length > 0 && !aFormElements[0].getLabel()) {
						// first FormElement has no label -> add its fields to last FormElement of previous FormContainer
						var aPrevFormElements = oPrevFormContainer.getFormElements();
						var oLastFormElement = aPrevFormElements[aPrevFormElements.length - 1];
						aFields = aFormElements[0].getFields();
						for (i = 0; i < aFields.length; i++) {
							oLastFormElement.addField(aFields[i]);
						}
						_markFormElementForUpdate(this._changedFormElements, oLastFormElement);
						oFormContainer.removeFormElement(aFormElements[0]);
						aFormElements[0].destroy();
						aFormElements.splice(0,1);
					}
					for (i = 0; i < aFormElements.length; i++) {
						oPrevFormContainer.addFormElement(aFormElements[i]);
					}
					_markFormElementForUpdate(this._changedFormContainers, oPrevFormContainer);
					oForm.removeFormContainer(oFormContainer);
					oFormContainer.destroy();
				} else if (oFormContainer.getFormElements().length == 0) {
					// remove empty FormContainer
					oForm.removeFormContainer(oFormContainer);
					oFormContainer.destroy();
				}
			} else if (oElement.getMetadata().isInstanceOf("sap.ui.core.Label")) {
				oFormElement = oElement.getParent();
				oFormContainer = oFormElement.getParent();
				oFormElement.setLabel(null);
				var iElementIndex = oFormContainer.indexOfFormElement(oFormElement);
				if (iElementIndex == 0) {
					// its the first Element of the FormContainer -> just remove label
					if (oFormElement.getFields().length == 0) {
						// FormElement has no fields -> just delete
						oFormContainer.removeFormElement(oFormElement);
						oFormElement.destroy();
						if (oFormContainer.getFormElements().length == 0 && !oFormContainer.getTitle() && !oFormContainer.getToolbar()) {
							oForm.removeFormContainer(oFormContainer);
							oFormContainer.destroy();
						}
					} else {
						_markFormElementForUpdate(this._changedFormElements, oFormElement);
					}
				} else {
					// add fields to previous FormElement
					aFormElements = oFormContainer.getFormElements();
					var oPrevFormElement = aFormElements[iElementIndex - 1];
					aFields = oFormElement.getFields();
					for (i = 0; i < aFields.length; i++) {
						oPrevFormElement.addField(aFields[i]);
					}
					_markFormElementForUpdate(this._changedFormElements, oPrevFormElement);
					oFormContainer.removeFormElement(oFormElement);
					oFormElement.destroy();
				}
			} else { // remove field
				oFormElement = oElement.getParent();
				oFormElement.removeField(oElement);
				if (oFormElement.getFields().length == 0 && !oFormElement.getLabel()) {
					// FormElement has no more fields and no label -> just delete
					oFormContainer = oFormElement.getParent();
					oFormContainer.removeFormElement(oFormElement);
					oFormElement.destroy();
					if (oFormContainer.getFormElements().length == 0  && !oFormContainer.getTitle() && !oFormContainer.getToolbar()) {
						oForm.removeFormContainer(oFormContainer);
						oFormContainer.destroy();
					}
				} else {
					_markFormElementForUpdate(this._changedFormElements, oFormElement);
				}
			}

			this._aElements.splice(iIndex, 1);
			oElement.setParent(null);
			this._oObserver.unobserve(oElement);
			_removeLayoutData.call(this, oElement);

			this.invalidate();
			this._bChangedByMe = false;
			return oElement;
		}
		return null;

	};

	SimpleForm.prototype.removeAllContent = function() {

		var i = 0;

		if (this._aElements) {
			this._bChangedByMe = true;
			var oForm = this.getAggregation("form");
			var aFormContainers = oForm.getFormContainers();
			for (i = 0; i < aFormContainers.length; i++) {
				var oFormContainer = aFormContainers[i];
				oFormContainer.setTitle(null);
				oFormContainer.setToolbar(null);
				var aFormElements = oFormContainer.getFormElements();
				for ( var j = 0; j < aFormElements.length; j++) {
					var oFormElement = aFormElements[j];
					oFormElement.setLabel(null);
					oFormElement.removeAllFields();
				}
				oFormContainer.destroyFormElements();
			}
			oForm.destroyFormContainers();

			for (i = 0; i < this._aElements.length; i++) {
				var oElement = this._aElements[i];
				_removeLayoutData.call(this, oElement);
				this._oObserver.unobserve(oElement);
			}
			var aElements = this._aElements;
			this._aElements = null;
			this.invalidate();
			this._bChangedByMe = false;
			return aElements;
		} else {
			return [];
		}

	};

	SimpleForm.prototype.destroyContent = function() {

		var aElements = this.removeAllContent();

		if (aElements) {
			this._bChangedByMe = true;
			for (var i = 0; i < aElements.length; i++) {
				aElements[i].destroy();
			}
			this.invalidate();
			this._bChangedByMe = false;
		}
		return this;

	};

	SimpleForm.prototype.getContent = function() {

		if (!this._aElements) {
			this._aElements = this.getAggregation("content", []);
		}
		return this._aElements.slice();

	};

	/*
	 * Set the FormLayout to the Form. If a FormLayout is already set, just set a new one.
	 */
	SimpleForm.prototype.setLayout = function(sLayout) {

		var sOldLayout = this.getLayout();
		if (sLayout != sOldLayout) {
			_removeOldLayoutData.call(this);
		}

		this.setProperty("layout", sLayout);

		if (sLayout != sOldLayout) {
			var bSet = _setFormLayout.call(this);

			if (bSet) {
				_addLayoutData.call(this);
			}
		}

		return this;

	};

	/*
	 * Overwrite the clone function because content will not be cloned in default one
	 */
	SimpleForm.prototype.clone = function(sIdSuffix) {

		this._bChangedByMe = true;
		var oClone = Control.prototype.clone.apply(this, arguments);
		var aContent = this.getContent();

		for ( var i = 0; i < aContent.length; i++) {
			var oElement = aContent[i];
			var oLayoutData = oElement.getLayoutData();
			this._oObserver.unobserve(oElement);
			var oElementClone = oElement.clone(sIdSuffix);
			this._oObserver.observe(oElement, {properties: ["visible"]});
			if (oLayoutData) {
				// mark private LayoutData
				if (_isLazyInstance(oLayoutData, "sap/ui/core/VariantLayoutData")) {
					var aLayoutData = oLayoutData.getMultipleLayoutData();
					for ( var j = 0; j < aLayoutData.length; j++) {
						if (_isMyLayoutData.call(this, aLayoutData[j])) {
							oClone._aLayouts.push(oElementClone.getLayoutData().getMultipleLayoutData()[j].getId());
						}
					}
				} else if (_isMyLayoutData.call(this, oLayoutData)) {
					oClone._aLayouts.push(oElementClone.getLayoutData().getId());
				}
			}
			oClone.addContent(oElementClone);
		}

		this._bChangedByMe = false;
		return oClone;

	};

	function _setFormLayout() {

			var oForm = this.getAggregation("form");
			if (oForm.getLayout()) {
				this._bChangedByMe = true;
				oForm.destroyLayout();
				_removeResize.call(this);
				this._bChangedByMe = false;
			}

			var oLayout;

			switch (this.getLayout()) {
			case SimpleFormLayout.ResponsiveLayout:
				if ((!ResponsiveLayout || !ResponsiveFlowLayoutData) && !this._bResponsiveLayoutRequested) {
					ResponsiveLayout = sap.ui.require("sap/ui/layout/form/ResponsiveLayout");
					ResponsiveFlowLayoutData = sap.ui.require("sap/ui/layout/ResponsiveFlowLayoutData");
					if (!ResponsiveLayout || !ResponsiveFlowLayoutData) {
						sap.ui.require(["sap/ui/layout/form/ResponsiveLayout",
						                "sap/ui/layout/ResponsiveFlowLayoutData"],
						                _ResponsiveLayoutLoaded.bind(this));
						this._bResponsiveLayoutRequested = true;
					}
				}
				if (ResponsiveLayout && ResponsiveFlowLayoutData) {
					oLayout = new ResponsiveLayout(this.getId() + "--Layout");
				}
				break;
			case SimpleFormLayout.GridLayout:
				if ((!GridLayout || !GridContainerData || !GridElementData) && !this._bGridLayoutRequested) {
					GridLayout = sap.ui.require("sap/ui/layout/form/GridLayout");
					GridContainerData = sap.ui.require("sap/ui/layout/form/GridContainerData");
					GridElementData = sap.ui.require("sap/ui/layout/form/GridElementData");
					if (!GridLayout || !GridContainerData || !GridElementData) {
						sap.ui.require(["sap/ui/layout/form/GridLayout",
						                "sap/ui/layout/form/GridContainerData",
						                "sap/ui/layout/form/GridElementData"],
						                _GridLayoutLoaded.bind(this));
						this._bGridLayoutRequested = true;
					}
				}
				if (GridLayout && GridContainerData && GridElementData) {
					oLayout = new GridLayout(this.getId() + "--Layout");
				}
				break;
			case SimpleFormLayout.ResponsiveGridLayout:
				if (!ResponsiveGridLayout && !this._bResponsiveGridLayoutRequested) {
					ResponsiveGridLayout = sap.ui.require("sap/ui/layout/form/ResponsiveGridLayout");
					if (!ResponsiveGridLayout) {
						sap.ui.require(["sap/ui/layout/form/ResponsiveGridLayout"], _ResponsiveGridLayoutLoaded.bind(this));
						this._bResponsiveGridLayoutRequested = true;
					}
				}
				if (ResponsiveGridLayout) {
					oLayout = new ResponsiveGridLayout(this.getId() + "--Layout");
				}
				break;
			// no default
			}

			if (oLayout) {
				this._bChangedByMe = true;
				oForm.setLayout(oLayout);
				this._bChangedByMe = false;
				return true; // layout set
			}

			return false; // no layout set

	}

	function _ResponsiveLayoutLoaded(fnResponsiveLayout, fnResponsiveFlowLayoutData) {

		ResponsiveLayout = fnResponsiveLayout;
		ResponsiveFlowLayoutData = fnResponsiveFlowLayoutData;
		this._bResponsiveLayoutRequested = false;

		if (this.getLayout() == SimpleFormLayout.ResponsiveLayout) { // as layout might changed
			_updateLayoutAfterLoaded.call(this);
		}

	}

	function _GridLayoutLoaded(fnGridLayout, fnGridContainerData, fnGridElementData) {

		GridLayout = fnGridLayout;
		GridContainerData = fnGridContainerData;
		GridElementData = fnGridElementData;
		this._bGridLayoutRequested = false;

		if (this.getLayout() == SimpleFormLayout.GridLayout) { // as layout might changed
			_updateLayoutAfterLoaded.call(this);
		}

	}

	function _ResponsiveGridLayoutLoaded(fnResponsiveGridLayout) {

		ResponsiveGridLayout = fnResponsiveGridLayout;
		this._bResponsiveGridLayoutRequested = false;

		if (this.getLayout() == SimpleFormLayout.ResponsiveGridLayout) { // as layout might changed
			_updateLayoutAfterLoaded.call(this);
		}

	}

	function _updateLayoutAfterLoaded() {

		if (!this._bIsBeingDestroyed) {
			_setFormLayout.call(this);
			_addLayoutData.call(this);
			if (this.getDomRef()) {
				_updateLayout.call(this);
			}
		}

	}

	function _removeOldLayoutData() {

		this._bChangedByMe = true;
		var oForm = this.getAggregation("form");
		var aContainers = oForm.getFormContainers();

		for ( var i = 0; i < aContainers.length; i++) {
			var oContainer = aContainers[i];
			_markFormElementForUpdate(this._changedFormContainers, oContainer);
			if (oContainer.getLayoutData()) {
				oContainer.destroyLayoutData();
			}

			var aElements = oContainer.getFormElements();
			for ( var j = 0; j < aElements.length; j++) {
				var oElement = aElements[j];
				_markFormElementForUpdate(this._changedFormElements, oElement);
				if (oElement.getLayoutData()) {
					oElement.destroyLayoutData();
				}

				var oLabel = oElement.getLabel();
				if (oLabel) {
					_removeLayoutData.call(this, oLabel);
				}

				var aFields = oElement.getFields();
				for ( var k = 0; k < aFields.length; k++) {
					var oField = aFields[k];
					_removeLayoutData.call(this, oField);
				}
			}
		}

		this._bChangedByMe = false;

	}

	function _addLayoutData() {

		this._bChangedByMe = true;
		var oForm = this.getAggregation("form");
		var aContainers = oForm.getFormContainers();

		for ( var i = 0; i < aContainers.length; i++) {
			var oContainer = aContainers[i];
			_markFormElementForUpdate(this._changedFormContainers, oContainer);
			_createContainerLayoutData.call(this, oContainer);

			var aElements = oContainer.getFormElements();
			for ( var j = 0; j < aElements.length; j++) {
				var oElement = aElements[j];
				_markFormElementForUpdate(this._changedFormElements, oElement);
				_createElementLayoutData.call(this, oElement);

				var oLabel = oElement.getLabel();
				if (oLabel) {
					_createFieldLayoutData.call(this, oLabel, this._iLabelWeight, false, true, this.getLabelMinWidth());
				}

				var aFields = oElement.getFields();
				for ( var k = 0; k < aFields.length; k++) {
					var oField = aFields[k];
					_createFieldLayoutData.call(this, oField, 5, false, true);
				}
			}
		}

		this._bChangedByMe = false;

	}

	/*
	 * Updates the Layout and corresponding layoutData of the SimpleForm.
	 */
	function _updateLayout() {

		this._bChangedByMe = true;
		this._changedFormContainers = [];

		var sLayout = this.getLayout();
		var oLayout = this.getAggregation("form").getLayout();

		oLayout.setBackgroundDesign(this.getBackgroundDesign());

		switch (sLayout) {
		case SimpleFormLayout.ResponsiveLayout:
			// set the default values for linebreakes to avoid flickering for default case
			this._applyLinebreaks();

			for ( var i = 0; i < this._changedFormElements.length; i++) {
				var oFormElement = this._changedFormElements[i];
				_applyFieldWeight.call(this, oFormElement);
			}
			break;
		case SimpleFormLayout.GridLayout:
			_applyContainerSize.call(this);
			break;
		case SimpleFormLayout.ResponsiveGridLayout:
			oLayout.setLabelSpanXL(this.getLabelSpanXL());
			oLayout.setLabelSpanL(this.getLabelSpanL());
			oLayout.setLabelSpanM(this.getLabelSpanM());
			oLayout.setLabelSpanS(this.getLabelSpanS());
			oLayout.setAdjustLabelSpan(this.getAdjustLabelSpan());
			oLayout.setEmptySpanXL(this.getEmptySpanXL());
			oLayout.setEmptySpanL(this.getEmptySpanL());
			oLayout.setEmptySpanM(this.getEmptySpanM());
			oLayout.setEmptySpanS(this.getEmptySpanS());
			oLayout.setColumnsXL(this.getColumnsXL());
			oLayout.setColumnsL(this.getColumnsL());
			oLayout.setColumnsM(this.getColumnsM());
			oLayout.setSingleContainerFullSize(this.getSingleContainerFullSize());
			oLayout.setBreakpointXL(this.getBreakpointXL());
			oLayout.setBreakpointL(this.getBreakpointL());
			oLayout.setBreakpointM(this.getBreakpointM());
			break;
			// no default
		}

		this._changedFormElements = [];
		this._bChangedByMe = false;

	}

	/*
	 * Checks whether the given LayoutData is created and added by this SimpleForm
	 * @param { sap.ui.layout.ResponsiveFlowLayoutData} optional (interface) The layout data
	 * @returns {boolean} Whether the given layout was created by this SimpleForm
	 * @private
	 */
	function _isMyLayoutData(oLayoutData) {

		var sId = oLayoutData.getId(),
		sLayouts = " " + this._aLayouts.join(" ") + " ";
		return sLayouts.indexOf(" " + sId + " ") >  -1;

	}

	/*
	 * Creates new sap.ui.layout.ResponsiveFlowLayoutData with the given parameters
	 * @param {int} iWeight the weight for the layout data
	 * @param {boolean} bLinebreak Whether the layout data has a linebreak
	 * @param {boolean} bLinebreakable Whether the layout data is linebreakable
	 * @returns {sap.ui.layout.ResponsiveFlowLayoutData} The newly created ResponsiveFlowLayoutData
	 * @private
	 */
	function _createRFLayoutData(iWeight, bLinebreak, bLinebreakable, iMinWidth) {

		var oLayout = new ResponsiveFlowLayoutData({weight:iWeight,linebreak:bLinebreak === true,linebreakable: bLinebreakable === true});
		if (iMinWidth) {
			oLayout.setMinWidth(iMinWidth);
		}
		this._aLayouts.push(oLayout.getId());
		return oLayout;

	}

	/*
	 * There may be VariantLayoutData used -> so get the right one for the used Layout
	 */
	function _getFieldLayoutData(oField){

		var oLayoutData;

		switch (this.getLayout()) {
		case SimpleFormLayout.ResponsiveLayout:
			oLayoutData = FormLayout.prototype.getLayoutDataForElement(oField, "sap.ui.layout.ResponsiveFlowLayoutData");
			break;
		case SimpleFormLayout.GridLayout:
			oLayoutData = FormLayout.prototype.getLayoutDataForElement(oField, "sap.ui.layout.form.GridElementData");
			break;
		case SimpleFormLayout.ResponsiveGridLayout:
			oLayoutData = FormLayout.prototype.getLayoutDataForElement(oField, "sap.ui.layout.GridData");
			break;
			// no default
		}

		return oLayoutData;

	}

	function _checkLayoutDataReady() {

		if (this._bResponsiveLayoutRequested || this._bGridLayoutRequested || this._bResponsiveGridLayoutRequested) {
			// LayoutData waiting to be loaded -> are set after they are loaded
			return false;
		}

		if (!this.getAggregation("form").getLayout()) {
			// as we want to set LayoutData set the corresponding Layout
			var bChangedByMe = this._bChangedByMe;
			var bSet = _setFormLayout.call(this);
			this._bChangedByMe = bChangedByMe;
			if (!bSet) {
				// create LayoutData after Layout is loaded
				return false;
			}
		}

		return true;

	}

	function _createFieldLayoutData(oField, iWeight, bLinebreak, bLinebreakable, iMinWidth) {

		if (this.getLayout() != SimpleFormLayout.ResponsiveLayout) {
			return;
		}

		if (!_checkLayoutDataReady.call(this)) {
			// LayoutData waiting to be loaded -> are set after they are loaded
			return;
		}

		this._bLayoutDataChangedByMe = true;

		var oLayoutData = _getFieldLayoutData.call(this, oField);
		if (!oLayoutData || !_isMyLayoutData.call(this, oLayoutData)) {
			oLayoutData = oField.getLayoutData();
			if (_isLazyInstance(oLayoutData, "sap/ui/core/VariantLayoutData")) {
				oLayoutData.addMultipleLayoutData(_createRFLayoutData.call(this, iWeight, bLinebreak, bLinebreakable, iMinWidth));
			} else if (!oLayoutData) {
				oField.setLayoutData(_createRFLayoutData.call(this, iWeight, bLinebreak, bLinebreakable, iMinWidth));
			} else {
				jQuery.sap.log.warning("ResponsiveFlowLayoutData can not be set on Field " + oField.getId(), "_createFieldLayoutData", "SimpleForm");
			}
		}

		this._bLayoutDataChangedByMe = false;

	}

	function _createElementLayoutData(oElement) {

		if (this.getLayout() != SimpleFormLayout.ResponsiveLayout) {
			return;
		}

		if (!_checkLayoutDataReady.call(this)) {
			// LayoutData waiting to be loaded -> are set after they are loaded
			return;
		}

		this._bLayoutDataChangedByMe = true;

		oElement.setLayoutData(new ResponsiveFlowLayoutData({linebreak:true, margin:false}));

		this._bLayoutDataChangedByMe = false;

	}

	function _createContainerLayoutData(oContainer) {

		var sLayout = this.getLayout();
		if (sLayout != SimpleFormLayout.ResponsiveLayout &&
				sLayout != SimpleFormLayout.GridLayout) {
			return;
		}

		if (!_checkLayoutDataReady.call(this)) {
			// LayoutData waiting to be loaded -> are set after they are loaded
			return;
		}

		this._bLayoutDataChangedByMe = true;

		switch (sLayout) {
		case SimpleFormLayout.ResponsiveLayout:
			oContainer.setLayoutData(new ResponsiveFlowLayoutData({minWidth:280}));
			break;
		case SimpleFormLayout.GridLayout:
			if (this.getMaxContainerCols() > 1) {
				oContainer.setLayoutData(new GridContainerData({halfGrid: true}));
			} else {
				oContainer.setLayoutData(new GridContainerData({halfGrid: false}));
			}
			break;
			// no default
		}

		this._bLayoutDataChangedByMe = false;

	}

	function _removeLayoutData(oElement) {

		this._bLayoutDataChangedByMe = true;

		var oLayout = _getFieldLayoutData.call(this, oElement);
		if (oLayout) {
			var sLayoutId = oLayout.getId();

			for ( var i = 0; i < this._aLayouts.length; i++) {
				var sId = this._aLayouts[i];
				if (sLayoutId == sId) {
					oLayout.destroy(); // is removed from parent during destroy
					this._aLayouts.splice(i, 1);
					break;
				}
			}
		}

		this._bLayoutDataChangedByMe = false;

	}

	/*
	 * Adds a new FormElement to the given FormContainer and adds the given label to it.
	 * @param {sap.ui.layout.form.FormContainer} The form container
	 * @param {sap.ui.core.Label} optional (interface) The label of the FormElement
	 * @returns {sap.ui.layout.form.FormElement} The newly created FormElement
	 * @private
	 */
	function _addFormElement(oFormContainer, oLabel) {

		var oElement = _createFormElement.call(this, oLabel);
		oFormContainer.addFormElement(oElement);
		return oElement;

	}

	function _insertFormElement(oFormContainer, oLabel, iIndex) {

		var oElement = _createFormElement.call(this, oLabel);
		oFormContainer.insertFormElement(oElement, iIndex);
		return oElement;

	}

	function _createFormElement(oLabel) {

		var oElement = new FormElement();
		_createElementLayoutData.call(this, oElement);
		if (oLabel) {
			oLabel.addStyleClass("sapUiFormLabel-CTX");
			oElement.setLabel(oLabel);
			if (!_getFieldLayoutData.call(this, oLabel)) {
				_createFieldLayoutData.call(this, oLabel, this._iLabelWeight, false, true, this.getLabelMinWidth());
			}
		}
		oElement.isVisible = function(){

			var aFields = this.getFields();
			var bVisible = false;

			for (var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				if (oField.getVisible()) {
					// at least one Field is visible
					bVisible = true;
					break;
				}
			}

			return bVisible;

		};

		return oElement;

	}

	/*
	 * Creates a new FormContainer and adds the given title to it.
	 * @param {sap.ui.core.Title || sap.ui.core.Toolbar} optional The title or toolbar of the FormContainer
	 * @returns {sap.ui.layout.form.FormContainer} The newly created FormContainer
	 * @private
	 */
	function _createFormContainer(oTitle) {

		var oContainer = new FormContainer();
		_createContainerLayoutData.call(this, oContainer);

		oContainer.getAriaLabelledBy = function() {
			// use aria-label of toolbar
			var oToolbar = this.getToolbar();
			if (oToolbar) {
				return oToolbar.getAriaLabelledBy();
			} else {
				return [];
			}
		};

		if (oTitle) {
			if (oTitle instanceof sap.ui.core.Title) {
				oContainer.setTitle(oTitle);
			} else if (oTitle.getMetadata().isInstanceOf("sap.ui.core.Toolbar")) {
				oContainer.setToolbar(oTitle);
			}
		}
		return oContainer;

	}

	/*
	 * Applies the weight property for the fields in the responsive layout.
	 * @param {sap.ui.layout.form.FormElement} oElement The FormElement where the weight is applied.
	 * @private
	 */
	function _applyFieldWeight(oElement){

		var iMaxWeight = this._iMaxWeight;
		var aFields = oElement.getFields();
		var oField;
		var iLength = aFields.length;
		var oLabel = oElement.getLabel();
		var oLayoutData;
		var i = 0;

		this._bLayoutDataChangedByMe = true;

		if (oLabel && _getFieldLayoutData.call(this, oLabel)) {
			iMaxWeight = iMaxWeight - _getFieldLayoutData.call(this, oLabel).getWeight();
		}

		// determine weights set from application
		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];
			oLayoutData = _getFieldLayoutData.call(this, oField);
			if (_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData") &&
					!_isMyLayoutData.call(this, oLayoutData)) {
				iMaxWeight = iMaxWeight - oLayoutData.getWeight();
				iLength--;
			}
		}

		var iWeight = Math.floor(iMaxWeight / iLength);
		var iRest = iMaxWeight % iLength;

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];
			oLayoutData = _getFieldLayoutData.call(this, oField);
			var iCurrentWeight = iWeight;

			if (!oLayoutData) {
				_createFieldLayoutData.call(this, oField, iCurrentWeight, false, i == 0);
			} else if (_isMyLayoutData.call(this, oLayoutData) &&
					_isLazyInstance(oLayoutData, "sap/ui/layout/ResponsiveFlowLayoutData")) {
				// devide rest to first fields (not only to last one) (fist because to ignore manual set weigths)
				if (iRest > 0) {
					iCurrentWeight++;
					iRest--;
				}
				oLayoutData.setWeight(iCurrentWeight);
			}
		}

		this._bLayoutDataChangedByMe = false;
	}

	/*
	 * Applies the linebreaks of FormContainers according to the minWidth and maxContainerCol settings of the SimpleForm
	 * @private
	 */
	SimpleForm.prototype._applyLinebreaks = function(){

		if (!ResponsiveLayout || this._bResponsiveLayoutRequested) {
			// Responsive Layout (and LayoutData) not loaded until now -> do it after it is loaded
			return;
		}

		this._bLayoutDataChangedByMe = true;
		var oForm = this.getAggregation("form"),
		aContainers = oForm.getFormContainers();
		// set linebreak on every FormContainer if Form is smaller than getMinWidth pixel
		// and reset it if it's larger
		var oDomRef = this.getDomRef();
		var o$ = this.$();
		for (var i = 1; i < aContainers.length; i++) {
			var oContainer = aContainers[i],
			oLayoutData = oContainer.getLayoutData();
			if (!oDomRef || o$.outerWidth(true) > this.getMinWidth()) {
				// if not already rendered use default values according to column number
				if (i % this.getMaxContainerCols() == 0) {
					oLayoutData.setLinebreak(true);
				} else {
					oLayoutData.setLinebreak(false);
				}
			} else {
				oLayoutData.setLinebreak(true);
			}
		}
		if (oDomRef && o$.css("visibility") == "hidden") {
			var that = this;
			setTimeout(function() {
				if (that.getDomRef()) {
					that.$().css("visibility", "");
				}
			},10);
		}

		this._bLayoutDataChangedByMe = false;

	};

	/*
	 * Applies size of the FormContainers in GridLayout: if only one container is in the last line -> make it full size
	 * adapt all containers because container can be inserted or added later on
	 * @private
	 */
	function _applyContainerSize(){

		this._bLayoutDataChangedByMe = true;
		var oForm = this.getAggregation("form");
		var aContainers = oForm.getFormContainers();
		var iLength = aContainers.length;
		for (var i = 0; i < iLength; i++) {
			var oContainer = aContainers[i];
			if ((this.getMaxContainerCols() <= 1) || ((i == iLength - 1) && (iLength % 2 > 0))) {
				oContainer.getLayoutData().setHalfGrid(false);
			} else if (!oContainer.getLayoutData().getHalfGrid()) {
				oContainer.getLayoutData().setHalfGrid(true);
			}
		}
		this._bLayoutDataChangedByMe = false;
	}

	/*
	 * Handles the resize event
	 * @private
	 */
	SimpleForm.prototype._resize = function(oEvent){

		this._bChangedByMe = true;
		if (this._iCurrentWidth == oEvent.size.width) {
			return;
		}
		this._iCurrentWidth = oEvent.size.width;
		this._applyLinebreaks();
		this._bChangedByMe = false;

	};

	function _removeResize() {

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

	}

	function _markFormElementForUpdate(aFormElements, oFormElement){

		var bFound = false;
		for ( var i = 0; i < aFormElements.length; i++) {
			var oChangedFormElement = aFormElements[i];
			if (oChangedFormElement == oFormElement) {
				bFound = true;
				break;
			}
		}
		if (!bFound) {
			aFormElements.push(oFormElement);
		}

	}

	function _observeChanges(oChanges) {

		if (oChanges.name == "visible") {
			var oFormElement = oChanges.object.getParent();
			oFormElement.invalidate();
		}

	}

	function _getFormContent(oForm) {

		var aElements = [];
		var aFormContainers = oForm.getFormContainers();

		for ( var i = 0; i < aFormContainers.length; i++) {
			var oFormContainer = aFormContainers[i];
			var oTitle = oFormContainer.getTitle();
			if (oTitle) {
				aElements.push(oTitle);
			} else {
				var oToolbar = oFormContainer.getToolbar();
				if (oToolbar) {
					aElements.push(oToolbar);
				}
			}

			var aFormElements = oFormContainer.getFormElements();
			for ( var j = 0; j < aFormElements.length; j++) {
				var oFormElement = aFormElements[j];
				var oLabel = oFormElement.getLabel();
				if (oLabel) {
					aElements.push(oLabel);
				}
				var aFields = oFormElement.getFields();
				for (var k = 0; k < aFields.length; k++) {
					var oField = aFields[k];
					aElements.push(oField);
				}
			}
		}

		return aElements;

	}

	SimpleForm.prototype._formInvalidated = function(oOrigin){

		if (!this._bChangedByMe) {
			// check if content is still the same like in array
			// maybe ca Control was destroyed or removed without using the SimpleForm API
			// as invalidate is fired for every single object only one object can be changed
			var aContent = _getFormContent(this.getAggregation("form"));
			var i = 0;
			var j = 0;
			var bCreateNew = false;

			if (!this._aElements || aContent.length < this._aElements.length) {
				// at least one element must be removed -> create completely new,
				// because for deleted controls it's hard to find out the old parent.
				bCreateNew = true;
			} else {
				for (i = 0; i < aContent.length; i++) {
					var oElement1 = aContent[i];
					var oElement2 = this._aElements[j];
					if (oElement1 === oElement2) {
						j++;
					} else {
						// check if Element1 is new
						var oElementNext = aContent[i + 1];
						if (oElementNext === oElement2) {
							this.insertContent(oElement1, i);
							break;
						}

						// check if Element2 is removed
						oElementNext = this._aElements[j + 1];
						if (oElementNext === oElement1) {
							// difficult to find out old FormElement or FormContainer -> create content completely new.
							bCreateNew = true;
							break;
						}

						break;
					}
				}
			}

			if (bCreateNew) {
				this.removeAllContent();
				for (i = 0; i < aContent.length; i++) {
					var oElement = aContent[i];
					this.addContent(oElement);
				}
			}
		}

	};

	SimpleForm.prototype._onLayoutDataChange = function(oEvent){

		if (!this._bLayoutDataChangedByMe && !this._bIsBeingDestroyed) {
			switch (this.getLayout()) {
			case SimpleFormLayout.ResponsiveLayout:
				var oControl = oEvent.srcControl;
				var oParent = oControl.getParent();
				if (oParent instanceof FormElement) {
					// as linebreak change can change assignment to FormElement remove and insert field
					var iIndex = this.indexOfContent(oControl);
					this.removeContent(oControl);
					this.insertContent(oControl, iIndex);
				}
				break;
				// no default
			}
		}

	};

	function _isLazyInstance(oObj, sModule) {
		var fnClass = sap.ui.require(sModule);
		return oObj && typeof fnClass === 'function' && (oObj instanceof fnClass);
	}

	return SimpleForm;

});
