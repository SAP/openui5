/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/semantic/SemanticType", "sap/m/semantic/SemanticPage",  "sap/m/semantic/ShareMenuPage", "sap/m/OverflowToolbarLayoutData", "sap/ui/core/InvisibleText", "sap/m/MessagePopover", "sap/m/MessagePopoverItem"], function (SemanticType, SemanticPage, ShareMenuPage, OverflowToolbarLayoutData, InvisibleText, MessagePopover, MessagePopoverItem) {
	"use strict";

	/**
	 * Constructor for a new SemanticControl.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A semantic control is an abstraction for either a {@link sap.m.semantic.SemanticButton} or {@link sap.m.semantic.SemanticSelect} ,
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticControl
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticControl = sap.ui.core.Element.extend("sap.m.semantic.SemanticControl", /** @lends sap.m.semantic.SemanticControl.prototype */ {
		metadata: {

			"abstract": true,

			properties: {

				/**
				 * The type of the control {@link sap.m.semantic.SemanticType}
				 */
				type: {
					type: "sap.m.semantic.SemanticType",
					group: "Appearance"
				},

				/**
				 * See {@link sap.ui.core.Control#visible}
				 */
				visible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			},

			aggregations: {

				/**
				 * The internal control instance, that is abstracted by the semantic control.
				 * Can be {@link sap.m.Button}, {@link sap.m.OverflowButton} or {@link sap.m.Select}
				 */
				_control: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		}
	});

	SemanticControl.prototype.setProperty = function (key, value, bSuppressInvalidate) {

		if (!this.getMetadata().getProperties()[key]
				&& !SemanticControl.getMetadata().getProperties()[key]) {
			jQuery.sap.log.error("unknown property: " + key, this);
			return this;
		}

		if ((key === "type") && value) {

			if (value !== this.getType()) {
				this._bTypeChanged = true;
				sap.ui.core.Element.prototype.setProperty.apply(this, arguments);
				this._getControl().applySettings(this._getConfiguration().getSettings());
				this.fireEvent("_change:type");
			}

			return this;
		}

		this._getControl().setProperty(key, value, bSuppressInvalidate);

		return this;
	};

	SemanticControl.prototype.getProperty = function (key) {

		if (key === 'type') {
			return sap.ui.core.Control.prototype.getProperty.call(this, key);
		}

		return this._getControl().getProperty(key);
	};

	SemanticControl.prototype.updateAggregation = function (sName) {
		this._getControl().updateAggregation(sName);
	};

	SemanticControl.prototype.refreshAggregation = function (sName) {
		this._getControl().refreshAggregation(sName);
	};

	SemanticControl.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === '_control') {
			return sap.ui.base.ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		}
		return this._getControl().setAggregation(sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		if (sAggregationName === '_control') {
			return sap.ui.base.ManagedObject.prototype.getAggregation.call(this, sAggregationName, oDefaultForCreation);
		}
		return this._getControl().getAggregation(sAggregationName, oDefaultForCreation);
	};

	SemanticControl.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		return this._getControl().indexOfAggregation(sAggregationName, oObject);
	};

	SemanticControl.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		return this._getControl().insertAggregation(sAggregationName, oObject, iIndex, bSuppressInvalidate);
	};

	SemanticControl.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		return this._getControl().addAggregation(sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.removeAggregation = function (sAggregationName, vObject, bSuppressInvalidate) {
		return this._getControl().removeAggregation(sAggregationName, vObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._getControl().removeAllAggregation(sAggregationName, bSuppressInvalidate);
	};

	SemanticControl.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._getControl().destroyAggregation(sAggregationName, bSuppressInvalidate);
	};

	SemanticControl.prototype.bindAggregation = function (sName, oBindingInfo) {
		return this._getControl().bindAggregation(sName, oBindingInfo);
	};

	SemanticControl.prototype.unbindAggregation = function (sName, bSuppressReset) {
		return this._getControl().unbindAggregation(sName, bSuppressReset);
	};

	SemanticControl.prototype.clone = function (sIdSuffix, aLocalIds) {

		var oClone = sap.ui.core.Element.prototype.clone.apply(this, arguments);

		// need to clone the private oControl as well
		var oPrivateControlClone = this._getControl().clone(sIdSuffix, aLocalIds);

		oClone.setAggregation('_control', oPrivateControlClone);
		return oClone;
	};
	
	/**
	 * Implementation of a commonly used function that adapts sap.ui.core.Element
	 * to provide dom reference for opening popovers
	 * @ return the dom reference of the actual wrapped control
	 * @ public
	 */
	SemanticControl.prototype.getPopupAnchorDomRef = function() {
		return this._getControl().getDomRef();
	};

	SemanticControl.prototype._getConfiguration = function () {
		return this._oTypeConfigs[this.getType()];
	};

	SemanticControl.prototype._onPageStateChanged = function (oEvent) {
		this._updateState(oEvent.sId);
	};

	SemanticControl.prototype._updateState = function (oStateName) {

		if (this._getConfiguration() && this._getControl()) {
			var oSettings = this._getConfiguration().states[oStateName];
			if (oSettings) {
				this._getControl().applySettings(oSettings);
			}
		}
	};

	SemanticControl.prototype._oTypeConfigs = (function () { //TODO: set from outside?

		var oTypeConfigs = {},
			oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");


		/**
		 * A map of hidden text elements' ids that will be used for the screen reader support of semantic controls
		 * sType (of the semantic control) => sId (of the InvisibleText element holding the string)
		 * @type {{}}
		 * @private
		 */
		var _mInvisibleTexts = {};

		/**
		 * Creates (if not already created) and returns an invisible text element for screan reader support
		 * @param sType - the type of the control we want to get a label for
		 * @param sText - the text to be used
		 * @private
		 */
		var _ensureInvisibleText = function(sType, sText) {

			if (typeof _mInvisibleTexts[sType] === "undefined") {
				_mInvisibleTexts[sType] = new InvisibleText({
					text: sText
				}).toStatic().getId();
			}

			return _mInvisibleTexts[sType];
		};

		oTypeConfigs[SemanticType.Multiselect] = {
			type: SemanticType.Multiselect,
			position: SemanticPage.prototype._PositionInPage.headerRight,

			triggers: [{
				inState: SemanticPage._PageMode.display,
				triggers: SemanticPage._PageMode.multimode
			},

				{
					inState: SemanticPage._PageMode.multimode,
					triggers: SemanticPage._PageMode.display
				},

				{
					inState: SemanticPage._PageMode.edit,
					triggers: SemanticPage._PageMode.multimode
				}],

			getSettings: function() {
				return {
					icon: "sap-icon://multi-select",
					tooltip: oBundle.getText("SEMANTIC_CONTROL_MULTI_SELECT"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Multiselect, oBundle.getText("SEMANTIC_CONTROL_MULTI_SELECT"))
				};
			},

			states: {

				"display": {
					icon: "sap-icon://multi-select"
				},

				"multimode": {
					icon: "sap-icon://sys-cancel"
				}
			}
		};

		oTypeConfigs[SemanticType.Edit] = {
			type: SemanticType.Edit,
				position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
				triggers: SemanticPage._PageMode.edit,
				getSettings: function() {
			return {
				text: oBundle.getText("SEMANTIC_CONTROL_EDIT"),
				ariaLabelledBy: _ensureInvisibleText(SemanticType.Edit, oBundle.getText("SEMANTIC_CONTROL_EDIT")),
				type: sap.m.ButtonType.Emphasized,
				layoutData: new OverflowToolbarLayoutData({
					moveToOverflow: false,
					stayInOverflow: false
				})
			};
		},
		order: 0
	};

		oTypeConfigs[SemanticType.Save] = {
			type: SemanticType.Save,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticPage._PageMode.display,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_SAVE"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Save, oBundle.getText("SEMANTIC_CONTROL_SAVE")),
					type: sap.m.ButtonType.Emphasized
				};
			},
			order: 1
		};

		oTypeConfigs[SemanticType.Cancel] = {
			type: SemanticType.Cancel,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticPage._PageMode.display,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_CANCEL"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Cancel, oBundle.getText("SEMANTIC_CONTROL_CANCEL"))
				};
			},
			order: 2
		};

		oTypeConfigs[SemanticType.Approve] = {
			type: SemanticType.Approve,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_APPROVE"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Approve, oBundle.getText("SEMANTIC_CONTROL_APPROVE")),
					type: sap.m.ButtonType.Accept,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})};
			},
			order: 3
		};

		oTypeConfigs[SemanticType.Reject] = {
			type: SemanticType.Reject,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_REJECT"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Reject, oBundle.getText("SEMANTIC_CONTROL_REJECT")),
					type: sap.m.ButtonType.Reject,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			},
			order: 4
		};

		oTypeConfigs[SemanticType.Forward] = {
			type: SemanticType.Forward,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_FORWARD"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Forward, oBundle.getText("SEMANTIC_CONTROL_FORWARD")),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			order: 5
		};

		oTypeConfigs[SemanticType.OpenIn] = {
			type: SemanticType.OpenIn,
			position: SemanticPage.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_OPEN_IN"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.OpenIn, oBundle.getText("SEMANTIC_CONTROL_OPEN_IN"))
				};
			},
			order: 6
		};

		oTypeConfigs[SemanticType.Add] = {
			type: SemanticType.Add,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			triggers: SemanticPage._PageMode.edit,
			getSettings: function() {
				return {
					icon: "sap-icon://add",
					text: oBundle.getText("SEMANTIC_CONTROL_ADD"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_ADD"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Add, oBundle.getText("SEMANTIC_CONTROL_ADD"))
				};
			},
			order: 0,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.Favorite] = {
			type: SemanticType.Favorite,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: "sap-icon://favorite",
					text: oBundle.getText("SEMANTIC_CONTROL_FAVORITE"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FAVORITE"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Favorite, oBundle.getText("SEMANTIC_CONTROL_FAVORITE"))
				};
			},
			order: 1,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.Flag] = {
			type: SemanticType.Flag,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: "sap-icon://flag",
					text: oBundle.getText("SEMANTIC_CONTROL_FLAG"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FLAG"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Flag, oBundle.getText("SEMANTIC_CONTROL_FLAG"))
				};
			},
			order: 2,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.Sort] = {
			type: SemanticType.Sort,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: "sap-icon://sort",
					text: oBundle.getText("SEMANTIC_CONTROL_SORT"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SORT"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Sort, oBundle.getText("SEMANTIC_CONTROL_SORT")),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			order: 3,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.Filter] = {
			type: SemanticType.Filter,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: "sap-icon://filter",
					text: oBundle.getText("SEMANTIC_CONTROL_FILTER"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FILTER"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Filter, oBundle.getText("SEMANTIC_CONTROL_FILTER")),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			order: 4,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.Group] = {
			type: SemanticType.Group,
			position: SemanticPage.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: "sap-icon://group-2",
					text: oBundle.getText("SEMANTIC_CONTROL_GROUP"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_GROUP"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Group, oBundle.getText("SEMANTIC_CONTROL_GROUP")),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			order: 5,
			constraints: "IconOnly"
		};

		oTypeConfigs[SemanticType.SendEmail] = {
			type: SemanticType.SendEmail,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://email",
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_EMAIL"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SEND_EMAIL"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.SendEmail, oBundle.getText("SEMANTIC_CONTROL_SEND_EMAIL"))
				};
			},
			order: 0
		};

		oTypeConfigs[SemanticType.DiscussInJam] = {
			type: SemanticType.DiscussInJam,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://discussion-2",
					text: oBundle.getText("SEMANTIC_CONTROL_DISCUSS_IN_JAM"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_DISCUSS_IN_JAM"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.DiscussInJam, oBundle.getText("SEMANTIC_CONTROL_DISCUSS_IN_JAM"))
				};
			},
			order: 1
		};

		oTypeConfigs[SemanticType.ShareInJam] = {
			type: SemanticType.ShareInJam,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://share-2",
					text: oBundle.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.ShareInJam, oBundle.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"))
				};
			},
			order: 2
		};

		oTypeConfigs[SemanticType.SendMessage] = {
			type: SemanticType.SendMessage,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://discussion",
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_MESSAGE"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SEND_MESSAGE"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.SendMessage, oBundle.getText("SEMANTIC_CONTROL_SEND_MESSAGE"))
				};
			},
			order: 3
		};

		oTypeConfigs[SemanticType.SaveAsTile] = {
			type: SemanticType.SaveAsTile,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://add-favorite",
					text: oBundle.getText("SEMANTIC_CONTROL_SAVE_AS_TILE"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SAVE_AS_TILE"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.SaveAsTile, oBundle.getText("SEMANTIC_CONTROL_SAVE_AS_TILE"))
				};
			},
			order: 4
		};

		oTypeConfigs[SemanticType.Print] = {
			type: SemanticType.Print,
			position: ShareMenuPage.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: "sap-icon://print",
					text: oBundle.getText("SEMANTIC_CONTROL_PRINT"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_PRINT"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.Print, oBundle.getText("SEMANTIC_CONTROL_PRINT"))
				};
			},
			order: 5
		};

		oTypeConfigs[SemanticType.MessagesIndicator] = {
			type: SemanticType.MessagesIndicator,
			position: SemanticPage.prototype._PositionInPage.footerLeft,
			getSettings: function() {
				return {
					icon: "sap-icon://alert",
					text: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages.length || 0;
						}
					},
					tooltip: oBundle.getText("SEMANTIC_CONTROL_MESSAGES_INDICATOR"),
					ariaLabelledBy: _ensureInvisibleText(SemanticType.MessagesIndicator, oBundle.getText("SEMANTIC_CONTROL_MESSAGES_INDICATOR")),
					type: sap.m.ButtonType.Emphasized,
					press: function () {
						if (!this._messagePopover) {
							this._messagePopover = SemanticControl.prototype._createMessagePopover();
							this.addDependent(this._messagePopover);
						}
						this._messagePopover.toggle(this);
					},
					visible: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages && aMessages.length > 0;
						}
					},
					models: {message: sap.ui.getCore().getMessageManager().getMessageModel()},
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			}
		};

		SemanticControl.prototype._createMessagePopover = function () {
			return new MessagePopover({
				items: {
					path: "message>/",
					template: new MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					})
				}
			});
		};

		return oTypeConfigs;
	})();

	return SemanticControl;
}, /* bExport= */ false);
