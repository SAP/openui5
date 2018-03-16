/*!
 * ${copyright}
 */

/**
 * Provides a private class <code>sap.f.semantic.SemanticShareMenu</code>.
 */
sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/ui/base/EventProvider",
	"sap/m/library",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarLayoutData",
	"./SemanticContainer"
], function(
	IconPool,
	EventProvider,
	mobileLibrary,
	OverflowToolbarButton,
	OverflowToolbarLayoutData,
	SemanticContainer) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	* Constructor for a <code>sap.f.semantic.SemanticShareMenu</code>.
	*
	* @private
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticShareMenu
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticShareMenu = SemanticContainer.extend("sap.f.semantic.SemanticShareMenu", {
		constructor : function(oContainer, oParent) {
			SemanticContainer.call(this, oContainer, oParent);

			this._aShareMenuActions = [];
			this._aCustomShareActions = [];

			this._setMode(SemanticShareMenu._Mode.initial);
		}
	});

	/*
	* Static member
	*/
	SemanticShareMenu._Mode = {
		/**
		* In <code>initial</code> mode, the menu is empty and hidden.
		*/
		initial: "initial",

		/**
		* In "menu" mode, the menu consists of:
		* (1) an actionSheet containing all of the menu items and
		* (2) a dedicated button that only opens the ShareMenu.
		*/
		menu: "menu"
	};

	/*
	* CUSTOM SHARE ACTIONS aggregation methods.
	*/

	SemanticShareMenu.prototype.addCustomAction = function(oCustomControl) {
		this._onControlAdded(oCustomControl);

		this._callContainerAggregationMethod("insertButton", oCustomControl, this._getCustomActionInsertIndex());
		this._aCustomShareActions.push(oCustomControl);
		return this;
	};

	SemanticShareMenu.prototype.insertCustomAction = function(oCustomControl, iIndex) {
		this._onControlAdded(oCustomControl);

		this._callContainerAggregationMethod("insertButton", oCustomControl, this._getCustomActionInsertIndex(iIndex));
		this._aCustomShareActions.splice(iIndex, 0, oCustomControl);
		return this;
	};

	SemanticShareMenu.prototype.getCustomActions = function() {
		return this._aCustomShareActions;
	};

	SemanticShareMenu.prototype.indexOfCustomAction = function(oCustomControl) {
		return this._aCustomShareActions.indexOf(oCustomControl);
	};

	SemanticShareMenu.prototype.removeCustomAction = function(oCustomControl) {
		var vResult = this._callContainerAggregationMethod("removeButton", oCustomControl);
		this._aCustomShareActions.splice(this._aCustomShareActions.indexOf(oCustomControl), 1);
		this._onControlRemoved();
		return vResult;
	};

	SemanticShareMenu.prototype.removeAllCustomActions = function() {
		var aResult = [];

		this._aCustomShareActions.forEach(function(oCustomControl){
			var vResult = this._callContainerAggregationMethod("removeButton", oCustomControl);
			if (vResult) {
				aResult.push(oCustomControl);
			}
		}, this);

		this._aCustomShareActions = [];
		this._onControlRemoved();
		return aResult;
	};

	SemanticShareMenu.prototype.destroyCustomActions = function() {
		this.removeAllCustomActions(true).forEach(
			function(oCustomControl){
				oCustomControl.destroy();
			});

		return this;
	};


	/*
	* SEMANTIC SHARE MENU ACTIONS
	*/

	/*
	* Adds a <code>sap.f.semantic.SemanticControl</code> to the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticShareMenu}
	*/
	SemanticShareMenu.prototype.addContent = function (oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);

		this._onControlAdded(oControl);
		this._aShareMenuActions.push(oSemanticControl);
		this._preProcessOverflowToolbarButton(oControl);
		this._callContainerAggregationMethod("insertButton", oControl, this._getSemanticActionInsertIndex(oSemanticControl));
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticShareMenu.prototype.removeContent = function (oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);

		this._callContainerAggregationMethod("removeButton", oControl);
		this._aShareMenuActions.splice(this._aShareMenuActions.indexOf(oSemanticControl), 1);
		this._postProcessOverflowToolbarButton(oSemanticControl);
		this._onControlRemoved();
		return this;
	};

	/*
	 * Destroys all the actions - custom and semantic
	 * and cleans all the references in use.
	 *
	 * @returns {sap.f.semantic.SemanticShareMenu}
	 */
	SemanticShareMenu.prototype.destroy = function() {
		this._oShareMenuBtn = null;
		this._aShareMenuActions = null;
		this._aCustomShareActions = null;

		return SemanticContainer.prototype.destroy.call(this);
	};

	/*
	* PRIVATE METHODS
	*/

	/*
	* Returns the current mode - <code>initial</code>, <code>button</code> or <code>actionSheet</code>.
	*
	* @returns {String}
	*/
	SemanticShareMenu.prototype._getMode = function() {
		return this._mode;
	};


	/*
	 * Sets the <code>ShareMenu</code> mode - <code>initial</code>, <code>button</code> or <code>actionSheet</code>.
	 *
	 * @param {String} sMode
	 * @returns {sap.f.semantic.SemanticShareMenu}
	 */
	SemanticShareMenu.prototype._setMode = function (sMode) {
		if (this._getMode() === sMode) {
			return this;
		}

		if (sMode === SemanticShareMenu._Mode.initial) {

			if (this._getMode()) {
				this._fireContentChanged(true); // the ShareMenu is empty.
			}

			this._mode = SemanticShareMenu._Mode.initial;
			return this;
		}

		if (sMode === SemanticShareMenu._Mode.menu) {
			this._mode = SemanticShareMenu._Mode.menu;
			this._fireContentChanged(false); // the ShareMenu is not empty anymore.
		}

		return this;
	};

	/*
	* Fires an internal event to notify that the <code>ShareMenu</code> content has been changed.
	*
	* @private
	*/
	SemanticShareMenu.prototype._fireContentChanged = function (bEmpty) {
		EventProvider.prototype.fireEvent.call(this._getParent(), "_shareMenuContentChanged", {"bEmpty" : bEmpty});
	};


	/*
	* Retrieves the <code>ShareMenu</code> button.
	*
	* @returns {sap.m.Button}
	*/
	SemanticShareMenu.prototype._getShareMenuButton = function() {
		var oContainer = this._getContainer();

		if (!this._oShareMenuBtn) {
			this._oShareMenuBtn = new OverflowToolbarButton(oContainer.getId() + "-shareButton", {
				icon: IconPool.getIconURI("action"),
				tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.f").getText("SEMANTIC_CONTROL_ACTION_SHARE"),
				layoutData: new OverflowToolbarLayoutData({
					closeOverflowOnInteraction: false
				}),
				text: sap.ui.getCore().getLibraryResourceBundle("sap.f").getText("SEMANTIC_CONTROL_ACTION_SHARE"),
				type: ButtonType.Transparent,
				press: function () {
					oContainer.openBy(this._oShareMenuBtn);
				}.bind(this)
			});

			this._oShareMenuBtn.addEventDelegate({
				onAfterRendering: function() {
					this._oShareMenuBtn.$().attr("aria-haspopup", true);
				}.bind(this)
			}, this);
		}

		return this._oShareMenuBtn;
	};

	/*
	* Determines the insert index of the custom controls to be added.
	*
	* @param {Number} iIndex
	* @returns {Number}
	*/
	SemanticShareMenu.prototype._getCustomActionInsertIndex = function(iIndex) {
		var iCustomActionsCount = this._aCustomShareActions.length;

		if (iIndex === undefined) {
			return this._aShareMenuActions.length + iCustomActionsCount;
		}

		iIndex = iIndex >= iCustomActionsCount ? iCustomActionsCount : iIndex;
		iIndex += this._aShareMenuActions.length;
		return iIndex;
	};

	/*
	* Determines the insert index of the semantic controls to be added.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {Number}
	*/
	SemanticShareMenu.prototype._getSemanticActionInsertIndex = function(oSemanticControl) {
		this._aShareMenuActions.sort(this._sortControlByOrder.bind(this));
		return this._aShareMenuActions.indexOf(oSemanticControl);
	};

	/*
	 * Returns <code>false</code>, if the current mode is <code>Initial</code>,
	 * indicating that the control will be added in the <code>SemanticTitle</code> as a base button
	 * and preventing adding it to the container.
	 * Otherwise, it returns <code>true</code>.
	 *
	 * The method is called after new control has been added
	 * in order to update the <code>ShareMenu</code> mode.
	 *
	 * @param {sap.f.semantic.SemanticControl} oControl
	 * @returns {Boolean}
	 */
	SemanticShareMenu.prototype._onControlAdded = function(oControl) {
		if (this._isInitialMode()) {
			this._setMode(SemanticShareMenu._Mode.menu, oControl);
		}
	};

	/*
	 * The method is called after a control has been removed
	 * in order to update the <code>ShareMenu</code> mode.
	 *
	 * @returns {Boolean}
	 */
	SemanticShareMenu.prototype._onControlRemoved = function() {
		var iActions = this._aShareMenuActions.length,
			iCustomActions = this._aCustomShareActions.length,
			bEmpty = (iActions + iCustomActions) === 0;

		if (this._isMenuMode() && bEmpty) {
			this._setMode(SemanticShareMenu._Mode.initial);
		}
	};


	/**
	* Runs before adding a button to the action sheet.
	* If the button is OverflowToolbarButton, it is made to show icon and text.
	*
	* @param oButton
	* @private
	*/
	SemanticShareMenu.prototype._preProcessOverflowToolbarButton = function(oButton) {
		if (oButton instanceof OverflowToolbarButton) {
			oButton._bInOverflow = true;
		}
	};

	/**
	* Runs after a button has been removed from the action sheet.
	* If the button is OverflowToolbarButton, it is made to only show an icon only.
	*
	* @param oButton
	* @private
	*/
	SemanticShareMenu.prototype._postProcessOverflowToolbarButton = function(oButton) {
		if (oButton instanceof OverflowToolbarButton) {
			delete oButton._bInOverflow;
		}
	};

	SemanticShareMenu.prototype._isInitialMode = function() {
		return this._getMode() === SemanticShareMenu._Mode.initial;
	};

	SemanticShareMenu.prototype._isMenuMode = function() {
		return this._getMode() === SemanticShareMenu._Mode.menu;
	};

	return SemanticShareMenu;

});