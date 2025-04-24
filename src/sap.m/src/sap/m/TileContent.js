/*!
 * ${copyright}
 */

sap.ui.define(['./library', "sap/base/i18n/Localization", 'sap/ui/core/library', 'sap/ui/core/Control', './TileContentRenderer', 'sap/ui/core/Lib', 'sap/m/Button'],
	function(library, Localization, Core, Control, TileContentRenderer, CoreLib, Button) {
	"use strict";

	var Priority = library.Priority;
	var LoadState = library.LoadState;
	var GenericTileMode = library.GenericTileMode;
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new sap.m.TileContent control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class This control is used within the GenericTile control.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34.0
	 *
	 * @public
	 * @alias sap.m.TileContent
	 */
	var TileContent = Control.extend("sap.m.TileContent", /** @lends sap.m.TileContent.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * The footer text of the tile.
				 */
				"footer" : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * The semantic color of the footer.
				 * @since 1.44
				 */
				"footerColor" : {type : "sap.m.ValueColor", group : "Appearance", defaultValue : "Neutral"},

				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				"unit" : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Disables control if true.
				 */
				"disabled" : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Frame types: 1x1, 2x1, and auto.
				 */
				"frameType" : {type : "sap.m.FrameType", group : "Appearance", defaultValue : "Auto"},

				/**
				 * Adds a priority badge before the content. Works only in Generic Tiles in
				 * ActionMode or Article Mode containing NewsContent.
				 * @since 1.96
				 */
				"priority" : {type: "sap.m.Priority", group: "Misc", defaultValue: Priority.None},

				/**
				 * Sets the Text inside the Priority badge in Generic Tile. Works only in Generic Tiles in
				 * ActionMode or Article Mode containing NewsContent.
				 * @since 1.103
				 */
				"priorityText" : {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The load status.
				 * @since 1.100.0
				 */
				"state": {type: "sap.m.LoadState", group: "Misc", defaultValue: LoadState.Loaded}
			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * The switchable view that depends on the tile type.
				 */
				"content" : {type : "sap.ui.core.Control", multiple : false, bindable : "bindable"}
			}
		},

		renderer: TileContentRenderer
	});

	/* --- Lifecycle methods --- */

	TileContent.prototype.init = function() {
		this._bRenderFooter = true;
		this._bRenderContent = true;
		this._bStateSetManually = false;
	};

	TileContent.prototype.onBeforeRendering = function() {
		var sState = this.mProperties.hasOwnProperty("state");
		if (sState && !this._bStateSetManually) {
			if (this.getParent() && this.getParent().isA("sap.m.GenericTile")) {
				if (this.getParent().getState() === LoadState.Failed) {
					this.setState(LoadState.Loaded);
				} else if (this.getParent().getState() === LoadState.Disabled) {
					this.setState(LoadState.Loaded);
					this.setDisabled(this.getState() === LoadState.Disabled);
				}
			}
		} else {
			if (this.getParent() && this.getParent().isA("sap.m.GenericTile")) {
				if (this.getParent().getState() === LoadState.Failed) {
					this.setState(LoadState.Loaded);
				} else if (this.getParent().getState() === LoadState.Disabled) {
					this.setState(LoadState.Loaded);
					this.setDisabled(this.getState() === LoadState.Disabled);
				} else {
					this.setState(this.getParent().getState());
				}
			}
			this._bStateSetManually = true;
		}

		if (this.getContent() && this._oDelegate) {
			if (this.getDisabled()) {
				this.getContent().addDelegate(this._oDelegate);
			} else {
				this.getContent().removeDelegate(this._oDelegate);
			}
		}
	};

	/**
	 * Handler for after rendering
	 */
	TileContent.prototype.onAfterRendering = function() {
		var oContent = this.getContent();
		if (oContent) {
			const oParent = this.getParent();
            if (oParent && oParent.isA("sap.m.GenericTile") ) {
			oParent._applyCssStyle(this);
		}
			var thisRef = this.$();
			var aTooltipEments = thisRef.find("*");
			// tooltip of the entire tile
			var sTileToolTip = thisRef.attr("title") || "";
			// tooltip of the content if any
			var sCntTooltip = oContent.getTooltip_AsString() || "";
			// if both the tooltips are same, make tile tooltip as null
			if (sTileToolTip === sCntTooltip) {
				sTileToolTip = "";
			}
			var sInnerToolTip = '';
			// looping through all the inner elements to concatenate
			// their tooltips
			aTooltipEments.toArray().forEach(function(el){
				if (el.title) {
						sInnerToolTip = sInnerToolTip.concat(el.title + " ");
					}
				});
				// if inner tooltips exist, then concatenate with the content tooltip
				if (sInnerToolTip.trim() !== 0) {
					sCntTooltip = sCntTooltip + " " + sInnerToolTip;
				}
				if (sCntTooltip && sCntTooltip.trim().length !== 0) {
					if (this._getFooterText().trim() !== 0) {
						sCntTooltip = sCntTooltip + "\n" + this._getFooterText();
					}
					// if tile tooltip exists concatenate tile tooltip
					// and content tooltip with a newline
					sTileToolTip.trim().length !== 0 ?
						thisRef.attr("title", sTileToolTip + "\n" + sCntTooltip) :
						thisRef.attr("title",  sCntTooltip);
				}

				//It applies a style class to the elements inside the FormattedText
				if (this.getParent() && this.getParent().isA("sap.m.ActionTile") && this.getContent().isA("sap.m.FormattedText") && this.getContent().getDomRef()) {
					this._applyStyleClassesOnContent(this.getContent().getDomRef());
				}

			// removing all inner elements tooltip om every mouse enter
			aTooltipEments.removeAttr("title").off("mouseenter");
		}
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the ContentType
	 * @private
	 * @returns {string} The ContentType text
	 */
	TileContent.prototype._getContentType = function() {
		if (this.getContent()) {
			var sContentType = this.getContent().getMetadata().getName();
			if (sContentType === "sap.m.NewsContent" || sContentType === "sap.suite.ui.commons.NewsContent") {
				return "News";
			}
		}
	};

	/**
	 * Returns the Footer text
	 * @private
	 * @returns {string} The Footer text
	 */
	TileContent.prototype._getFooterText = function() {
		var resourceBundle = CoreLib.getResourceBundleFor('sap.m');
		var sFooter = this.getFooter();
		var sUnit = this.getUnit();
		if (sUnit) {
			if (sFooter) {
				if (Localization.getRTL()) {
					return resourceBundle.getText('TILECONTENT_FOOTER_TEXT', [sFooter, sUnit]);
				} else {
					return resourceBundle.getText('TILECONTENT_FOOTER_TEXT', [sUnit, sFooter]);
				}
			} else {
				return sUnit;
			}
		} else {
			return sFooter;
		}
	};

	/**
	 * Returns the Alttext
	 *
	 * @returns {string} The AltText text
	 */
	TileContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		var oContent = this.getContent();
		var oParent = this.getParent();
		var sPriorityText = this.getPriorityText();
		if (sPriorityText && this.getPriority() !== Priority.None){
			sAltText += sPriorityText;
			bIsFirst = false;
		}
		if (oContent && oContent.getVisible()) {
			var oContentDom = oContent.getDomRef();
			if (oContent.getAltText) {
				sAltText += oContent.getAltText();
				bIsFirst = false;
			} else if (oContent.getTooltip_AsString()) {
				sAltText += oContent.getTooltip_AsString();
				bIsFirst = false;
			} else if (oParent && oParent.isA("sap.m.ActionTile") && oContentDom) {
				sAltText += (bIsFirst ? "" : "\n") + this._getInnerText(oContentDom);
				bIsFirst = false;
			} else if (oParent && oParent.isA("sap.m.GenericTile") && oParent.getMode() === GenericTileMode.ActionMode) {
				if (oContent.isA("sap.m.Text")){
					sAltText += (bIsFirst ? "" : "\n") + oContent.getText();
					bIsFirst = false;
				} else if (oContentDom && oContent.isA("sap.m.FormattedText")) {
					sAltText += (bIsFirst ? "" : "\n") + oContentDom.innerText;
					bIsFirst = false;
				}
			}
		}
		if (this.getUnit()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getUnit();
			bIsFirst = false;
		}

		if (this.getFooter()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getFooter();
		}
		return sAltText;
	};

	/**
	 * Fetches the text within the tile content when rendered inside an ActionTile
	 * @param {Element} oContentDom It gives the control inside the tile content
	 * @returns {string} Returns the text inside the tile content when wrapped around a ActionTile
	 * @private
	 */
	TileContent.prototype._getInnerText = function(oContentDom) {
		var sAriaTooltipText = "";
		var aHTMLCollection = [].slice.call(oContentDom.children);
		aHTMLCollection.forEach(function(oElement,iIndex) {
			sAriaTooltipText += (oElement.innerText + "\n");
		});
		return sAriaTooltipText.trim();
	};

	TileContent.prototype.getTooltip_AsString = function() { //eslint-disable-line
		var sTooltip = this.getTooltip();
		var sAltText = "";
		if (typeof sTooltip === "string" || sTooltip instanceof String) {
			return sTooltip;
		}
		sAltText = this.getAltText();
		return sAltText ? sAltText : "";
	};

	/**
	 * Setter for protected property to enable or disable footer rendering. This function does not invalidate the control.
	 * @param {boolean} value Determines whether the control's footer is rendered or not
	 * @returns {this} this to allow method chaining
	 * @protected
	 */
	TileContent.prototype.setRenderFooter = function(value) {
		this._bRenderFooter = value;
		return this;
	};

	/**
	 * Setter for protected property to enable or disable content rendering. This function does not invalidate the control.
	 * @param {boolean} value Determines whether the control's content is rendered or not
	 * @returns {this} this To allow method chaining
	 * @protected
	 */
	TileContent.prototype.setRenderContent = function(value) {
		this._bRenderContent = value;
		return this;
	};

	/**
	 * This control applies the style class if there is a <br> tag inside a <p> tag
	 * @param {Object} oContent Determines whether the control's content is rendered or not
	 * @private
	 */
	 TileContent.prototype._applyStyleClassesOnContent = function(oContent) {
		var aElements = this._filterElements(oContent.childNodes);
		aElements.forEach(function(oElement) {
			var bIsPTagWithBreak = oElement.tagName === "P" && oElement.innerHTML.includes("br");
			if (bIsPTagWithBreak) {
				oElement.classList.add("sapMbrPresent");
			}
		});
	};

	/**
	 * Filters the element that has a nodetype one
	 * @param {object} oChildElements It displays all the ChildElements inside the formattedText
	 * @returns {string} Returns the elements that has a nodeType one
	 * @private
	 */
	TileContent.prototype._filterElements = function(oChildElements) {
		return [].slice.call(oChildElements).filter(function(oElement) {
			return oElement.nodeType === 1;
		});
	};

	/**
	 * Sets the priority of the tile content.
	 *
	 * @param {sap.m.Priority} sPriority - The priority level.
	 * @returns {this} Reference to the current instance for method chaining.
	 * @public
	 */
	TileContent.prototype.setPriority = function(sPriority) {
		var oPriorityBadge = this._getPriorityBadge();
		oPriorityBadge?.setType(this._getPriorityButtonType(sPriority));
		oPriorityBadge?.setIcon(this._getPriorityBadgeIcon(sPriority));

		this.setProperty("priority", sPriority);
		return this;
	};

	/**
	 * Sets the text for the priority badge.
	 *
	 * @param {string} sPriorityText - The text to be displayed on the badge.
	 * @returns {this} Reference to the current instance for method chaining.
	 * @public
	 */
	TileContent.prototype.setPriorityText = function(sPriorityText) {
		var oPriorityBadge = this._getPriorityBadge();
		oPriorityBadge?.setText(sPriorityText);
		oPriorityBadge?.setTooltip(sPriorityText);

		this.setProperty("priorityText", sPriorityText);
		return this;
	};

	/**
	 * Determines the button type based on the given priority.
	 *
	 * @private
	 * @param {sap.m.Priority} sPriority - The priority level.
	 * @returns {sap.m.ButtonType} The button type corresponding to the priority.
	 */
	TileContent.prototype._getPriorityButtonType = function(sPriority) {
		switch (sPriority) {
			case Priority.VeryHigh:
			case Priority.High:
				return ButtonType.Reject;
			case Priority.Medium:
				return ButtonType.Attention;
			default:
				return ButtonType.Default;
		}
	};

	/**
	 * Determines the badge icon based on the given priority.
	 *
	 * @private
	 * @param {sap.m.Priority} sPriority - The priority level.
	 * @returns {string} The icon URI corresponding to the priority.
	 */
	TileContent.prototype._getPriorityBadgeIcon = function(sPriority) {
		switch (sPriority) {
			case Priority.VeryHigh:
			case Priority.High:
				return "sap-icon://alert";
			case Priority.Medium:
				return "sap-icon://high-priority";
			default:
				return "sap-icon://information";
		}
	};

	/**
	 * Fetches or creates the priority badge button based on the current priority and priority text.
	 *
	 * @private
	 * @returns {sap.m.Button|null} The priority badge button, or null if no priority is set.
	 */
	TileContent.prototype._getPriorityBadge = function() {
		var sPriority = this.getPriority();
		var sPriorityText = this.getPriorityText();

		if (sPriority && sPriority !== Priority.None && sPriorityText) {
			if (!this._priorityBadge) {
				this._priorityBadge = new Button(this.getId() + "-priority", {
					type: this._getPriorityButtonType(sPriority),
					icon: this._getPriorityBadgeIcon(sPriority),
					text: sPriorityText,
					tooltip: sPriorityText,
					width: "auto"
				}).addStyleClass("sapUiSizeCompact sapMGTPriorityBadge");
				this._priorityBadge._bExcludeFromTabChain = true;
				this.addDependent(this._priorityBadge);
			}

			return this._priorityBadge;
		}
	};

	return TileContent;
});
