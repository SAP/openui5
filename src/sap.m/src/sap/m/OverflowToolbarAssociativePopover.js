/*!
 * ${copyright}
 */

// Provides control sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover.
sap.ui.define(['./Popover', './PopoverRenderer', './OverflowToolbarAssociativePopoverControls', './OverflowToolbarLayoutData', 'sap/m/library'],
	function(Popover, PopoverRenderer, OverflowToolbarAssociativePopoverControls, OverflowToolbarLayoutData, library) {
	"use strict";



	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;



	/**
	 * Constructor for a new OverflowToolbarAssociativePopover.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * OverflowToolbarAssociativePopover is a version of Popover that uses an association in addition to the aggregation
	 * @extends sap.m.Popover
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover
	 */
	var OverflowToolbarAssociativePopover = Popover.extend("sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover", /** @lends sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover.prototype */ {
		metadata : {
			associations : {
				/**
				 * The same as content, but provided in the form of an association
				 */
				associatedContent: {type: "sap.ui.core.Control", multiple: true}
			}
		},
		renderer: PopoverRenderer.render
	});

	OverflowToolbarAssociativePopover.prototype.init = function() {
		Popover.prototype.init.apply(this, arguments);

		// Instantiate the helper that will manage controls entering/leaving the popover
		this.oControlsManager = new OverflowToolbarAssociativePopoverControls();
	};

	OverflowToolbarAssociativePopover.prototype.onBeforeRendering = function() {
		Popover.prototype.onBeforeRendering.apply(this, arguments);
		this.addStyleClass("sapMOTAPopover");
		this.addStyleClass("sapMOverflowToolbarMenu-CTX");

		var bHasButtonsWithIcons = this._getAllContent().some(function(oControl) {
			return oControl.hasStyleClass("sapMOTAPButtonWithIcon");
		});

		if (bHasButtonsWithIcons) {
			this.addStyleClass("sapMOTAPButtonsWithIcons");
		} else {
			this.removeStyleClass("sapMOTAPButtonsWithIcons");
		}
	};

	/* Override API methods */
	OverflowToolbarAssociativePopover.prototype.addAssociatedContent = function(oControl) {
		this.addAssociation("associatedContent",oControl, true);
		this._preProcessControl(oControl);
		return this;
	};

	OverflowToolbarAssociativePopover.prototype.removeAssociatedContent = function(oControl) {
		var sResult = this.removeAssociation("associatedContent",oControl, true),
			oControlObject;

		if (sResult) {
			oControlObject = sap.ui.getCore().byId(sResult);
			if (oControlObject) {
				this._postProcessControl(oControlObject);
			}
		}
		return sResult;
	};

	/**
	 * Use the helper to modify controls that are about to enter the popover, so that they look good there
	 * @param oControl
	 * @returns {*}
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._preProcessControl = function(oControl){
		var oCtrlConfig = OverflowToolbarAssociativePopoverControls.getControlConfig(oControl),
			sAttachFnName;

		// For each event that must close the popover, attach a handler
		oCtrlConfig.listenForEvents.forEach(function(sEventType) {
			sAttachFnName = "attach" + fnCapitalize(sEventType);
			if (oControl[sAttachFnName]) {
				oControl[sAttachFnName](this._closeOnInteraction.bind(this, oControl));
			} else {
				oControl.attachEvent(sEventType, this._closeOnInteraction.bind(this, oControl));
			}
		}, this);

		// Call preprocessor function, if any
		if (typeof oCtrlConfig.preProcess === "function") {
			oCtrlConfig.preProcess.call(this.oControlsManager, oControl);
		}

		var oLayoutData = oControl.getLayoutData();

		if (oLayoutData instanceof OverflowToolbarLayoutData && oLayoutData.getPriority() === OverflowToolbarPriority.Disappear) {
			oControl.addStyleClass("sapMOTAPHidden");
		}

		return this;
	};

	/**
	 * Use the helper to restore controls that leave the popover to their previous state
	 * @param oControl
	 * @returns {*}
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._postProcessControl = function(oControl) {
		var oCtrlConfig = OverflowToolbarAssociativePopoverControls.getControlConfig(oControl),
			sDetachFnName;

		// For each event that must close the popover, detach the handler
		oCtrlConfig.listenForEvents.forEach(function(sEventType) {
			sDetachFnName = "detach" + fnCapitalize(sEventType);
			if (oControl[sDetachFnName]) {
				oControl[sDetachFnName](this._closeOnInteraction, this);
			} else {
				oControl.detachEvent(sEventType, this._closeOnInteraction, this);
			}
		}, this);

		// Call preprocessor function, if any
		if (typeof oCtrlConfig.postProcess === "function") {
			oCtrlConfig.postProcess.call(this.oControlsManager, oControl);
		}

		oControl.removeStyleClass("sapMOTAPHidden");

		// It is important to explicitly destroy the control from the popover's DOM when using associations, because the toolbar will render it again and there will be a DOM duplication side effect
		oControl.$().remove();

		return this;
	};

	/**
	 * Many of the controls that enter the popover attach this function to some of their interaction events, such as button click, select choose, etc...
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._closeOnInteraction = function(oControl) {
		var oLayoutData = oControl.getLayoutData();

		if (!oLayoutData || !(oLayoutData instanceof OverflowToolbarLayoutData) || oLayoutData.getCloseOverflowOnInteraction()) {
			this.close();
		}
	};

	/**
	 * Creates a hash of the ids of the controls in the content association, f.e. "__button1.__button2.__button3"
	 * Useful to check if the same controls are in the popover in the same order compared to a point in the past
	 * @returns {*|string|!Array.<T>}
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._getContentIdsHash = function () {
		return this._getAllContent().join(".");
	};


	/**
	 * Recalculate the margin offsets so the Popover will never cover the control that opens it.
	 * Overrides the popovers placement rules only for PlacementType.Top
	 *
	 * @param {sap.m.PlacementType} sCalculatedPlacement Calculated placement of the Popover
	 * @param {object} oPosParams used to calculate actual values for the screen margins, so the Popover will never cover the Opener control or goes outside of the viewport
	 * @override
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._recalculateMargins = function (sCalculatedPlacement, oPosParams) {
		if (sCalculatedPlacement !== PlacementType.Top){
			return Popover.prototype._recalculateMargins.apply(this, arguments);
		}

		oPosParams._fMarginBottom = oPosParams._fDocumentHeight - oPosParams._$parent.offset().top + this._arrowOffset + oPosParams._fOffsetY;
	};

	/**
	 * Returns the content from the aggregation and association combined
	 * @returns {(Array.<T>|string|*|!Array)}
	 * @private
	 */
	OverflowToolbarAssociativePopover.prototype._getAllContent = function () {
		var aAssociatedContent = this.getAssociatedContent().map(function(sId) {
			return sap.ui.getCore().byId(sId);
		});

		if (this.getPlacement() === PlacementType.Top) {
			aAssociatedContent.reverse();
		}

		return this.getContent().concat(aAssociatedContent);
	};

	/**
	 * Friendly function to be used externally to get the calculated popover position, if the position is not
	 * calculated yet, calling _calcPlacment() will force the popover to calculate it
	 * @returns {Popover._oCalcedPos|*}
	 */
	OverflowToolbarAssociativePopover.prototype.getCurrentPosition = function() {
		if (!this._oCalcedPos) {
			this._calcPlacement();
		}
		return this._oCalcedPos;
	};

	function fnCapitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	return OverflowToolbarAssociativePopover;

});