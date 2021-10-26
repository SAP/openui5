/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Icon",
	"sap/ui/events/KeyCodes",
	"sap/base/strings/capitalize",
	"sap/ui/rta/util/changeVisualization/categories/getVisualizationCategory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/util/resolveBinding"
], function(
	Fragment,
	JSONModel,
	Control,
	Text,
	DateFormat,
	Icon,
	KeyCodes,
	capitalize,
	getVisualizationCategory,
	FlUtils,
	resolveBinding
) {
	"use strict";
	/**
	 * @class
	 * Constructor for a new <code>sap.ui.rta.util.changeVisualization.ChangeIndicator</code> class.
	 * The <code>ChangeIndicator</code> class is used to visualize the changes of an app.
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.rta.util.changeVisualization.ChangeIndicator
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 */
	var ChangeIndicator = Control.extend("sap.ui.rta.util.changeVisualization.ChangeIndicator", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/**
				 * List of changes that should be rendered for the indicator
				 */
				changes: {
					type: "array",
					defaultValue: []
				},
				/**
				 * Mode of the indicator, "change" or "dependent"
				 */
				mode: {
					type: "string",
					defaultValue: "change"
				},
				/**
				 * Distance from the left side of the screen in px
				 */
				posX: {
					type: "int"
				},
				/**
				 * Distance from the top of the screen in px
				 */
				posY: {
					type: "int"
				},
				/**
				 * ID of the overlay that the indicator should be rendered in
				 */
				overlayId: {
					type: "string"
				},
				/**
				 * ID of the selector that the indicator's changes belong to
				 */
				selectorId: {
					type: "string"
				}
			},
			aggregations: {
				_popover: {
					type: "sap.m.Popover",
					multiple: false,
					visibility: "hidden"
				},
				_text: {
					type: "sap.m.Text",
					multiple: false,
					visibility: "hidden"
				},
				_icon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * Fired when the details for a change should be displayed
				 */
				selectChange: {
					parameters: {
						changeId: {
							type: "string"
						}
					}
				},
				/**
				 * Fired when a key is pressed while the focus is on the indicator
				 */
				keyPress: {
					parameters: {
						originalEvent: {
							type: "object"
						}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiRtaChangeIndicator");
				oRm.class("sapUiRtaChangeIndicator" + capitalize(oControl.getMode()));
				if (
					oControl.getMode() === "change"
					&& oControl.getModel()
					&& oControl.getModel().getData().selectedChange
				) {
					// Root selector of dependent selection
					oRm.class("sapUiRtaChangeIndicatorChangeSolid");
				}
				oRm.style("width", oControl._getSize() + "px");
				oRm.style("height", oControl._getSize() + "px");
				oRm.openEnd();
				oRm.openStart("div");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_icon"));
				oRm.renderControl(oControl.getAggregation("_text"));
				oRm.close("div");
				oRm.close("div");
			}
		},
		constructor: function () {
			this._oDetailModel = new JSONModel();
			this._oDetailModel.setDefaultBindingMode("OneWay");

			Control.prototype.constructor.apply(this, arguments);
		}
	});

	ChangeIndicator.prototype.init = function () {
		this.setAggregation("_text", new Text({
			text: "{= (${changes} || []).length}",
			visible: "{= (${changes} || []).length > 1}"
		}).addStyleClass("sapUiRtaChangeIndicatorText"));

		this.setAggregation("_icon", new Icon({
			src: "sap-icon://display",
			visible: {
				path: "/selectedChange",
				formatter: function (sSelectedChange) {
					return !!(
						sSelectedChange
						&& this.getChanges().some(function (oChange) {
							return (
								oChange.id === sSelectedChange
								&& oChange.dependent === false
							);
						})
					);
				}.bind(this)
			}
		}).addStyleClass("sapUiRtaChangeIndicatorIcon"));

		this.attachBrowserEvent("click", this._onSelect, this);
		this.attachBrowserEvent("keydown", this._onKeyDown, this);
		this.attachBrowserEvent("mouseleave", function() {this._toggleHoverStyleClasses(false); }, this);
		this.attachBrowserEvent("focusout", function() {this._toggleHoverStyleClasses(false); }, this);
		this.attachBrowserEvent("mouseover", function() {this._toggleHoverStyleClasses(true); }, this);
		this.attachBrowserEvent("focusin", function() {this._toggleHoverStyleClasses(true); }, this);
	};

	ChangeIndicator.prototype.focus = function () {
		if (this.getDomRef()) {
			// Element is rendered, focus immediately
			Control.prototype.focus.apply(this, arguments);
			this._bScheduledForFocus = false;
		}
		this._bScheduledForFocus = true;
	};

	ChangeIndicator.prototype._getSize = function () {
		var oOverlay = document.getElementById(this.getOverlayId());
		var iSize = oOverlay.offsetHeight;
		return (iSize > 50 ? 50 : iSize) - 2;
	};

	ChangeIndicator.prototype.onAfterRendering = function () {
		// Attach to the overlay
		var oOverlay = document.getElementById(this.getOverlayId());
		oOverlay.appendChild(this.getDomRef());
		// Set default tab index of 0 to enable tab navigation for the element
		this.getDomRef().tabIndex = 0;

		if (this._bScheduledForFocus) {
			// Element was supposed to be focused before rendering
			this.focus();
			this._toggleHoverStyleClasses(true);
		}
	};

	ChangeIndicator.prototype.exit = function () {
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.parentNode.removeChild(oDomRef);
		}
		this.detachBrowserEvent("click", this._onSelect, this);
		this.detachBrowserEvent("keydown", this._onKeyDown, this);
	};

	ChangeIndicator.prototype.setChanges = function (aChanges) {
		this.setProperty("changes", aChanges);
		this._oDetailModel.setData((aChanges || []).map(this._formatChangesModelItem.bind(this)));
	};

	ChangeIndicator.prototype.setMode = function (sMode) {
		this.setProperty("mode", sMode);
		// Mode might have changed the information displayed for each change
		this._oDetailModel.setData((this.getChanges() || []).map(this._formatChangesModelItem.bind(this)));
	};

	ChangeIndicator.prototype._onSelect = function (oEvent) {
		this.focus();
		oEvent.stopPropagation();
		if (
			this.getModel().getData().selectedChange
			&& !this.getChanges().some(function (oChange) {
				return oChange.dependent;
			})
		) {
			this.fireSelectChange({
				changeId: undefined
			});
		} else {
			this._openDetailPopover();
		}
	};

	ChangeIndicator.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.ENTER) {
			this._onSelect(oEvent);
		}

		this.fireKeyPress({
			originalEvent: oEvent
		});
	};

	ChangeIndicator.prototype._toggleHoverStyleClasses = function(bAdd) {
		var oOverlay = sap.ui.getCore().byId(this.getOverlayId());
		if (oOverlay.getMetadata().getName() !== "sap.ui.dt.ElementOverlay") {
			return;
		}
		var sFunctionName = bAdd ? "addStyleClass" : "removeStyleClass";
		oOverlay[sFunctionName]("sapUiRtaOverlayHover");
		oOverlay[sFunctionName]("sapUiRtaChangeIndicatorHovered");
	};

	ChangeIndicator.prototype._formatChangesModelItem = function (mChangeInformation) {
		var oAffectedElement = sap.ui.getCore().byId(mChangeInformation.affectedElementId);
		var mPayload = Object.keys(mChangeInformation.payload || {}).reduce(function (mPayload, sKey) {
			var vOriginalValue = mChangeInformation.payload[sKey];
			var bIsBinding = FlUtils.isBinding(vOriginalValue);
			var vValue = bIsBinding
				? resolveBinding(vOriginalValue, oAffectedElement)
				: vOriginalValue;
			mPayload[sKey] = vValue;
			return mPayload;
		}, {});

		var oOverlay = sap.ui.getCore().byId(this.getOverlayId());
		var sElementLabel = oOverlay.getDesignTimeMetadata().getLabel(oAffectedElement);
		var oVisualizationUtil = getVisualizationCategory(mChangeInformation.commandCategory);
		var sDescription = oVisualizationUtil && oVisualizationUtil.getDescription(mPayload, sElementLabel);
		var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sMode = this.getMode();
		var sChangeTitle = mChangeInformation.commandName.charAt(0).toUpperCase() + mChangeInformation.commandName.slice(1);
		sElementLabel = sElementLabel && "'" + sElementLabel + "'";
		var sChangeTextKey = (
			"TXT_CHANGEVISUALIZATION_"
			+ sMode.toUpperCase() + "_"
			+ mChangeInformation.commandName.toUpperCase()
		);
		var sChangeText = sDescription || oRtaResourceBundle.getText(sChangeTextKey, sElementLabel);
		var sCreationDate = mChangeInformation.change.getCreation();
		var sDate = sCreationDate
			? DateFormat.getDateTimeInstance().format(new Date(sCreationDate))
			: oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");
		var bEnableDetailButton = (
			sMode === "change"
			&& (mChangeInformation.commandName === "move" || mChangeInformation.commandName === "split")
		);
		return {
			id: mChangeInformation.id,
			change: mChangeInformation,
			changeTitle: sChangeTitle,
			description: sChangeText,
			date: sDate,
			enableDetailButton: bEnableDetailButton
		};
	};

	ChangeIndicator.prototype._openDetailPopover = function () {
		if (!this.getAggregation("_popover")) {
			Fragment.load({
				name: "sap.ui.rta.util.changeVisualization.ChangeIndicatorPopover",
				controller: this
			}).then(function(oPopover) {
				oPopover._bOpenedByChangeIndicator = true;
				this.setAggregation("_popover", oPopover);
				oPopover.setModel(this._oDetailModel, "details");
				oPopover.openBy(this);
			}.bind(this));
		} else {
			if (this.getAggregation("_popover").isOpen()) {
				return this.getAggregation("_popover").close();
			}
			this.getAggregation("_popover").openBy(this);
		}
	};

	ChangeIndicator.prototype._showDependentElements = function (oEvent) {
		this.getAggregation("_popover").close();
		var sChangeId = this.getChanges().length > 1
			? oEvent.getSource().getBindingContext("details").getObject().id
			: this.getChanges()[0].id;

		this.fireSelectChange({
			changeId: sChangeId
		});
	};

	return ChangeIndicator;
});
