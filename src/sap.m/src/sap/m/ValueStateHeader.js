/*!
 * ${copyright}
 */

// Provides control sap.m.ValueStateHeader.
sap.ui.define(
	["./library", "sap/ui/core/library", "sap/ui/Device", "sap/ui/core/Core", "sap/ui/core/Control", "sap/ui/core/Element"],
	function(library, coreLibrary, Device, Core, Control, Element) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		/**
		 * Constructor for a new ValueStateHeader.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ValueStateHeader control is used by a Popover or Dialog controls to display long value state messages.
		 *
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.ValueStateHeader
		 */
		var ValueStateHeader = Control.extend("sap.m.ValueStateHeader", /** @lends sap.m.ValueStateHeader.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Text to be displayed in the value state
					 */
					text: { type: "string", defaultValue: "" },
					/**
					 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
					 */
					valueState: {
						type: "sap.ui.core.ValueState",
						defaultValue: ValueState.None
					}
				},
				aggregations: {
					/**
					 * <code>sap.m.FormattedText</code> text, can contain links. If this aggregation and
					 * the text property are both set the formatted text will be displayed.
					 */
					formattedText: { type: "sap.m.FormattedText", multiple: false }
				},
				associations: {
					/**
					 * Associated Popup to the ValueStateHeader.
					 * The ValueStateHeader itself has a size dependent on the Popup's size after it has been rendered.
					 */
					popup: { type: "sap.ui.core.Popup", multiple: false }
				}
			},
			renderer: {
				apiVersion: 2,
				render: function (oRM, oControl) {
					var mapValueStateToClass = {
						None: "sapMValueStateHeaderNone",
						Error: "sapMValueStateHeaderError",
						Warning: "sapMValueStateHeaderWarning",
						Success: "sapMValueStateHeaderSuccess",
						Information: "sapMValueStateHeaderInformation"
					};

					oRM.openStart("div", oControl)
						.class("sapMValueStateHeaderRoot")
						.class(mapValueStateToClass[oControl.getValueState()])
						.openEnd();

					oRM.openStart("span", oControl.getId() + "-inner")
						.class("sapMValueStateHeaderText")
						.openEnd();
					if (oControl.getFormattedText()) {
						oRM.renderControl(oControl.getFormattedText());
					} else {
						oRM.text(oControl.getText());
					}

					oRM.close("span");
					oRM.close("div");
				}
			}
		}
		);

		ValueStateHeader.prototype._fnOrientationChange = function () {
			var oPopup = this._getAssociatedPopupObject(),
				oHeaderDomRef = this.getDomRef();

			if (oHeaderDomRef && oPopup && oPopup.isA("sap.m.Dialog")) {
				oHeaderDomRef.style.width = oPopup.getDomRef().getBoundingClientRect().width + "px";
			}
		};

		ValueStateHeader.prototype.init = function () {
			Device.orientation.attachHandler(this._fnOrientationChange, this);
		};

		ValueStateHeader.prototype.exit = function () {
			Device.orientation.detachHandler(this._fnOrientationChange, this);
		};

		ValueStateHeader.prototype.setPopup = function (vPopup) {
			var that = this;
			var repositioned = false;
			var oPopup = (typeof vPopup === "string") ? Element.registry.get(vPopup) : vPopup;

			this.setAssociation("popup", oPopup);

			if (oPopup.isA("sap.m.Dialog")) {
				return this;
			}

			oPopup._afterAdjustPositionAndArrowHook = function () {
				var oDomRef = that.getDomRef();

				if (!oDomRef) {
					return;
				}

				oDomRef.style.width = oPopup.getDomRef().getBoundingClientRect().width + "px";
				oDomRef.style.height = "auto";

				if (!repositioned) {
					repositioned = true;

					// schedule reposition after the list layout has been adjusted
					setTimeout(function () {
						if (oPopup._getOpenByDomRef()) {
							oPopup._fnOrientationChange();
						}
					}, 0);
				}
			};

			return this;
		};

		ValueStateHeader.prototype._getAssociatedPopupObject = function () {
			return Element.registry.get(this.getPopup());
		};

		ValueStateHeader.prototype.onAfterRendering = function () {
			var oPopup = this._getAssociatedPopupObject();

			if (oPopup) {
				// schedule reposition after header rendering
				if (oPopup.isA("sap.m.Popover")) {
					setTimeout(function () {
						if (oPopup._getOpenByDomRef()) {
							oPopup._fnOrientationChange();
							oPopup.oPopup._applyPosition();
						}
					}, 0);
				}
			}
		};

		return ValueStateHeader;

	}
);
