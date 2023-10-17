/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarRenderer",
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarSeparator",
	"sap/m/library",
	"sap/ui/mdc/enums/ActionToolbarActionAlignment",
	"sap/ui/mdc/p13n/subcontroller/ActionToolbarController",
	"sap/m/p13n/Engine"
], function(OverflowToolbar, OverflowToolbarRenderer, ToolbarSpacer, ToolbarSeparator, mobileLibrary, ActionToolbarActionAlignment, ActionToolbarController, Engine) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	const OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	/**
	 * Constructor for a new ActionToolbar.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * The <code>ActionToolbar</code> control can be used in the {@link sap.ui.mdc.Chart Chart} and {@link sap.ui.mdc.Table Table}
	 * controls to display actions. The control handles key user adaptation and positioning of the actions depending on the given layout information.
	 * <b>Note:</b>
	 * The content aggregation of the control must not be used.
	 * @extends sap.m.OverflowToolbar
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.58
	 * @public
	 * @alias sap.ui.mdc.ActionToolbar
	 */

	const ActionToolbar = OverflowToolbar.extend("sap.ui.mdc.ActionToolbar", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/actiontoolbar/ActionToolbar.designtime",
			defaultAggregation: "actions",
			properties: {
				/**
				 * Determines whether the toolbar is used as header (e.g. for a table).
				 */
				useAsHeader: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Content shown at the begin of the toolbar (e.g. Title).
				 */
				begin: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Content shown between the title and actions on the toolbar.
				 */
				between: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Further actions in the toolbar.
				 */
				actions: {
					type: "sap.ui.mdc.actiontoolbar.ActionToolbarAction",
					multiple: true
				},

				/**
				 * Content at the end of the toolbar.
				 */
				end: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		renderer: OverflowToolbarRenderer
	});

	const aAggregations = [
		"begin",
		"between",
		"actions",
		"end"
	];

	const fnGetOverflowToolbarConfig = function() {
		const oConfig = {
			canOverflow: true,
			getCustomImportance: function() {
				return OverflowToolbarPriority.NeverOverflow;
			}
		};

		return oConfig;
	};

	ActionToolbar.prototype.init = function() {
		OverflowToolbar.prototype.init.apply(this, arguments);
		// Separator between begin (title) and between (variant) content of the toolbar.
		this._oBeginSeparator = new ToolbarSeparator({
			visible: false
		});
		this._oBeginSeparator.getOverflowToolbarConfig = fnGetOverflowToolbarConfig;
		// Separator between actions and end content of the toolbar.
		this._oEndActionsBeginSeparator = new ToolbarSeparator({
			visible: false
		});
		this._oEndActionsBeginSeparator.getOverflowToolbarConfig = fnGetOverflowToolbarConfig;
		// Separator between end and actions content of the toolbar.
		this._oEndActionsEndSeparator = new ToolbarSeparator({
			visible: false
		});
		this._oEndActionsEndSeparator.getOverflowToolbarConfig = fnGetOverflowToolbarConfig;
		// Spacer added to right align actions and end aggregation of the toolbar.
		this._oSpacer = new ToolbarSpacer();

		this.setUseAsHeader(true);

		Engine.getInstance().register(this, {
			controller: {
				actionsKey: new ActionToolbarController({control: this})
			}
		});
	};

	ActionToolbar.prototype.exit = function() {
		OverflowToolbar.prototype.exit.apply(this, arguments);
		if (this._oBeginSeparator) {
			this._oBeginSeparator.destroy();
		}
		if (this._oEndActionsBeginSeparator) {
			this._oEndActionsBeginSeparator.destroy();
		}
		if (this._oEndActionsEndSeparator) {
			this._oEndActionsEndSeparator.destroy();
		}
		if (this._oSpacer) {
			this._oSpacer.destroy();
		}
	};

	ActionToolbar.prototype.addAggregation = function(sAggregationName, oControl) {
		if (sAggregationName === "content") {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + this.getId() + "' must not be used.");
		}

		const aArguments = arguments;
		if (aAggregations.includes(sAggregationName)) {
			this._registerControlListener(oControl);
			this._resetAndInvalidateToolbar(false);

			if (oControl) {
				this._moveControlInSuitableCollection(oControl, this._getControlPriority(oControl));
			}

			this._informNewFlexibleContentAdded(oControl);

			const vContent = this._callToolbarMethod("addAggregation", aArguments);
			this._updateSeparators();

			return vContent;
		}

		return OverflowToolbar.prototype.addAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.destroyAggregation = function(sAggregationName) {
		if (sAggregationName === "content") {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + this.getId() + "' must not be used.");
		}

		if (aAggregations.includes(sAggregationName)) {
			const aContentToDelete = this.removeAllAggregation(sAggregationName);
			for (let i = 0; i < aContentToDelete.length; i++) {
				aContentToDelete[i].destroy();
			}
			this._updateSeparators();

			return this;
		}

		return OverflowToolbar.prototype.destroyAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.insertAggregation = function(sAggregationName, oControl, iIndex) {
		if (sAggregationName === "content") {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + this.getId() + "' must not be used.");
		}

		if (aAggregations.includes(sAggregationName)) {
			this._registerControlListener(oControl);
			this._resetAndInvalidateToolbar(false);

			if (oControl) {
				this._moveControlInSuitableCollection(oControl, this._getControlPriority(oControl));
			}

			this._informNewFlexibleContentAdded(oControl);

			const vContent = this._callToolbarMethod("insertAggregation", arguments);
			this._updateSeparators();

			return vContent;
		}

		return OverflowToolbar.prototype.insertAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.removeAllAggregation = function(sAggregationName) {
		if (sAggregationName === "content") {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + this.getId() + "' must not be used.");
		}

		return OverflowToolbar.prototype.removeAllAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.removeAggregation = function(sAggregationName, vObject) {
		if (sAggregationName === "content") {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + this.getId() + "' must not be used.");
		}

		if (aAggregations.includes(sAggregationName)) {
			const vContent = this._callToolbarMethod("removeAggregation", arguments);
			if (vContent) {
				this._getPopover().removeAssociatedContent(vContent.getId());
			}
			this._resetAndInvalidateToolbar(false);

			this._deregisterControlListener(vContent);
			this._removeContentFromControlsCollections(vContent);
			this._updateSeparators();

			return vContent;
		}

		return OverflowToolbar.prototype.removeAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.setUseAsHeader = function(bHeader) {
		this.setProperty("useAsHeader", bHeader, true);
		this.toggleStyleClass("sapMTBHeader-CTX", !!bHeader);
		return this;
	};

	ActionToolbar.prototype.getEndActionsBegin = function() {
		return this.getActionsWithLayoutInformation({
			aggregationName: "end",
			alignment: ActionToolbarActionAlignment.Begin
		});
	};

	ActionToolbar.prototype.getEndActionsEnd = function() {
		return this.getActionsWithLayoutInformation({
			aggregationName: "end",
			alignment: ActionToolbarActionAlignment.End
		});
	};

	ActionToolbar.prototype.getActionsWithLayoutInformation = function(oLayoutInformation) {
		return this.getActions().filter(function(oActionToolbarAction) {
			const oActionLayoutInformation = oActionToolbarAction.getLayoutInformation();
			return oActionLayoutInformation.aggregationName === oLayoutInformation.aggregationName && oActionLayoutInformation.alignment === oLayoutInformation.alignment;
		});
	};

	// According to visual designs currently no separator between actions and end content, only title separator is handled below
	/* Begin Title Separator handling */
	ActionToolbar.prototype.onAfterRendering = function() {
		OverflowToolbar.prototype.onAfterRendering.apply(this, arguments);
		this._updateSeparators();
	};

	ActionToolbar.prototype._onContentPropertyChangedOverflowToolbar = function(oEvent) {
		if (this._bIsBeingDestroyed) {
			return;
		}
		OverflowToolbar.prototype._onContentPropertyChangedOverflowToolbar.apply(this, arguments);
		if (oEvent.getParameter("name") === "visible" || oEvent.getParameter("name") === "width" && oEvent.getSource() != this._oBeginSeparator) {
			this._updateSeparators();
		}
	};

	ActionToolbar.prototype._hasVisible = function(aArray) {
		const aPopoverContent = this.getAggregation("_popover") ? this.getAggregation("_popover")._getAllContent() : [];

		const aVisibleContent = aArray.filter(function (oControl) {
			return aPopoverContent.indexOf(oControl) === -1;
		});
		return aVisibleContent.some(function(oControl) {
			// visible="true" and does not have "0px" width
			const bHasWidth = oControl.getWidth ? oControl.getWidth() !== "0px" : true;
			return oControl.getVisible() && bHasWidth;
		});
	};

	ActionToolbar.prototype._updateSeparators = function() {
		const bHasEnd = this._hasVisible(this.getEnd());

		if (this._oBeginSeparator) {
			const bHasBegin = this._hasVisible(this.getBegin());
			const bHasBetween = this._hasVisible(this.getBetween());
			this._oBeginSeparator.setVisible(bHasBegin && bHasBetween);
		}
		if (this._oEndActionsBeginSeparator) {
			const bHasEndActionsBegin = this._hasVisible(this.getEndActionsBegin());
			this._oEndActionsBeginSeparator.setVisible(bHasEnd && bHasEndActionsBegin);
		}
		if (this._oEndActionsEndSeparator) {
			const bHasEndActionsEnd = this._hasVisible(this.getEndActionsEnd());
			this._oEndActionsEndSeparator.setVisible(bHasEnd && bHasEndActionsEnd);
		}
	};

	/*
	* Overwrite generated functions to use internal array to look for aggregation
	*/
	ActionToolbar.prototype.indexOfContent = function(oObject) {
		return this.getContent().indexOf(oObject);
	};

	// Overwrite content aggregation functions
	ActionToolbar.prototype.getContent = function() {
		let aContent = this.getBegin();
		aContent.push(this._oBeginSeparator);
		aContent = aContent.concat(this.getBetween());
		aContent.push(this._oSpacer);
		aContent = aContent.concat(this.getEndActionsBegin());
		aContent.push(this._oEndActionsBeginSeparator);
		aContent = aContent.concat(this.getEnd());
		aContent.push(this._oEndActionsEndSeparator);
		aContent = aContent.concat(this.getEndActionsEnd());

		return aContent;
	};

	ActionToolbar.prototype.getCurrentState = function() {
		const aActions = [];
		let sId;

		this.getActions().forEach(function(oAction, iIndex) {
			sId = oAction && oAction.getId();
			if (oAction.getVisible()){
				aActions.push({
					name: sId,
					alignment: oAction.getLayoutInformation().alignment
				});
			}
		});

		return {
			items: aActions
		};
	};

	ActionToolbar.prototype.initPropertyHelper = function() {
		return Promise.resolve({
			getProperties: function() {

				const aItems = [];
				this.getActions().forEach(function(oAction){
					aItems.push({
						name: oAction.getId(),
						alignment: oAction.getLayoutInformation().alignment,
						label: oAction.getLabel(),
						visible: true
					});
				});

				return aItems;
			}.bind(this)
		});
	};

	return ActionToolbar;
});