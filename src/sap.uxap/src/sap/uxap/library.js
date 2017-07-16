/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.uxap.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/core/Core", "sap/ui/core/library", "sap/m/library", "sap/ui/layout/library"], function (jQuery, Core, library) {
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
		types: [
			"sap.uxap.BlockBaseColumnLayout",
			"sap.uxap.ObjectPageConfigurationMode",
			"sap.uxap.ObjectPageHeaderDesign",
			"sap.uxap.ObjectPageHeaderPictureShape",
			"sap.uxap.ObjectPageSubSectionLayout",
			"sap.uxap.ObjectPageSubSectionMode"
		],
		interfaces: [],
		controls: [
			"sap.uxap.AnchorBar",
			"sap.uxap.BlockBase",
			"sap.uxap.BreadCrumbs",
			"sap.uxap.HierarchicalSelect",
			"sap.uxap.ObjectPageHeader",
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
				"sap.uxap.ObjectPageLayout": {
					"moveControls": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				},
				"sap.uxap.ObjectPageSection": {
					"hideControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					},
					"unhideControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					},
					"stashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					},
					"unstashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				},
				"sap.ui.core._StashedControl" : {
					"unstashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				}
			}
		}
	});

	/**
	 * @class Used by the BlockBase control to define how many columns should it be assigned by the objectPageSubSection.
	 *     The allowed values can be auto (subsection assigned a number of columns based on the parent objectPageLayout subsectionLayout property), 1, 2 or 3
	 *     (This may not be a valid value for some subSectionLayout, for example asking for 3 columns in a 2 column layout would raise warnings).
	 *
	 * @static
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.BlockBaseColumnLayout = sap.ui.base.DataType.createType('sap.uxap.BlockBaseColumnLayout', {
			isValid: function (vValue) {
				return /^(auto|[1-4]{1})$/.test(vValue);
			}

		},
		sap.ui.base.DataType.getType('string')
	);

	/**
	 * Used by the BlockBase control to define if it should do automatic adjustment of its nested forms.
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
	 * Used by the sap.uxap.component.Component how to initialize the ObjectPageLayout sections and subsections.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageConfigurationMode = {

		/**
		 * Determines the JSON url
		 * @public
		 */
		JsonURL: "JsonURL",

		/**
		 * Determines the JSON model
		 * @public
		 */
		JsonModel: "JsonModel"

	};
	/**
	 * Used by the ObjectPageHeader control to define which design to use.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageHeaderDesign = {

		/**
		 * Light theme for the ObjectPageHeader.
		 * @public
		 */
		Light: "Light",

		/**
		 * Dark theme for the ObjectPageHeader.
		 * @public
		 */
		Dark: "Dark"

	};
	/**
	 * Used by the ObjectPageHeader control to define which shape to use for the image.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageHeaderPictureShape = {

		/**
		 * Circle shape for the images in the ObjectPageHeader.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape for the images in the ObjectPageHeader.
		 * @public
		 */
		Square: "Square"

	};
	/**
	 * Used by the ObjectPagSubSection control to define which layout to apply.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageSubSectionLayout = {

		/**
		 * TitleOnTop: title and actions on top of the block area.
		 * @public
		 */
		TitleOnTop: "TitleOnTop",

		/**
		 * TitleOnLeft: title and actions on the left, inside the block area.
		 * @public
		 */
		TitleOnLeft: "TitleOnLeft"

	};
	/**
	 * Used by the ObjectPageLayout control to define which layout to use (either Collapsed or Expanded).
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.ObjectPageSubSectionMode = {

		/**
		 * Collapsed mode of display of the ObjectPageLayout.
		 * @public
		 */
		Collapsed: "Collapsed",

		/**
		 * Expanded mode of displaying the ObjectPageLayout.
		 * @public
		 */
		Expanded: "Expanded"

	};

	/**
	 * Used by the ObjectSectionBase control to define the importance of the content contained in it.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.32.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.uxap.Importance = {

		/**
		 * Low importance of the content
		 * @public
		 */
		Low: "Low",

		/**
		 * Medium importance of the content
		 * @public
		 */
		Medium: "Medium",

		/**
		 * High importance of the content
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
		 * Returns the reference to the ObjectPageLayout for a given control
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
			if (sap.ui.Device.system.phone) {
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

	return sap.uxap;

}, /* bExport= */ true);
