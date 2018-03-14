/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.uxap.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Core",
	"sap/ui/base/DataType",
	"sap/ui/Device",
	"sap/m/library",
	"sap/ui/layout/library"
], function(
	jQuery,
	Core,
	DataType,
	Device
) {
	"use strict";

	/**
	 * SAP UxAP
	 *
	 * @namespace
	 * @name sap.uxap
	 * @public
	 */
		// library dependencies
		// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name: "sap.uxap",
		dependencies: ["sap.ui.core", "sap.m", "sap.ui.layout"],
		designtime: "sap/uxap/designtime/library.designtime",
		types: [
			"sap.uxap.BlockBaseColumnLayout",
			"sap.uxap.ObjectPageConfigurationMode",
			"sap.uxap.ObjectPageHeaderDesign",
			"sap.uxap.ObjectPageHeaderPictureShape",
			"sap.uxap.ObjectPageSubSectionLayout",
			"sap.uxap.ObjectPageSubSectionMode"
		],
		interfaces: [
			"sap.uxap.IHeaderTitle",
			"sap.uxap.IHeaderContent"
		],
		controls: [
			"sap.uxap.AnchorBar",
			"sap.uxap.BlockBase",
			"sap.uxap.BreadCrumbs",
			"sap.uxap.HierarchicalSelect",
			"sap.uxap.ObjectPageHeader",
			"sap.uxap.ObjectPageDynamicHeaderTitle",
			"sap.uxap.ObjectPageDynamicHeaderContent",
			"sap.uxap.ObjectPageHeaderActionButton",
			"sap.uxap.ObjectPageHeaderContent",
			"sap.uxap.ObjectPageLayout",
			"sap.uxap.ObjectPageSection",
			"sap.uxap.ObjectPageSectionBase",
			"sap.uxap.ObjectPageSubSection"
		],
		elements: [
			"sap.uxap.ModelMapping",
			"sap.uxap.ObjectPageHeaderLayoutData"
		],
		version: "${version}",
		extensions: {
			flChangeHandlers: {
				"sap.uxap.ObjectPageHeader": "sap/uxap/flexibility/ObjectPageHeader",
				"sap.uxap.ObjectPageLayout": "sap/uxap/flexibility/ObjectPageLayout",
				"sap.uxap.ObjectPageSection": "sap/uxap/flexibility/ObjectPageSection",
				"sap.uxap.ObjectPageSubSection": "sap/uxap/flexibility/ObjectPageSubSection",
				"sap.uxap.ObjectPageDynamicHeaderTitle": "sap/uxap/flexibility/ObjectPageDynamicHeaderTitle",
				"sap.ui.core._StashedControl": {
					"unstashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true
			}
		}
	});

	/**
	 * @class Used by the <code>BlockBase</code> control to define how many columns should it be assigned by the <code>objectPageSubSection</code>.
	 *     The allowed values can be auto (subsection assigned a number of columns based on the parent objectPageLayout subsectionLayout property), 1, 2 or 3
	 *     (This may not be a valid value for some <code>subSectionLayout</code>, for example, asking for 3 columns in a 2 column layout would raise warnings).
	 *
	 * @static
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.BlockBaseColumnLayout = DataType.createType('sap.uxap.BlockBaseColumnLayout', {
			isValid: function (vValue) {
				return /^(auto|[1-4]{1})$/.test(vValue);
			}

		},
		DataType.getType('string')
	);

	/**
	 * Used by the <code>BlockBase</code> control to define if it should do automatic adjustment of its nested forms.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @static
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.BlockBaseFormAdjustment = {

		/**
		 * Any form within the block will be automatically adjusted to have as many columns as the colspan of its parent block.
		 * @public
		 */
		BlockColumns: "BlockColumns",
		/**
		 * Any form within the block will be automatically adjusted to have only one column.
		 * @public
		 */
		OneColumn: "OneColumn",
		/**
		 * No automatic adjustment of forms.
		 * @public
		 */
		None: "None"
	};

	/**
	 * Used by the <code>sap.uxap.component.Component</code> how to initialize the <code>ObjectPageLayout</code> sections and subsections.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageConfigurationMode = {

		/**
		 * Determines the JSON URL.
		 * @public
		 */
		JsonURL: "JsonURL",

		/**
		 * Determines the JSON model.
		 * @public
		 */
		JsonModel: "JsonModel"

	};
	/**
	 * Used by the <code>ObjectPageHeader</code> control to define which design to use.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageHeaderDesign = {

		/**
		 * Light theme for the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Light: "Light",

		/**
		 * Dark theme for the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Dark: "Dark"

	};
	/**
	 * Used by the <code>ObjectPageHeader</code> control to define which shape to use for the image.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageHeaderPictureShape = {

		/**
		 * Circle shape for the images in the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape for the images in the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Square: "Square"

	};
	/**
	 * Used by the <code>ObjectPagSubSection</code> control to define which layout to apply.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageSubSectionLayout = {

		/**
		 * Title and actions on top of the block area.
		 * @public
		 */
		TitleOnTop: "TitleOnTop",

		/**
		 * Title and actions on the left, inside the block area.
		 * @public
		 */
		TitleOnLeft: "TitleOnLeft"

	};
	/**
	 * Used by the <code>ObjectPageLayout</code> control to define which layout to use (either Collapsed or Expanded).
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageSubSectionMode = {

		/**
		 * Collapsed mode of display of the <code>ObjectPageLayout</code>.
		 * @public
		 */
		Collapsed: "Collapsed",

		/**
		 * Expanded mode of displaying the <code>ObjectPageLayout</code>.
		 * @public
		 */
		Expanded: "Expanded"

	};

	/**
	 * Used by the <code>ObjectSectionBase</code> control to define the importance of the content contained in it.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.32.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.Importance = {

		/**
		 * Low importance of the content.
		 * @public
		 */
		Low: "Low",

		/**
		 * Medium importance of the content.
		 * @public
		 */
		Medium: "Medium",

		/**
		 * High importance of the content.
		 * @public
		 */
		High: "High"
	};

	sap.uxap.i18nModel = (function () {
		return new sap.ui.model.resource.ResourceModel({
			bundleUrl: jQuery.sap.getModulePath("sap.uxap.i18n.i18n", ".properties")
		});
	}());

	/**
	 *
	 * @type {{getClosestOPL: Function}}
	 */
	sap.uxap.Utilities = {

		/**
		 * Returns the reference to the <code>ObjectPageLayout</code> for a given control.
		 * @static
		 * @param {sap.ui.core.Control} oControl - the control to find ObjectPageLayout for
		 * @private
		 * @returns {*} Object Page layout referance
		 */
		getClosestOPL: function (oControl) {

			while (oControl && !(oControl instanceof sap.uxap.ObjectPageLayout)) {
				oControl = oControl.getParent();
			}

			return oControl;
		},
		isPhoneScenario: function (oRange) {
			if (Device.system.phone) {
				return true;
			}

			return sap.uxap.Utilities._isCurrentMediaSize("Phone", oRange);
		},
		isTabletScenario: function (oRange) {
			return sap.uxap.Utilities._isCurrentMediaSize("Tablet", oRange);
		},
		_isCurrentMediaSize: function (sMedia, oRange) {
			return oRange && oRange.name === sMedia;
		}
	};

	/**
	 *
	 * Interface for controls that are eligible for the <code>headerTitle</code> aggregation
	 * of the <code>{@link sap.uxap.ObjectPageLayout}</code>.
	 *
	 * Controls that implement this interface:
	 * <ul>
	 * <li><code>{@link sap.uxap.ObjectPageHeader}</code> - <code>ObjectPageLayout</code>'s classic header</code></li>
	 * <li><code>{@link sap.uxap.ObjectPageDynamicHeaderTitle}</code> - <code>ObjectPageLayout</code>'s dynamic header</code></li>
	 * </ul>
	 *
	 * For more information on the types of header available for the <code>{@link sap.uxap.ObjectPageLayout ObjectPageLayout}</code>,
	 * see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}.
	 *
	 * For details regarding the differences and similarities between the available headers,
	 * see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}.
	 *
	 * @since 1.52
	 * @name sap.uxap.IHeaderTitle
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 */

	/**
	 *
	 * Interface for controls that are eligible for the <code>headerContent</code> aggregation
	 * of the <code>{@link sap.uxap.ObjectPageLayout}</code>.
	 *
	 * Controls that implement this interface:
	 * <ul>
	 * <li><code>{@link sap.uxap.ObjectPageHeaderContent}</code> - <code>ObjectPageLayout</code>'s classic header content</code></li>
	 * <li><code>{@link sap.uxap.ObjectPageDynamicHeaderContent}</code> - <code>ObjectPageLayout</code>'s dynamic header content</code></li>
	 * </ul>
	 *
	 * For more information on the types of header available for the <code>{@link sap.uxap.ObjectPageLayout ObjectPageLayout}</code>,
	 * see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}.
	 *
	 * For details regarding the differences and similarities between the available headers,
	 * see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}.
	 *
	 * @since 1.52
	 * @name sap.uxap.IHeaderContent
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 */

	return sap.uxap;

});
