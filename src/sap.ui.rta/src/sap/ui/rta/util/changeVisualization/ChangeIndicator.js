/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/events/KeyCodes",
	"sap/ui/rta/util/changeVisualization/commands/getCommandVisualization",
	"sap/ui/fl/Utils",
	"sap/ui/fl/util/resolveBinding",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/core/Core",
	"sap/ui/rta/util/changeVisualization/ChangeCategories"
], function(
	Fragment,
	JSONModel,
	Control,
	DateFormat,
	KeyCodes,
	getCommandVisualization,
	FlUtils,
	resolveBinding,
	ChangeVisualizationUtils,
	Core,
	ChangeCategories
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
				oRm.class("sapUiRtaChangeIndicatorChange");
				if (oControl.getChanges().length > 4) {
					oRm.class("sapUiRtaChangeIndicatorColorDark");
				} else if (oControl.getChanges().length > 1) {
					oRm.class("sapUiRtaChangeIndicatorColorMedium");
				} else {
					oRm.class("sapUiRtaChangeIndicatorColorLight");
				}
				oRm.openEnd();
				oRm.close("div");
			}
		},
		constructor: function() {
			this._oDetailModel = new JSONModel();
			this._oDetailModel.setDefaultBindingMode("OneWay");

			Control.prototype.constructor.apply(this, arguments);

			this._fnHoverTrue = this._toggleHoverStyleClasses.bind(this, true);
			this._fnHoverFalse = this._toggleHoverStyleClasses.bind(this, false);
			// is needed to prevent that multiple events listeners are attached
			// to the same overlay because setVisible is called multiple times
			this._bEventAttachedToElement = false;
		}
	});

	function handleBrowserEventsOnElement(oElement, sEventHandler) {
		oElement[sEventHandler]("click", this._onSelect, this);
		oElement[sEventHandler]("tap", this._onSelect, this);
		oElement[sEventHandler]("keydown", this._onKeyDown, this);
		oElement[sEventHandler]("mouseout", this._fnHoverFalse);
		oElement[sEventHandler]("focusout", this._fnHoverFalse);
		oElement[sEventHandler]("mouseover", this._fnHoverTrue);
		oElement[sEventHandler]("focusin", this._fnHoverTrue);
	}

	function centerVertically(oIndicator) {
		var oIndicatorDomRef = oIndicator.getDomRef();
		var iOverlayHeight = Core.byId(oIndicator.getOverlayId()).getDomRef().offsetHeight;
		var iIndicatorHeight = oIndicatorDomRef.offsetHeight;
		// the indicator should be centered only if the element has a small enough height to improve the design and visibility
		if (iOverlayHeight < iIndicatorHeight * 5) {
			oIndicator.addStyleClass("sapUiRtaChangeIndicatorVerticallyCentered");
		}
	}

	function getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId) {
		var oAffectedElement = Core.byId(mChangeInformation.affectedElementId);
		var mPayload = Object.keys(mChangeInformation.payload || {}).reduce(function(mPayload, sKey) {
			var vOriginalValue = mChangeInformation.payload[sKey];
			var bIsBinding = FlUtils.isBinding(vOriginalValue);
			var vValue = bIsBinding
				? resolveBinding(vOriginalValue, oAffectedElement)
				: vOriginalValue;
			mPayload[sKey] = vValue;
			return mPayload;
		}, {});

		var mPropertyBag = { appComponent: FlUtils.getAppComponentForControl(oAffectedElement) };
		var oOverlay = Core.byId(sOverlayId);
		var sElementLabel = oOverlay.getDesignTimeMetadata().getLabel(oAffectedElement);
		var oCommandVisualization = getCommandVisualization(mChangeInformation);
		var oDescription = oCommandVisualization && oCommandVisualization.getDescription(mPayload, sElementLabel, mPropertyBag) || {};
		var sCommandName = mChangeInformation.commandName;
		var sDescriptionText;
		var sDescriptionTooltip;

		// 'Settings' with a custom description should overwrite the description from the CommandVisualization
		if (sCommandName === "settings" && mPayload.description) {
			oDescription.descriptionText = mPayload.description;
			oDescription.descriptionTooltip = mPayload.descriptionTooltip;
		} else if (mChangeInformation.changeCategory === "other") {
			// To retrieve the generic description for commands without visualization
			sCommandName = "other";
		}

		if (oDescription.descriptionText) {
			sDescriptionText = oDescription.descriptionText;
			sDescriptionTooltip = oDescription.descriptionTooltip || "";
		} else {
			sElementLabel = sElementLabel && "'" + sElementLabel + "'";
			var sShortenedElementLabel = ChangeVisualizationUtils.shortenString(sElementLabel);
			var sChangeTextKey = (
				"TXT_CHANGEVISUALIZATION_CHANGE_"
				+ sCommandName.toUpperCase()
			);
			sDescriptionText = oRtaResourceBundle.getText(sChangeTextKey, sShortenedElementLabel);
			sDescriptionTooltip = oRtaResourceBundle.getText(sChangeTextKey, sElementLabel);
		}
		sDescriptionTooltip = sDescriptionText.length < sDescriptionTooltip.length ? sDescriptionTooltip : null;
		var sDetailButtonText = oDescription && oDescription.buttonText;
		var sIconTooltip = oRtaResourceBundle.getText(
			"TXT_CHANGEVISUALIZATION_OVERVIEW_"
			+ sCommandName.toUpperCase()
		);

		return {
			description: sDescriptionText,
			tooltip: sDescriptionTooltip,
			buttonText: sDetailButtonText,
			iconTooltip: sIconTooltip
		};
	}

	function getDates(mChangeInformation, oRtaResourceBundle) {
		var sCreationDate = mChangeInformation.change.getCreation();
		var oDate = new Date(sCreationDate);
		var sFallbackDate = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");

		return {
			fullDate: sCreationDate ? DateFormat.getDateTimeInstance().format(oDate) : sFallbackDate,
			relativeDate: sCreationDate ? DateFormat.getDateTimeInstance({ relative: "true" }).format(oDate) : sFallbackDate
		};
	}

	function formatChangesModelItem(sOverlayId, mChangeInformation) {
		var oRtaResourceBundle = Core.getLibraryResourceBundle("sap.ui.rta");
		var oTexts = getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId);
		var oDates = getDates(mChangeInformation, oRtaResourceBundle);

		return {
			id: mChangeInformation.id,
			change: mChangeInformation,
			description: oTexts.description,
			descriptionTooltip: oTexts.tooltip,
			fullDate: oDates.fullDate,
			relativeDate: oDates.relativeDate,
			detailButtonText: oTexts.buttonText,
			icon: ChangeCategories.getIconForCategory(mChangeInformation.changeCategory),
			iconTooltip: oTexts.iconTooltip
		};
	}

	ChangeIndicator.prototype.init = function() {
		this._iOldTabIndex = 0;
		handleBrowserEventsOnElement.call(this, this, "attachBrowserEvent");
	};

	ChangeIndicator.prototype.setVisible = function(bVisible) {
		Control.prototype.setVisible.apply(this, arguments);
		var oOverlay = Core.byId(this.getOverlayId());
		// needed because the change indicator cleanup is only triggered on save and exit
		if (oOverlay) {
			if (bVisible && !this._bEventAttachedToElement) {
				handleBrowserEventsOnElement.call(this, oOverlay, "attachBrowserEvent");
				this._bEventAttachedToElement = true;
			}
			if (!bVisible) {
				handleBrowserEventsOnElement.call(this, oOverlay, "detachBrowserEvent");
				this._bEventAttachedToElement = false;
				if (this.getAggregation("_popover")) {
					this.getAggregation("_popover").destroy();
				}
			}
		}
		return this;
	};

	ChangeIndicator.prototype.focus = function() {
		if (this.getDomRef()) {
			// Element is rendered, focus immediately
			Control.prototype.focus.apply(this, arguments);
			this._bScheduledForFocus = false;
			return;
		}
		this._bScheduledForFocus = true;
	};

	ChangeIndicator.prototype.setOverlayId = function(sOverlayId) {
		// Overlays don't have aggregations, thus the indicator dom ref must be placed as
		// a child of the overlay dom ref manually
		// If the overlay that the indicator should be attached to changes, it is possible that the
		// indicator is not rendered yet or that the old overlay and thus the nested indicator were destroyed
		// To properly render it, the indicator must temporarily be placed in the static area
		// Once it is rendered, it can move itself to the actual overlay dom ref (see onAfterRendering)
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.parentNode.removeChild(oDomRef);
		}
		this.placeAt(Core.getStaticAreaRef());

		this.setProperty("overlayId", sOverlayId);
		return this;
	};

	ChangeIndicator.prototype.onAfterRendering = function() {
		var oOverlay = Core.getElementById(this.getOverlayId());
		if (oOverlay) {
			// Attach to the overlay
			oOverlay.getDomRef().appendChild(this.getDomRef());
			centerVertically(this);
		}
		// Restore the Tabindex if stored before; set to 0 as default
		this.getDomRef().tabIndex = this._iOldTabIndex;

		if (this._bScheduledForFocus) {
			// Element was supposed to be focused before rendering
			this.focus();
			this._toggleHoverStyleClasses(true);
		}
	};

	ChangeIndicator.prototype.exit = function() {
		var oDomRef = this.getDomRef();
		var oOverlay = Core.byId(this.getOverlayId());
		if (oDomRef) {
			oDomRef.parentNode.removeChild(oDomRef);
		}
		if (oOverlay) {
			if (this.getAggregation("_popover")) {
				this.getAggregation("_popover").destroy();
			}
			handleBrowserEventsOnElement.call(this, oOverlay, "detachBrowserEvent");
		}
		handleBrowserEventsOnElement.call(this, this, "detachBrowserEvent");
	};

	ChangeIndicator.prototype.setChanges = function(aChanges) {
		this.setProperty("changes", aChanges);
		this._oDetailModel.setData((aChanges || []).reverse().map(formatChangesModelItem.bind(this, this.getOverlayId())));
	};

	ChangeIndicator.prototype._onSelect = function(oEvent) {
		this.focus();
		oEvent.stopPropagation();
		this._openDetailPopover();
	};

	ChangeIndicator.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.ENTER) {
			this._onSelect(oEvent);
		}

		this.fireKeyPress({
			originalEvent: oEvent
		});
	};

	ChangeIndicator.prototype._toggleHoverStyleClasses = function(bAdd, oEvent) {
		if (oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
		var oOverlay = Core.byId(this.getOverlayId());
		if (oOverlay.getMetadata().getName() !== "sap.ui.dt.ElementOverlay") {
			return;
		}
		var sFunctionName = bAdd ? "addStyleClass" : "removeStyleClass";
		oOverlay[sFunctionName]("sapUiRtaChangeIndicatorHovered");
		this[sFunctionName]("sapUiRtaHover");
	};

	ChangeIndicator.prototype._openDetailPopover = function() {
		if (!this.getAggregation("_popover")) {
			//store the tabindex (tabindex will be removed on opening the popover)
			this._iOldTabIndex = this.getDomRef().getAttribute("tabindex");
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

	ChangeIndicator.prototype._showDependentElements = function(oEvent) {
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
