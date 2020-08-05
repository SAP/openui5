/*!
 * ${copyright}
 */

// Provides control sap.m.Label
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/LabelEnablement',
	'sap/m/HyphenationSupport',
	'sap/ui/core/library',
	'./LabelRenderer'
],
function(
	library,
	Control,
	LabelEnablement,
	HyphenationSupport,
	coreLibrary,
	LabelRenderer
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = library.LabelDesign;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new Label.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides a textual label for other controls.
	 *
	 * <h3>Overview</h3>
	 * Labels are used as titles for single controls or groups of controls.
	 * Labels for required fields are marked with an asterisk.
	 *
	 * Label appearance can be influenced by properties, such as <code>textAlign</code>,
	 * <code>design</code>, <code>displayOnly</code>, <code>wrapping</code> and
	 * <code>wrappingType</code>.
	 *
	 * As of version 1.50, the default value of the <code>wrapping</code> property is set
	 * to <code>false</code>.
	 *
	 * As of version 1.60, you can hyphenate the label's text with the use of the
	 * <code>wrappingType</code> property. For more information, see
	 * {@link topic:6322164936f047de941ec522b95d7b70 Text Controls Hyphenation}.
	 *
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>It's recommended to use the <code>Label</code> in Form controls.</li>
	 * <li>Use title case for labels.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li> It is not recommended to use labels in Bold.</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.Label, sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Label
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/label/ Label}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Label = Control.extend("sap.m.Label", /** @lends sap.m.Label.prototype */ { metadata : {

		interfaces : [
			"sap.ui.core.Label",
			"sap.ui.core.IShrinkable",
			"sap.m.IOverflowToolbarContent",
			"sap.m.IHyphenation"
		],
		library : "sap.m",
		properties : {

			/**
			 * Sets the design of a Label to either Standard or Bold.
			 */
			design : {type : "sap.m.LabelDesign", group : "Appearance", defaultValue : LabelDesign.Standard},

			/**
			 * Determines the Label text to be displayed.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin},

			/**
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Determines the width of the label.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * Indicates that user input is required for input control labeled by the sap.m.Label.
			 * When the property is set to true and associated input field is empty an asterisk character is added to the label text.
			 */
			required : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Determines if the label is in displayOnly mode.
			 *
			 * <b>Note:</b> This property should be used only in Form controls in preview mode.
			 *
			 * @since 1.50.0
			 */
			displayOnly : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines the wrapping of the text within the <code>Label</code>.
			 * If set to true the <code>Label</code> will wrap, when set to false the <code>Label</code> will be truncated and replaced with ellipsis which is the default behavior.
			 *
			 * @since 1.50
			 */
			wrapping: {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the type of text wrapping to be used (hyphenated or normal).
			 *
			 * <b>Note:</b> This property takes effect only when the <code>wrapping</code>
			 * property is set to <code>true</code>.
			 *
			 * @since 1.60
			 */
			wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal},

			/**
			 * Specifies the vertical alignment of the <code>Label</code> related to the tallest and lowest element on the line.
			 * @since 1.54
			 */
			vAlign : {type : "sap.ui.core.VerticalAlign", group : "Appearance", defaultValue : VerticalAlign.Inherit}
		},
		associations : {

			/**
			 * Association to the labeled control.
			 * By default the label set the for attribute to the ID of the labeled control. This can be changed by implementing the function getIdForLabel on the labelled control.
			 */
			labelFor : {type : "sap.ui.core.Control", multiple : false}
		},
		designtime: "sap/m/designtime/Label.designtime"
	}});

	/**
	 * Provides the current accessibility state of the control.
	 * @see {@link sap.ui.core.Control#getAccessibilityInfo}.
	 *
	 * @protected
	 *
	 * @returns {object} AccessibilityInfo of the <code>sap.m.Label</code>
	 */
	Label.prototype.getAccessibilityInfo = function() {
		return {description: this.getText()};
	};

	/**
	 * Enables the <code>sap.m.Label</code> to move inside the sap.m.OverflowToolbar.
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 *
	 * @public
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	Label.prototype.getOverflowToolbarConfig = function() {
		var oConfig = {
			canOverflow: true,
			propsUnrelatedToSize: ["design", "required", "displayOnly"]
		};

		function getOwnGroup(oControl) {
			var oLayoutData = oControl && oControl.getLayoutData();

			if (isInstanceOf(oLayoutData, "sap/m/OverflowToolbarLayoutData")) {
				return oLayoutData.getGroup();
			}
		}

		oConfig.onBeforeEnterOverflow = function(oLabel) {
			var bIsLabelFor = false,
				oToolbar,
				sLabelledControlId,
				oLabelledControl,
				sLabelGroupId,
				sLabelledControlGroupId;

			oToolbar = oLabel.getParent();
			if (!isInstanceOf(oToolbar, "sap/m/OverflowToolbar")) {
				return;
			}

			// check that the label is for a control from the same toolbar
			sLabelledControlId = oLabel.getLabelFor();
			oLabelledControl = sLabelledControlId && sap.ui.getCore().byId(sLabelledControlId);
			if (!oLabelledControl || (oToolbar.indexOfContent(oLabelledControl) < 0)) {
				return;
			}

			// check that the label and the labeled control are grouped in the toolbar
			sLabelGroupId = getOwnGroup(oLabel);
			sLabelledControlGroupId = getOwnGroup(oLabelledControl);
			bIsLabelFor = sLabelGroupId && (sLabelGroupId === sLabelledControlGroupId);

			oLabel.toggleStyleClass("sapMLabelMediumMarginTop", bIsLabelFor, true /* suppress invalidate */);
		};

		oConfig.onAfterExitOverflow = function(oLabel) {
			oLabel.toggleStyleClass("sapMLabelMediumMarginTop", false, true /* suppress invalidate */);
		};

		return oConfig;
	};

	/**
	 * Gets a map of texts which should be hyphenated.
	 *
	 * @private
	 * @returns {Object<string,string>} The texts to be hyphenated.
	 */
	Label.prototype.getTextsToBeHyphenated = function () {
		return {
			"main": this.getText()
		};
	};

	/**
	 * Gets the DOM refs where the hyphenated texts should be placed.
	 *
	 * @private
	 * @returns {map|null} The elements in which the hyphenated texts should be placed
	 */
	Label.prototype.getDomRefsForHyphenatedTexts = function () {
		return {
			"main": this.$("bdi")[0]
		};
	};

	// enrich Label functionality
	LabelEnablement.enrich(Label.prototype);
	HyphenationSupport.mixInto(Label.prototype);

	// utility function to check if an object is an instance of a class
	// without forcing the loading of the module that defines the class
	function isInstanceOf (oObject, sModule) {
		if (oObject && sModule) {
			var fnClass = sap.ui.require(sModule); // will return the fnClass only if the module is already loaded
			return (typeof fnClass === 'function')  && (oObject instanceof fnClass);
		}
	}

	return Label;

});