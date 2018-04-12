/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/tnt/BoxContainerList",
	"./BoxContainerRenderer"
], function (jQuery, Control, BoxContainerList, BoxContainerRenderer) {
	"use strict";

	/**
	 * Constructor for a new BoxContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The BoxContainer is a responsive container for Boxes.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.56
	 * @alias sap.tnt.BoxContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BoxContainer = Control.extend("sap.tnt.BoxContainer", { metadata: {
		library: "sap.tnt",
		properties: {

			/**
			 * Defines the width of each Box
			 */
			boxWidth: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Defines the width of the BoxContainer
			 */
			width: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * Defines the header text that appears in the control.
			 */
			headerText: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * If set to <code>true</code>, enables the growing feature of the control to load more items by requesting from the model.
			 * <b>Note:</b>: This feature only works when a <code>boxes</code> aggregation is bound. Growing must not be used together with two-way binding.
			 */
			growing: { type: "boolean", group: "Behavior", defaultValue: false },

			/**
			 * Defines the number of boxes to be requested from the model for each grow.
			 * This property can only be used if the <code>growing</code> property is set to <code>true</code>.
			 */
			growingThreshold: { type: "int", group: "Misc", defaultValue: 20 },

			/**
			 * A string type that represents BoxContainer's number of boxes for extra large, large, medium and small screens
			 */
			boxesPerRowConfig: { type: "sap.tnt.BoxesPerRowConfig", group: "Behavior", defaultValue: "XL7 L6 M4 S2" }
		},
		defaultAggregation: "boxes",
		aggregations: {

			/**
			 * Defines the boxes contained within this control.
			 */
			boxes: { type: "sap.tnt.Box", multiple: true, singularName: "box", bindable: "bindable", forwarding: { getter: "_getList", aggregation: "items", forwardBinding: true }},

			/**
			 * The header area can be used as a toolbar to add extra controls for user interactions.
			 * <b>Note:</b> When set, this overwrites the <code>headerText</code> property.
			 */
			headerToolbar: { type: "sap.m.Toolbar", multiple: false, forwarding: { getter: "_getList", aggregation: "headerToolbar", forwardBinding: true }},

			/**
			 * The internal list used to hold all the boxes.
			 */
			_list: { type: "sap.m.ListBase", multiple: false, visibility: "hidden" }
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events: {

			/**
			 * Fires when a box is pressed
			 */
			boxPress: {
				parameters: {

					/**
					 * The box which fired the pressed event.
					 */
					box: { type: "sap.tnt.Box" },

					/**
					 * The control which caused the press event within the container.
					 */
					srcControl: { type: "sap.ui.core.Control" }
				}
			}
		}
	}});

	BoxContainer.prototype.init = function () {
		this._getList();
	};

	/**
	 * Lazily create the inner BoxContainerList.
	 *
	 * @returns {sap.tnt.BoxContainerList} The inner list
	 * @private
	 */
	BoxContainer.prototype._getList = function () {
		var oList;

		if (this._bIsBeingDestroyed) {
			return null;
		}

		oList = this.getAggregation("_list");

		if (!oList) {
			this.setAggregation("_list", new BoxContainerList(this.getId() + "-inner", {
				itemPress: function (oEvent) {
					this.fireBoxPress({
						box: oEvent.getParameter("listItem"),
						srcControl: oEvent.getParameter("srcControl")
					});
				}.bind(this)
			}));
			oList = this.getAggregation("_list");
		}

		return oList;
	};

	/**
	 * Forward setters and getters to the internal List.
	 *
	 * @returns {} this for setters. Property value for getters.
	 * @private
	 */
	["setHeaderText", "getHeaderText", "setGrowing", "getGrowing",
	"setGrowingThreshold", "getGrowingThreshold", "setBoxWidth", "getBoxWidth",
	"setBoxesPerRowConfig", "getBoxesPerRowConfig"].forEach(function (sName) {
		BoxContainer.prototype[sName] = function() {
			var oList = this.getAggregation("_list");

			if (oList && oList[sName]) {
				var vReturnValue = oList[sName].apply(oList, arguments);
				return vReturnValue === oList ? this : vReturnValue;
			}
		};
	});

	return BoxContainer;
});