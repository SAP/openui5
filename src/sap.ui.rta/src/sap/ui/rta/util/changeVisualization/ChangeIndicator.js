/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/core/StaticArea",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/util/resolveBinding",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/util/changeVisualization/commands/getCommandVisualization",
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/dt/OverlayRegistry"
], function(
	DateFormat,
	Control,
	Element,
	Fragment,
	Lib,
	StaticArea,
	KeyCodes,
	resolveBinding,
	FlUtils,
	JSONModel,
	getCommandVisualization,
	ChangeCategories,
	ChangeVisualizationUtils,
	OverlayRegistry
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
	const ChangeIndicator = Control.extend("sap.ui.rta.util.changeVisualization.ChangeIndicator", {
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
				},
				/**
				 * ID of the element that is connected to the corresponding indicator element (e.g. section/anchor bar)
				 */
				connectedElementId: {
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
				},
				detailPopoverOpened: {
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiRtaChangeIndicator");
				oRm.class("sapUiRtaChangeIndicatorChange");
				const sTooltip = oControl.getTooltip_AsString();
				if (sTooltip) {
					oRm.attr("title", sTooltip);
				}
				oRm.openEnd();
				if (sTooltip) {
					oRm.openStart("span", `${oControl.getId()}-tooltip`);
					oRm.class("sapUiInvisibleText");
					oRm.openEnd();
					oRm.text(sTooltip);
					oRm.close("span");
				}
				oRm.close("div");
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			this._oDetailModel = new JSONModel();
			this._oDetailModel.setDefaultBindingMode("OneWay");
			this._fnHoverTrue = this._setHoverStyleClasses.bind(this, true);
			this._fnHoverFalse = this._setHoverStyleClasses.bind(this, false);
			Control.prototype.constructor.apply(this, aArgs);
			// is needed to prevent that multiple events listeners are attached
			// to the same overlay because setVisible is called multiple times
			this._bEventAttachedToElement = false;
			this._oRenderPromise = new Promise((resolve) => {
				this._fnRendered = resolve;
			});
		}
	});

	function handleBrowserEventsOnOverlay(oOverlay, sEventHandler) {
		oOverlay[sEventHandler]("click", this._onSelect, this);
		oOverlay[sEventHandler]("tap", this._onSelect, this);
		oOverlay[sEventHandler]("keydown", this._onKeyDown, this);
		oOverlay[sEventHandler]("mouseover", this._fnHoverTrue);
		oOverlay[sEventHandler]("focusin", this._fnHoverTrue);
		oOverlay[sEventHandler]("mouseout", this._fnHoverFalse);
		oOverlay[sEventHandler]("focusout", this._fnHoverFalse);
	}

	function handleBrowserEventsOnIndicator(oIndicator, sEventHandler) {
		oIndicator[sEventHandler]("click", this._onSelect, this);
		oIndicator[sEventHandler]("tap", this._onSelect, this);
		oIndicator[sEventHandler]("keydown", this._onKeyDown, this);
		oIndicator[sEventHandler]("mouseover", this._fnHoverTrue);
		oIndicator[sEventHandler]("focusin", this._fnHoverTrue);
		oIndicator[sEventHandler]("mouseout", this._fnHoverFalse);
		oIndicator[sEventHandler]("focusout", this._fnHoverFalse);
	}

	function centerVertically(oIndicator) {
		const oIndicatorDomRef = oIndicator.getDomRef();
		const iOverlayHeight = Element.getElementById(oIndicator.getOverlayId()).getDomRef().offsetHeight;
		const iIndicatorHeight = oIndicatorDomRef.offsetHeight;
		// the indicator should be centered only if the element has a small enough height to improve the design and visibility
		if (iOverlayHeight < iIndicatorHeight * 5) {
			oIndicator.addStyleClass("sapUiRtaChangeIndicatorVerticallyCentered");
		} else {
			oIndicator.removeStyleClass("sapUiRtaChangeIndicatorVerticallyCentered");
		}
	}

	function getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId) {
		const oAffectedElement = Element.getElementById(mChangeInformation.affectedElementId);
		const mDescriptionPayload = Object.keys(mChangeInformation.descriptionPayload || {}).reduce(function(mDescriptionPayload, sKey) {
			const vOriginalValue = mChangeInformation.descriptionPayload[sKey];
			const bIsBinding = FlUtils.isBinding(vOriginalValue);
			const vValue = bIsBinding
				? resolveBinding(vOriginalValue, oAffectedElement)
				: vOriginalValue;
			mDescriptionPayload[sKey] = vValue;
			return mDescriptionPayload;
		}, {});

		const mPropertyBag = { appComponent: FlUtils.getAppComponentForControl(oAffectedElement) };
		const oOverlay = Element.getElementById(sOverlayId);
		const sElementLabel = oOverlay.getDesignTimeMetadata().getLabel(oAffectedElement);
		const oCommandVisualization = getCommandVisualization(mChangeInformation);
		const oDescription = oCommandVisualization?.getDescription(mDescriptionPayload, sElementLabel, mPropertyBag) || {};
		let sCommandName = mChangeInformation.commandName;
		let sDescriptionText;
		let sDescriptionTooltip;

		// 'Settings' with a custom description should overwrite the description from the CommandVisualization
		if (sCommandName === "settings" && mDescriptionPayload.description) {
			oDescription.descriptionText = mDescriptionPayload.description;
			oDescription.descriptionTooltip = mDescriptionPayload.descriptionTooltip;
		} else if (mChangeInformation.changeCategory === "other") {
			// To retrieve the generic description for commands without visualization
			sCommandName = "other";
		}

		if (oDescription.descriptionText) {
			sDescriptionText = oDescription.descriptionText;
			sDescriptionTooltip = oDescription.descriptionTooltip || "";
		} else {
			const sShortenedElementLabel = ChangeVisualizationUtils.shortenString(sElementLabel);
			const sChangeTextKey = (
				`TXT_CHANGEVISUALIZATION_CHANGE_${
				 sCommandName.toUpperCase()}`
			);
			sDescriptionText = oRtaResourceBundle.getText(sChangeTextKey, [sShortenedElementLabel]);
			sDescriptionTooltip = oRtaResourceBundle.getText(sChangeTextKey, [sElementLabel]);
		}
		sDescriptionTooltip = sDescriptionText.length < sDescriptionTooltip.length ? sDescriptionTooltip : null;
		const sDetailButtonText = oDescription && oDescription.buttonText;
		const sIconTooltip = oRtaResourceBundle.getText(
			`TXT_CHANGEVISUALIZATION_OVERVIEW_${
			 mChangeInformation.changeCategory.toUpperCase()}`
		);

		return {
			description: sDescriptionText,
			tooltip: sDescriptionTooltip,
			buttonText: sDetailButtonText,
			iconTooltip: sIconTooltip
		};
	}

	function getDates(mChangeInformation, oRtaResourceBundle) {
		const sCreationDate = mChangeInformation.change.getCreation();
		const oDate = new Date(sCreationDate);
		const sFallbackDate = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");

		return {
			fullDate: sCreationDate ? DateFormat.getDateTimeInstance().format(oDate) : sFallbackDate,
			relativeDate: sCreationDate ? DateFormat.getDateTimeInstance({ relative: "true" }).format(oDate) : sFallbackDate
		};
	}

	function formatChangesModelItem(sOverlayId, mChangeInformation) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const oTexts = getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId);
		const oDates = getDates(mChangeInformation, oRtaResourceBundle);

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
		handleBrowserEventsOnIndicator.call(this, this, "attachBrowserEvent");
	};

	ChangeIndicator.prototype.setVisible = function(...aArgs) {
		const [bVisible] = aArgs;
		Control.prototype.setVisible.apply(this, aArgs);
		const oOverlay = Element.getElementById(this.getOverlayId());
		// needed because the change indicator cleanup is only triggered on save and exit
		if (oOverlay) {
			if (bVisible && !this._bEventAttachedToElement) {
				handleBrowserEventsOnOverlay.call(this, oOverlay, "attachBrowserEvent");
				this._bEventAttachedToElement = true;
			}
			if (!bVisible) {
				handleBrowserEventsOnOverlay.call(this, oOverlay, "detachBrowserEvent");
				this._bEventAttachedToElement = false;
				if (this.getAggregation("_popover")) {
					this.getAggregation("_popover").destroy();
				}
				// Reset the render promise
				this._oRenderPromise = new Promise((resolve) => {
					this._fnRendered = resolve;
				});
			}
		}
		return this;
	};

	ChangeIndicator.prototype.focus = function(...aArgs) {
		if (this.getDomRef()) {
			// Element is rendered, focus immediately
			Control.prototype.focus.apply(this, aArgs);
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
		const oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.parentNode.removeChild(oDomRef);
		}
		this.placeAt(StaticArea.getDomRef());

		this.setProperty("overlayId", sOverlayId);
		return this;
	};

	ChangeIndicator.prototype.onAfterRendering = function() {
		const oOverlay = Element.getElementById(this.getOverlayId());
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
			this._setHoverStyleClasses(true);
		}
		// Resolve the rendering promise
		this._fnRendered();
	};

	/**
	 * Waits for the indicator to be rendered.
	 * @returns {Promise} Resolves when the indicator is rendered
	 */
	ChangeIndicator.prototype.waitForRendering = function() {
		return this._oRenderPromise;
	};

	ChangeIndicator.prototype.exit = function() {
		const oDomRef = this.getDomRef();
		const oOverlay = Element.getElementById(this.getOverlayId());
		if (oDomRef) {
			oDomRef.parentNode.removeChild(oDomRef);
		}
		if (oOverlay) {
			if (this.getAggregation("_popover")) {
				this.getAggregation("_popover").destroy();
			}
			handleBrowserEventsOnOverlay.call(this, oOverlay, "detachBrowserEvent");
		}
		handleBrowserEventsOnIndicator.call(this, this, "detachBrowserEvent");
	};

	ChangeIndicator.prototype.setChanges = function(aChanges) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		this.setProperty("changes", aChanges);
		const aSortedChanges = aChanges
			? aChanges.sort(
				(a, b) => new Date(a.change.getCreation() || new Date()) - new Date(b.change.getCreation() || new Date())
			).reverse()
			: [];
		const aFormattedChanges = (aSortedChanges).map(formatChangesModelItem.bind(this, this.getOverlayId()));
		this._oDetailModel.setData(aFormattedChanges);
		if (aChanges && aChanges.length === 1) {
			this.setTooltip(oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_INDICATOR_TOOLTIP_SING"));
		} else if (aChanges) {
			this.setTooltip(oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_INDICATOR_TOOLTIP_PLUR", [aChanges.length]));
		}
	};

	ChangeIndicator.prototype._onSelect = function(oEvent) {
		this.focus();
		oEvent.stopPropagation();
		this._toggleDetailPopover();
	};

	ChangeIndicator.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.ENTER) {
			this._onSelect(oEvent);
		}

		this.fireKeyPress({
			originalEvent: oEvent
		});
	};

	// When the detail popover is opened the overlay should be selected
	ChangeIndicator.prototype.onDetailPopoverOpened = function(oEvent) {
		oEvent.preventDefault();
		this._setHoverStyleClasses(true);
	};

	ChangeIndicator.prototype.onIndicatorBrowserInteraction = function(bAdd, oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
		this._setHoverStyleClasses(bAdd);
	};

	ChangeIndicator.prototype._setHoverStyleClasses = function(bAdd, oEvent) {
		if (oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
		const oOverlay = Element.getElementById(this.getOverlayId());
		if (oOverlay.getMetadata().getName() !== "sap.ui.dt.ElementOverlay") {
			return;
		}

		const sFunctionName = bAdd ? "addStyleClass" : "removeStyleClass";
		oOverlay[sFunctionName]("sapUiRtaChangeIndicatorHovered");
		this[sFunctionName]("sapUiRtaHover");
		if (this.getConnectedElementId()) {
			const oConnectedElementOverlay = OverlayRegistry.getOverlay(this.getConnectedElementId());
			oConnectedElementOverlay[sFunctionName]("sapUiRtaChangeIndicatorHovered");
		}
	};

	ChangeIndicator.prototype._toggleDetailPopover = function() {
		if (!this.getAggregation("_popover")) {
			// store the tabindex (tabindex will be removed on opening the popover)
			this._iOldTabIndex = this.getDomRef().getAttribute("tabindex");
			Fragment.load({
				name: "sap.ui.rta.util.changeVisualization.ChangeIndicatorPopover",
				id: `${this.sId}Info`,
				controller: this
			}).then(function(oPopover) {
				oPopover._bOpenedByChangeIndicator = true;
				this.setAggregation("_popover", oPopover);
				oPopover.setModel(this._oDetailModel, "details");
				oPopover.openBy(this);
				this._setHoverStyleClasses(true);
			}.bind(this));
		} else {
			if (this.getAggregation("_popover").isOpen()) {
				return this.getAggregation("_popover").close();
			}
			this.getAggregation("_popover").openBy(this);
			this._setHoverStyleClasses(true);
		}
		return undefined;
	};

	ChangeIndicator.prototype._showDependentElements = function(oEvent) {
		this.getAggregation("_popover").close();
		const sChangeId = this.getChanges().length > 1
			? oEvent.getSource().getBindingContext("details").getObject().id
			: this.getChanges()[0].id;
		this.fireSelectChange({
			changeId: sChangeId
		});
	};

	return ChangeIndicator;
});
