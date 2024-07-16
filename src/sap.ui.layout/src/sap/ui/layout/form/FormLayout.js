/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.FormLayout.
sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/core/Control',
	'sap/ui/core/Element',
	'sap/ui/layout/library',
	'./FormLayoutRenderer',
	'./FormHelper',
	'sap/ui/core/theming/Parameters',
	'sap/ui/thirdparty/jquery',
	// jQuery custom selectors ":sapFocusable"
	'sap/ui/dom/jquery/Selectors'
], function(Localization, Control, Element, library, FormLayoutRenderer, FormHelper, Parameters, jQuery) {
	"use strict";

	// shortcut for sap.ui.layout.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	/**
	 * Constructor for a new sap.ui.layout.form.FormLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Base layout to render a <code>Form</code>.
	 * Other layouts to render a <code>Form</code> must inherit from this one.
	 *
	 * <b>Note:</b> This control must not be used to render a <code>Form</code> in productive applications as it does not fulfill any
	 * design guidelines and usability standards.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.FormLayout
	 */
	var FormLayout = Control.extend("sap.ui.layout.form.FormLayout", /** @lends sap.ui.layout.form.FormLayout.prototype */ {
		metadata : {

			library : "sap.ui.layout",
			properties : {
				/**
				 * Specifies the background color of the <code>Form</code> content.
				 *
				 * <b>Note:</b> The visualization of the different options depends on the theme used.
				 *
				 * @since 1.36.0
				 */
				backgroundDesign : {type : "sap.ui.layout.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Translucent}
			}
		},

		renderer: FormLayoutRenderer
	});

	/* eslint-disable no-lonely-if */

	FormLayout.prototype.init = function(){

		this._oInitPromise = FormHelper.init();

		this._sFormTitleSize = "H4"; // to have default as Theme parameter could be loaded async.
		this._sFormSubTitleSize = "H5";

	};

	FormLayout.prototype.onBeforeRendering = function( oEvent ){

		// get title sizes from theme
		this.loadTitleSizes();

	};

	FormLayout.prototype.contentOnAfterRendering = function(oFormElement, oControl){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			jQuery(oControl.getFocusDomRef()).data("sap.InNavArea", true);
		}

		if (this.renderControlsForSemanticElement() && oFormElement.isA("sap.ui.layout.form.SemanticFormElement") && !oFormElement._getEditable()) {
			// If in SemanticFormElement in display mode controls are not concatenated but rendered as they are devided by delemitters they need to keep their own size,
			// but must not be larger than the available space.
			oControl.$().css("max-width", "100%");
		} else if (oControl.getWidth && ( !oControl.getWidth() || oControl.getWidth() == "auto" ) &&
				(!oControl.getFormDoNotAdjustWidth || !oControl.getFormDoNotAdjustWidth())) {
			// In the visual designed layouts, the controls should have the size of the Form cells to align
			// -> The width must be set to 100% (if no other width set)
			oControl.$().css("width", "100%");
		}

	};

	FormLayout.prototype.toggleContainerExpanded = function(oContainer){

		var bExpanded = oContainer.getExpanded();
		if (this.getDomRef()) {
			if (bExpanded) {
				//show content
				oContainer.$("content").css("display", "");
			} else {
				//hide content
				oContainer.$("content").css("display", "none");
			}
		}

	};

	/*
	 * gets the layout data of an element (container, control...) for the needed layout data type
	 */
	FormLayout.prototype.getLayoutDataForElement = function(oElement, sType){

		var oLayoutData = oElement.getLayoutData();

		if (!oLayoutData) {
			return undefined;
		} else if (oLayoutData.isA(sType)) {
			return oLayoutData;
		} else if (oLayoutData.isA("sap.ui.core.VariantLayoutData")) {
			// multiple LayoutData available - search here
			var aLayoutData = oLayoutData.getMultipleLayoutData();
			for ( var i = 0; i < aLayoutData.length; i++) {
				var oLayoutData2 = aLayoutData[i];
				if (oLayoutData2.isA(sType)) {
					return oLayoutData2;
				}
			}
		}

	};

	/* Keyboard handling
	 * In the FormLayout just a basic keyboard handling is implemented.
	 * This must be enhanced in the other Layouts if needed.
	 *
	 * The main idea is to navigate via arrow keys from control to control
	 * using Tab only the editable/active controls are reached. So the tab-chain is short
	 * Via F6 the navigation goes to the next container
	 * There is an "edit mode" to allow arrow key navigation inside of controls.
	 * For mobile application the Arrow-key navigation should be disabled
	 */

	FormLayout.prototype.onsapright = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var bRtl = Localization.getRTL();

			if (!bRtl) {
				this.navigateForward(oEvent);
			} else {
				this.navigateBack(oEvent);
			}
		}

	};

	FormLayout.prototype.onsapleft = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var bRtl = Localization.getRTL();

			if (!bRtl) {
				this.navigateBack(oEvent);
			} else {
				this.navigateForward(oEvent);
			}
		}

	};

	FormLayout.prototype.onsapdown = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var oNewDomRef;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			oControl = oRoot.rootControl;
			if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
				oNewDomRef = this.findFieldBelow(oControl, oElement);
			} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
				// current control is not inside an Element - maybe a title or expander?
				oNewDomRef = this.findFirstFieldOfNextElement(oElement, 0);
			}

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsapup = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var iCurrentIndex = 0;
			var oNewDomRef;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			oControl = oRoot.rootControl;
			if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
				oNewDomRef = this.findFieldAbove(oControl, oElement);
			} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
				// current control is not inside an Element - maybe a title or expander?
				var oForm = oElement.getParent();
				iCurrentIndex = oForm.indexOfFormContainer(oElement);
				oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1);
			}

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsaphome = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var iCurrentIndex = 0;
			var oNewDomRef;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			var oContainer = oElement.getParent();
			var oForm = oContainer.getParent();

			iCurrentIndex = oForm.indexOfFormContainer(oContainer);
			// actually it's within the same container
			oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex);

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsaptop = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			var oNewDomRef;
			var oContainer;

			if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
				oContainer = oElement.getParent();
			} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
				// current control is not inside an Element - maybe a title or expander?
				oContainer = oElement;
			}
			var oForm = oContainer.getParent();

			oNewDomRef = this.findFirstFieldOfForm(oForm);

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsapend = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var iCurrentIndex = 0;
			var oNewDomRef;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			var oContainer = oElement.getParent();
			var oForm = oContainer.getParent();

			iCurrentIndex = oForm.indexOfFormContainer(oContainer);
			oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex);

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsapbottom = function(oEvent){

		if (FormHelper.isArrowKeySupported()) { // no async call needed here
			var oControl = oEvent.srcControl;
			var oRoot = this.findElement(oControl);
			var oElement = oRoot.element;
			var oNewDomRef;
			var oContainer;

			if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
				oContainer = oElement.getParent();
			} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
				// current control is not inside an Element - maybe a title or expander?
				oContainer = oElement;
			}
			var oForm = oContainer.getParent();

			var aContainers = oForm.getFormContainers();
			var iLength = aContainers.length;

			oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iLength - 1);

			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault(); // to avoid moving cursor in next field
			}
		}

	};

	FormLayout.prototype.onsapexpand = function(oEvent){

		var oControl = oEvent.srcControl;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		var oContainer;

		if (oElement.isA("sap.ui.layout.form.FormContainer")) {
			oContainer = oElement; // e.g. expand button
		} else {
			oContainer = oElement.getParent();
		}

		if (oContainer.getExpandable() && oControl === oContainer._oExpandButton) {
			// only react on expander, not on input fields or other content
			oContainer.setExpanded(true);
		}
	};

	FormLayout.prototype.onsapcollapse = function(oEvent){

		var oControl = oEvent.srcControl;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		var oContainer;

		if (oElement.isA("sap.ui.layout.form.FormContainer")) {
			oContainer = oElement; // e.g. expand button
		} else {
			oContainer = oElement.getParent();
		}

		if (oContainer.getExpandable() && oControl === oContainer._oExpandButton) {
			// only react on expander, not on input fields or other content
			oContainer.setExpanded(false);
		}
	};

	FormLayout.prototype.onsapskipforward = function(oEvent){

		var oControl = oEvent.srcControl;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;
		var oNewDomRef;
		var oContainer;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			oContainer = oElement.getParent();
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oContainer = oElement;
		}
		var oForm = oContainer.getParent();
		var iCurrentIndex = oForm.indexOfFormContainer(oContainer);

		// goto next container
		oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex + 1);

		if (oNewDomRef) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.onsapskipback = function(oEvent){

		var oControl = oEvent.srcControl;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;
		var oNewDomRef;
		var oContainer;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			oContainer = oElement.getParent();
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oContainer = oElement;
		}
		var oForm = oContainer.getParent();
		var aContainers = oForm.getFormContainers();
		var iCurrentIndex = oForm.indexOfFormContainer(oContainer);

		// goto previous container
		while (!oNewDomRef && iCurrentIndex > 0) {
			var oPrevContainer = aContainers[iCurrentIndex - 1];
			if (!oPrevContainer.getExpandable() || oPrevContainer.getExpanded()) {
				oNewDomRef = this.findFirstFieldOfFirstElementInPrevContainer(oForm, iCurrentIndex - 1);
			}
			iCurrentIndex = iCurrentIndex - 1;
		}

		if (oNewDomRef && oNewDomRef !== oControl.getFocusDomRef()) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.onBeforeFastNavigationFocus = function(oEvent){
		if (this.getDomRef() !== oEvent.source && this.getDomRef().contains(oEvent.source)) {
			oEvent.srcControl = Element.closestTo(oEvent.source);
			if (oEvent.forward) {
				this.onsapskipforward(oEvent);
			} else {
				this.onsapskipback(oEvent);
			}
		} else {
			var oNewDomRef = oEvent.forward ? this.findFirstFieldOfForm(this.getParent()) : this.findFirstFieldOfLastContainerOfForm(this.getParent());
			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault();
			}
		}
	};

	FormLayout.prototype.findElement = function(oControl){
		// since the source control can be part of a child control or layout we have to look in the control tree
		// to find the FormElement where the control is assigned

		var oElement = oControl.getParent();
		var oRootControl = oControl;

		while (oElement && !(oElement.isA("sap.ui.layout.form.FormElement")) &&
				!(oElement.isA("sap.ui.layout.form.FormContainer")) &&
				!(oElement.isA("sap.ui.layout.form.Form"))) {
			oRootControl = oElement;
			oElement = oElement.getParent();
		}

		return ({rootControl: oRootControl, element: oElement});

	};

	FormLayout.prototype.navigateForward = function(oEvent){

		var oControl = oEvent.srcControl;
		var iCurrentIndex = 0;
		var oNewDomRef;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			if (oControl == oElement.getLabelControl()) {
				iCurrentIndex = -1;
			} else {
				iCurrentIndex = oElement.indexOfField(oControl);
			}
			oNewDomRef = this.findNextFieldOfElement(oElement, iCurrentIndex + 1);

			if (!oNewDomRef) {
				// use 1st field of next Element
				var oContainer = oElement.getParent();
				iCurrentIndex = oContainer.indexOfFormElement(oElement);
				oNewDomRef = this.findFirstFieldOfNextElement(oContainer, iCurrentIndex + 1);

				if (!oNewDomRef) {
					// no next element -> look in next container
					var oForm = oContainer.getParent();
					iCurrentIndex = oForm.indexOfFormContainer(oContainer);
					oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex + 1);
				}
			}
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oNewDomRef = this.findFirstFieldOfNextElement(oElement, 0);
		}

		if (oNewDomRef) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.tabForward = function(oEvent){

		var oForm;
		var oControl = oEvent.srcControl;
		var iCurrentIndex = 0;
		var oNewDomRef;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			if (oControl == oElement.getLabelControl()) {
				iCurrentIndex = -1;
			} else {
				iCurrentIndex = oElement.indexOfField(oControl);
			}
			oNewDomRef = this.findNextFieldOfElement(oElement, iCurrentIndex + 1, true);

			if (!oNewDomRef) {
				// use 1st field of next Element
				var oContainer = oElement.getParent();
				iCurrentIndex = oContainer.indexOfFormElement(oElement);
				oNewDomRef = this.findFirstFieldOfNextElement(oContainer, iCurrentIndex + 1, true);

				if (!oNewDomRef) {
					// no next element -> look in next container
					oForm = oContainer.getParent();
					iCurrentIndex = oForm.indexOfFormContainer(oContainer);
					oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex + 1, true);
				}
			}
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oNewDomRef = this.findFirstFieldOfNextElement(oElement, 0, true);
			if (!oNewDomRef) {
				// no next element -> look in next container
				oForm = oElement.getParent();
				iCurrentIndex = oForm.indexOfFormContainer(oElement);
				oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex + 1, true);
			}
		}

		if (oNewDomRef) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.findNextFieldOfElement = function(oElement, iStartIndex, bTabOver){

		var aFields = oElement.getFieldsForRendering();
		var iLength = aFields.length;
		var oNewDomRef;

		for ( var i = iStartIndex; i < iLength; i++) {
			// find the next enabled control thats rendered
			var oField = aFields[i];
			var oDomRef = this._getDomRef(oField);
			if (bTabOver == true) {
				if ((!oField.getEditable || oField.getEditable()) && (!oField.getEnabled || oField.getEnabled()) && oDomRef) {
					oNewDomRef = oDomRef;
					break;
				}
			} else {
				if ((!oField.getEnabled || oField.getEnabled()) && oDomRef) {
					oNewDomRef = oDomRef;
					break;
				}
			}
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findFirstFieldOfNextElement = function(oContainer, iStartIndex, bTabOver){

		var aElements = oContainer.getFormElements();
		var iLength = aElements.length;
		var oNewDomRef;
		var i = iStartIndex;

		while (!oNewDomRef && i < iLength) {
			var oElement = aElements[i];
			if (bTabOver == true) {
				oNewDomRef = this.findNextFieldOfElement(oElement, 0, true);
			} else {
				oNewDomRef = this.findNextFieldOfElement(oElement, 0);
			}
			i++;
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findFirstFieldOfForm = function(oForm){

		var oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, 0);
		return oNewDomRef;

	};

	FormLayout.prototype.findFirstFieldOfLastContainerOfForm = function(oForm){
		var oNewDomRef;
		var aContainers = oForm.getFormContainers();
		var iCurrentIndex = aContainers.length;
		// goto previous container
		while (!oNewDomRef && iCurrentIndex > 0) {
			var oPrevContainer = aContainers[iCurrentIndex - 1];
			if (!oPrevContainer.getExpandable() || oPrevContainer.getExpanded()) {
				oNewDomRef = this.findFirstFieldOfFirstElementInPrevContainer(oForm, iCurrentIndex - 1);
			}
			iCurrentIndex = iCurrentIndex - 1;
		}
		return oNewDomRef;
	};

	FormLayout.prototype.findFirstFieldOfFirstElementInNextContainer = function(oForm, iStartIndex, bTabOver){

		var aContainers = oForm.getFormContainers();
		var iLength = aContainers.length;
		var oNewDomRef;
		var i = iStartIndex;

		while (!oNewDomRef && i < iLength) {
			var oContainer = aContainers[i];
			if (oContainer.getExpandable() && bTabOver) {
				oNewDomRef = oContainer._oExpandButton.getFocusDomRef();
				if (oNewDomRef) {
					break;
				}
			}
			if (!oContainer.getExpandable() || oContainer.getExpanded()) {
				if (bTabOver == true) {
					oNewDomRef = this.findFirstFieldOfNextElement(oContainer, 0, true);
				} else {
					oNewDomRef = this.findFirstFieldOfNextElement(oContainer, 0);
				}
			}
			i++;
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findFirstFieldOfFirstElementInPrevContainer = function(oForm, iStartIndex){

		var aContainers = oForm.getFormContainers();
		var iLength = aContainers.length;
		var oNewDomRef;
		var i = iStartIndex;

		while (!oNewDomRef && i < iLength && i >= 0) {
			var oContainer = aContainers[i];
			if (!oContainer.getExpandable() || oContainer.getExpanded()) {
				oNewDomRef = this.findFirstFieldOfNextElement(oContainer, 0);
			}
			i++;
		}

		return oNewDomRef;

	};

	FormLayout.prototype.navigateBack = function(oEvent){

		var oForm;
		var oControl = oEvent.srcControl;
		var iCurrentIndex = 0;
		var oNewDomRef;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			if (oControl == oElement.getLabelControl()) {
				iCurrentIndex = 0;
			} else {
				iCurrentIndex = oElement.indexOfField(oControl);
			}
			oNewDomRef = this.findPrevFieldOfElement(oElement, iCurrentIndex - 1);

			if (!oNewDomRef) {
				// use 1st field of next Element
				var oContainer = oElement.getParent();
				iCurrentIndex = oContainer.indexOfFormElement(oElement);
				oNewDomRef = this.findLastFieldOfPrevElement(oContainer, iCurrentIndex - 1);

				if (!oNewDomRef) {
					// no next element -> look in next container
					oForm = oContainer.getParent();
					iCurrentIndex = oForm.indexOfFormContainer(oContainer);
					oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1);
				}
			}
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oForm = oElement.getParent();
			iCurrentIndex = oForm.indexOfFormContainer(oElement);
			oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1);
		}

		if (oNewDomRef) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.tabBack = function(oEvent){

		var oForm;
		var oControl = oEvent.srcControl;
		var iCurrentIndex = 0;
		var oNewDomRef;
		var oRoot = this.findElement(oControl);
		var oElement = oRoot.element;
		oControl = oRoot.rootControl;

		if (oElement && oElement.isA("sap.ui.layout.form.FormElement")) {
			if (oControl == oElement.getLabelControl()) {
				iCurrentIndex = 0;
			} else {
				iCurrentIndex = oElement.indexOfField(oControl);
			}
			oNewDomRef = this.findPrevFieldOfElement(oElement, iCurrentIndex - 1, true);

			if (!oNewDomRef) {
				// use 1st field of next Element
				var oContainer = oElement.getParent();
				iCurrentIndex = oContainer.indexOfFormElement(oElement);
				oNewDomRef = this.findLastFieldOfPrevElement(oContainer, iCurrentIndex - 1, true);

				if (!oNewDomRef) {
					// no next element -> look in next container
					oForm = oContainer.getParent();
					iCurrentIndex = oForm.indexOfFormContainer(oContainer);
					if (oContainer.getExpandable()) {
						oNewDomRef = oContainer._oExpandButton.getFocusDomRef();
					}
					if (!oNewDomRef) {
						oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1, true);
					}
				}
			}
		} else if (oElement && oElement.isA("sap.ui.layout.form.FormContainer")) {
			// current control is not inside an Element - maybe a title or expander?
			oForm = oElement.getParent();
			iCurrentIndex = oForm.indexOfFormContainer(oElement);
			oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1, true);
		}

		if (oNewDomRef) {
			oNewDomRef.focus();
			oEvent.preventDefault(); // to avoid moving cursor in next field
		}

	};

	FormLayout.prototype.findPrevFieldOfElement = function(oElement, iStartIndex, bTabOver){

		var aFields = oElement.getFieldsForRendering();
		var oNewDomRef;

		for ( var i = iStartIndex; i >= 0; i--) {
			// find the next enabled control thats rendered
			var oField = aFields[i];
			var oDomRef = this._getDomRef(oField);
			if (bTabOver == true) {
				if ((!oField.getEditable || oField.getEditable()) && (!oField.getEnabled || oField.getEnabled()) && oDomRef) {
					oNewDomRef = oDomRef;
					break;
				}
			} else {
				if ((!oField.getEnabled || oField.getEnabled()) && oDomRef) {
					oNewDomRef = oDomRef;
					break;
				}
			}
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findLastFieldOfPrevElement = function(oContainer, iStartIndex, bTabOver){

		var aElements = oContainer.getFormElements();
		var oNewDomRef;
		var i = iStartIndex;

		while (!oNewDomRef && i >= 0) {
			var oElement = aElements[i];
			var iLength = oElement.getFieldsForRendering().length;

			if (bTabOver == true) {
				oNewDomRef = this.findPrevFieldOfElement(oElement, iLength - 1, true);
			} else {
				oNewDomRef = this.findPrevFieldOfElement(oElement, iLength - 1);
			}
			i--;
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findLastFieldOfLastElementInPrevContainer = function(oForm, iStartIndex, bTabOver){

		var aContainers = oForm.getFormContainers();
		var oNewDomRef;
		var i = iStartIndex;

		while (!oNewDomRef && i >= 0) {
			var oContainer = aContainers[i];
			if (oContainer.getExpandable() && !oContainer.getExpanded() && bTabOver) {
				oNewDomRef = oContainer._oExpandButton.getFocusDomRef();
				if (oNewDomRef) {
					break;
				}
			}
			if (!oContainer.getExpandable() || oContainer.getExpanded()) {
				var iLength = oContainer.getFormElements().length;
				if (bTabOver == true) {
					oNewDomRef = this.findLastFieldOfPrevElement(oContainer, iLength - 1, true);
				} else {
					oNewDomRef = this.findLastFieldOfPrevElement(oContainer, iLength - 1, 0);
				}
			}
			i--;
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findFieldBelow = function(oControl, oElement){

		var oContainer = oElement.getParent();
		var iCurrentIndex = oContainer.indexOfFormElement(oElement);
		var oNewDomRef = this.findFirstFieldOfNextElement(oContainer, iCurrentIndex + 1);

		if (!oNewDomRef) {
			// no next element -> look in next container
			var oForm = oContainer.getParent();
			iCurrentIndex = oForm.indexOfFormContainer(oContainer);
			oNewDomRef = this.findFirstFieldOfFirstElementInNextContainer(oForm, iCurrentIndex + 1);
		}

		return oNewDomRef;

	};

	FormLayout.prototype.findFieldAbove = function(oControl, oElement){

		var oContainer = oElement.getParent();
		var iCurrentIndex = oContainer.indexOfFormElement(oElement);

		var aElements = oContainer.getFormElements();
		var oNewDomRef;
		var i = iCurrentIndex - 1;

		while (!oNewDomRef && i >= 0) {
			var oMyElement = aElements[i];
			oNewDomRef = this.findPrevFieldOfElement(oMyElement, 0);
			i--;
		}

		if (!oNewDomRef) {
			// no next element -> look in previous container
			var oForm = oContainer.getParent();
			iCurrentIndex = oForm.indexOfFormContainer(oContainer);
			oNewDomRef = this.findLastFieldOfLastElementInPrevContainer(oForm, iCurrentIndex - 1);
		}

		return oNewDomRef;

	};

	FormLayout.prototype._getDomRef = function( oControl ){

		// get focusDOMRef of the control, but only if it's focusable
		var oDomRef = oControl.getFocusDomRef();
		if (!jQuery(oDomRef).is(":sapFocusable")) {
			oDomRef = undefined;
		}

		return oDomRef;

	};

	/**
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * In this basic <code>FormLayout</code> each <code>FormContainer</code> has its own DOM.
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
	 * @return {Element|null} The Element's DOM representation or null
	 * @private
	 */
	FormLayout.prototype.getContainerRenderedDomRef = function(oContainer) {

		if (this.getDomRef()) {
			return oContainer.getDomRef();
		} else  {
			return null;
		}

	};

	/**
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * In this basic <code>FormLayout</code> each <code>FormElement</code> has its own DOM.
	 * @param {sap.ui.layout.form.FormElement} oElement <code>FormElement</code>
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	FormLayout.prototype.getElementRenderedDomRef = function(oElement) {

		if (this.getDomRef()) {
			return oElement.getDomRef();
		} else  {
			return null;
		}

	};

	/**
	 * In {@link sap.ui.layout.SemanticFormElement SemanticFormElement}, delimiters are rendered.
	 * They should use only a small space. So <code>Layout</code>-dependent <code>LayoutData</code>
	 * are needed.
	 *
	 * This function needs to be implemented by the specific <code>Layout</code>.
	 *
	 * @return {sap.ui.core.LayoutData | Promise} LayoutData or promise retuning LayoutData
	 * @protected
	 * @since: 1.86.0
	 */
	FormLayout.prototype.getLayoutDataForDelimiter = function() {
	};

	/**
	 * In {@link sap.ui.layout.SemanticFormElement SemanticFormElement}, delimiters are rendered.
	 * The fields should be rendered per default in a way, the field and the corresponding delimiter filling one row in
	 * phone mode. In desktop mode they should all be in one row.
	 *
	 * This function needs to be implemented by the specific <code>Layout</code>.
	 *
	 * @param {int} iFields Number of field in the <code>SemanticFormElement</code>
	 * @param {int} iIndex Index of field in the <code>SemanticFormElement</code>
	 * @param {sap.ui.core.LayoutData} [oLayoutData] existing <code>LayoutData</code> that might be just changed
	 * @return {sap.ui.core.LayoutData | Promise} LayoutData or promise retuning LayoutData
	 * @protected
	 * @since: 1.86.0
	 */
	FormLayout.prototype.getLayoutDataForSemanticField = function(iFields, iIndex, oLayoutData) {
	};

	/**
	 * For {@link sap.ui.layout.SemanticFormElement SemanticFormElement}, all text-based controls should be concatenated in display mode.
	 * If the <code>Layout</code> supports rendering of single controls, they are rendered divided by delimiters.
	 * If the <code>Layout</code> doesn't support this, one concatenated text is rendered. Here only text is supported, no links or other special rendering.
	 *
	 * This function needs to be implemented by the specific <code>Layout</code>.
	 *
	 * @return {boolean} <code>true</code> if layout allows to render single controls for {@link sap.ui.layout.SemanticFormElement SemanticFormElement}
	 * @protected
	 * @since: 1.117.0
	 */
	FormLayout.prototype.renderControlsForSemanticElement = function() {

		return false;

	};

	/**
	 * Determines the sizes for <code>Form</code> and <code>FormContainer</code> from the theme
	 *
	 * @private
	 * @since: 1.92.0
	 */
	FormLayout.prototype.loadTitleSizes = function() {

		// read theme parameters to get current header sizes
		var oSizes = Parameters.get({
			name: ['sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize', 'sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize'],
			callback: this.applyTitleSizes.bind(this)
		});
		if (oSizes && oSizes.hasOwnProperty('sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize')) { // sync case
			this.applyTitleSizes(oSizes, true);
		}

	};

	/**
	 * Applies the sizes for <code>Form</code> and <code>FormContainer</code> from the theme
	 *
	 * @param {object} oSizes Sizes from theme parameters
	 * @param {boolean} bSync If set, the paramters are determines synchronously. (No re-rendering needed.)
	 * @private
	 * @since: 1.92.0
	 */
	FormLayout.prototype.applyTitleSizes = function(oSizes, bSync) {

		if (oSizes && (this._sFormTitleSize !== oSizes["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize"] ||
				this._sFormSubTitleSize !== oSizes["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize"])) {
			this._sFormTitleSize = oSizes["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize"];
			this._sFormSubTitleSize = oSizes["sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize"];

			if (!bSync) {
				this.invalidate(); // re-render
			}
		}

	};

	/**
	 * Checks if the <code>Form</code> contains <code>FormContainers</code> that have a <code>Title</code>, <code>Toolbar</code> or <code>AriaLabelledBy</code>.
	 *
	 * This is used to determine the role for screenreader support
	 *
	 * @param {sap.ui.layout.form.Form} oForm Form
	 * @return {boolean} <code>true</code> if there is a container with own label
	 * @private
	 * @since: 1.126.0
	 */
	FormLayout.prototype.hasLabelledContainers = function(oForm) {

		const aContainers = oForm.getFormContainers();
		let bResult = false;

		for (let i = 0; i < aContainers.length; i++) {
			if (this.isContainerLabelled(aContainers[i])) {
				bResult = true;
				break;
			}
		}

		return bResult;

	};

	/**
	 * Checks if the <code>FormContainer</code> has a <code>Title</code>, <code>Toolbar</code> or <code>AriaLabelledBy</code>.
	 *
	 * This is used to determine the role for screenreader support
	 *
	 * @param {sap.ui.layout.form.FormContainer} oContainer FormContainer
	 * @return {boolean} <code>true</code> if the  <code>FormContainer</code> is labelled
	 * @private
	 * @since: 1.126.0
	 */
	FormLayout.prototype.isContainerLabelled = function(oContainer) {

		return !!oContainer.getTitle() || !!oContainer.getToolbar() || oContainer.getAriaLabelledBy().length > 0 || oContainer.getExpandable();

	};

	return FormLayout;

});