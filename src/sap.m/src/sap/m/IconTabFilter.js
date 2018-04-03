/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabFilter.
sap.ui.define(['./library', 'sap/ui/core/Item',
		'sap/ui/core/Renderer', 'sap/ui/core/IconPool', 'sap/ui/core/InvisibleText', 'sap/ui/core/library', 'sap/ui/core/Control'],
	function(library, Item,
			Renderer, IconPool, InvisibleText, coreLibrary, Control) {
	"use strict";



	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;



	/**
	 * Constructor for a new IconTabFilter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a selectable item inside an IconTabBar.
	 *
	 * @extends sap.ui.core.Item
	 * @implements sap.m.IconTab
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabFilter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabFilter = Item.extend("sap.m.IconTabFilter", /** @lends sap.m.IconTabFilter.prototype */ { metadata : {

		interfaces : [
			"sap.m.IconTab",
			// The IconTabBar doesn't have renderer. The sap.ui.core.PopupInterface is used to indicate
			// that the IconTabFilter content is not rendered by the IconTabFilter, it is rendered by IconTabBar.
			"sap.ui.core.PopupInterface"
		],
		library : "sap.m",
		properties : {

			/**
			 * Represents the "count" text, which is displayed in the tab filter.
			 */
			count : {type : "string", group : "Data", defaultValue : ''},

			/**
			 * Enables special visualization for disabled filter (show all items).
			 * <b>Note:</b> You can use this property when you use <code>IconTabBar</code> as a filter.
			 * In order for it to be displayed correctly, the other tabs in the filter should consist of an icon, text and an optional count.
			 * It can be set to true for the first tab filter.
			 * You can find more detailed guidelines at https://experience.sap.com/fiori-design-web/icontabbar/#tabs-as-filters.
			 */
			showAll : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies the icon to be displayed for the tab filter.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : ''},

			/**
			 * Specifies the icon color.
			 *
			 * If an icon font is used, the color can be chosen from the icon colors (sap.ui.core.IconColor).
			 * Possible semantic colors are: Neutral, Positive, Critical, Negative.
			 * Instead of the semantic icon color the brand color can be used, this is named Default.
			 * Semantic colors and brand colors should not be mixed up inside one IconTabBar.
			 */
			iconColor : {type : "sap.ui.core.IconColor", group : "Appearance", defaultValue : IconColor.Default},

			/**
			 * If set to true, it sends one or more requests,
			 * trying to get the density perfect version of the image if this version of
			 * the image doesn't exist on the server. Default value is set to true.
			 *
			 * If bandwidth is key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Specifies whether the tab filter is rendered.
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies whether the icon and the texts are placed vertically or horizontally.
			 */
			design : {type : "sap.m.IconTabFilterDesign", group : "Appearance", defaultValue : IconTabFilterDesign.Vertical}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content displayed for this item (optional).
			 *
			 * If this content is set, it is displayed instead of the general content inside the IconTabBar.
			 * @since 1.15.0
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		},
		designTime: false
	}});

	/**
	 * Array of all available icon color CSS classes
	 *
	 * @private
	 */
	IconTabFilter._aAllIconColors = ['sapMITBFilterCritical', 'sapMITBFilterPositive', 'sapMITBFilterNegative', 'sapMITBFilterDefault', 'sapMITBFilterNeutral'];

	/**
	 * Lazy load icon tab filter image.
	 *
	 * @param {Array} aCssClassesToAdd Array of CSS classes, which will be added if the image needs to be created.
	 * @param {sap.ui.core.Control} oParent This element's parent
	 * @param {Array} aCssClassesToRemove All CSS clases, that oImageControl has and which are
	 * contained in this array are removed before adding the CSS classes listed in aCssClassesToAdd.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getImageControl = function(aCssClassesToAdd, oParent, aCssClassesToRemove) {
		var mProperties = {
			src : this.getIcon(),
			densityAware : this.getIconDensityAware(),
			useIconTooltip : false
		};
		if (mProperties.src) {
			this._oImageControl = ImageHelper.getImageControl(this.getId() + "-icon", this._oImageControl, oParent, mProperties, aCssClassesToAdd, aCssClassesToRemove);
		} else if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = null;
		}

		return this._oImageControl;
	};

	/**
	 * Function is called when exiting the element.
	 *
	 * @private
	 */
	IconTabFilter.prototype.exit = function(oEvent) {
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}

		if (Item.prototype.exit) {
			Item.prototype.exit.call(this, oEvent);
		}
	};

	IconTabFilter.prototype.invalidate = function() {
		var oIconTabHeader = this.getParent(),
			oIconTabBar,
			oObjectHeader;

		// invalidate the correct parent - IconTabHeader, IconTabBar or ObjectHeader
		if (!oIconTabHeader) {
			return;
		}

		oIconTabBar = oIconTabHeader.getParent();

		if (!(oIconTabBar instanceof sap.m.IconTabBar)) {
			oIconTabHeader.invalidate();
			return;
		}

		oObjectHeader = oIconTabBar.getParent();

		if (oObjectHeader instanceof sap.m.ObjectHeader) {
			// invalidate the object header to re-render IconTabBar content and header
			oObjectHeader.invalidate();
		} else {
			oIconTabBar.invalidate();
		}
	};

	IconTabFilter.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {

		// invalidate only the IconTabHeader if a property change
		// doesn't affect the IconTabBar content
		switch (sPropertyName) {
			case 'enabled':
			case 'textDirection':
			case 'text':
			case 'count':
			case 'showAll':
			case 'icon':
			case 'iconColor':
			case 'iconDensityAware':
			case 'design':
				if (this.getProperty(sPropertyName) === oValue) {
					return this;
				}
				Control.prototype.setProperty.call(this, sPropertyName, oValue, true);
				if (!bSuppressInvalidate) {
					var oIconTabHeader = this.getParent();
					if (oIconTabHeader instanceof sap.m.IconTabHeader) {
						oIconTabHeader.invalidate();
					}
				}
				break;
			default:
				Control.prototype.setProperty.apply(this, arguments);
				break;
		}

		return this;
	};

	/**
	 * If the IconTabFilter doesn't have a key, the function returns the ID of the IconTabFilter,
	 * so the IconTabBar can remember the selected IconTabFilter.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getNonEmptyKey = function () {

		// BCP: 1482007468
		var sKey = this.getKey();

		if (sKey) {
			return sKey;
		}

		return this.getId();
	};

	/**
	 * Renders this item in the IconTabHeader.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {int} visibleIndex the visible index within the parent control
	 * @param {int} visibleItemsCount the visible items count
	 * @protected
	 */
	IconTabFilter.prototype.render = function (rm, visibleIndex, visibleItemsCount) {
		var that = this;

		if (!that.getVisible()) {
			return;
		}

		var iconTabHeader = this.getParent(),
			iconTabBar = iconTabHeader.getParent(),
			hasIconTabBar = iconTabBar instanceof sap.m.IconTabBar,
			resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m'),
			ariaParams = 'role="tab"',
			id = that.getId(),
			count = that.getCount(),
			text = that.getText(),
			icon = that.getIcon(),
			design = that.getDesign(),
			iconColor = that.getIconColor(),
			isIconColorRead = iconColor === 'Positive' || iconColor === 'Critical' || iconColor === 'Negative',
			isHorizontalDesign = design === IconTabFilterDesign.Horizontal,
			isUpperCase = hasIconTabBar && iconTabBar.getUpperCase(),
			isTextOnly = iconTabHeader._bTextOnly,
			isInLine = iconTabHeader._bInLine || iconTabHeader.isInlineMode();

		if (hasIconTabBar) {
			ariaParams += ' aria-controls="' + iconTabBar.sId + '-content" ';
		}

		if (text.length ||
			count !== '' ||
			icon) {
			ariaParams += 'aria-labelledby="';
			var ids = [];

			if (text.length) {
				ids.push(id + '-text');
			}
			if (count !== '') {
				ids.push(id + '-count');
			}
			if (icon) {
				ids.push(id + '-icon');
			}
			if (isIconColorRead) {
				ids.push(id + '-iconColor');
			}

			ariaParams += ids.join(' ');
			ariaParams += '"';
		}

		rm.write('<div ' + ariaParams + ' ');

		if (visibleIndex !== undefined && visibleItemsCount !== undefined) {
			rm.writeAccessibilityState({
				posinset: visibleIndex + 1,
				setsize: visibleItemsCount
			});
		}

		rm.writeElementData(that);
		rm.addClass('sapMITBItem');

		if (!count) {
			rm.addClass('sapMITBItemNoCount');
		}

		if (isHorizontalDesign) {
			rm.addClass('sapMITBHorizontal');
		} else {
			rm.addClass('sapMITBVertical');
		}

		if (that.getShowAll()) {
			rm.addClass('sapMITBAll');
		} else {
			rm.addClass('sapMITBFilter');
			rm.addClass('sapMITBFilter' + iconColor);
		}

		if (!that.getEnabled()) {
			rm.addClass('sapMITBDisabled');
			rm.writeAttribute('aria-disabled', true);
		}

		rm.writeAttribute('aria-selected', false);

		var sTooltip = that.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped('title', sTooltip);
		}

		rm.writeClasses();
		rm.write('>');

		if (!isInLine) {
			rm.write('<div id="' + id + '-tab" class="sapMITBTab">');

			if (!that.getShowAll() || !icon) {
				if (isIconColorRead) {
					rm.write('<div id="' + id + '-iconColor" style="display: none;">' + resourceBundle.getText('ICONTABBAR_ICONCOLOR_' + iconColor.toUpperCase()) + '</div>');
				}

				rm.renderControl(that._getImageControl(['sapMITBFilterIcon', 'sapMITBFilter' + iconColor], iconTabHeader, IconTabFilter._aAllIconColors));
			}

			if (!that.getShowAll() && !icon && !isTextOnly) {
				rm.write('<span class="sapMITBFilterNoIcon"> </span>');
			}

			if (isHorizontalDesign && !that.getShowAll()) {
				rm.write('</div>');
				rm.write('<div class="sapMITBHorizontalWrapper">');
			}

			rm.write('<span id="' + id + '-count" ');
			rm.addClass('sapMITBCount');
			rm.writeClasses();
			rm.write('>');

			if (count === '' && isHorizontalDesign) {
				//this is needed for the correct placement of the text in the horizontal design
				rm.write('&nbsp;');
			} else {
				rm.writeEscaped(count);
			}

			rm.write('</span>');

			if (!isHorizontalDesign) {
				rm.write('</div>');
			}
		}

		if (text.length) {
			rm.write('<div id="' + id + '-text" ');
			rm.addClass('sapMITBText');
			// Check for upperCase property on IconTabBar
			if (isUpperCase) {
				rm.addClass('sapMITBTextUpperCase');
			}

			if (isInLine) {
				rm.writeAttribute('dir', 'ltr');
			}

			rm.writeClasses();
			rm.write('>');
			rm.writeEscaped(iconTabHeader._getDisplayText(that));
			rm.write('</div>');
		}

		if (!isInLine && isHorizontalDesign) {
			rm.write('</div>');
		}

		rm.write('<div class="sapMITBContentArrow"></div>');

		rm.write('</div>');
	};

	/**
	 * Renders this item in the IconTabSelectList.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.IconTabBarSelectList} selectList the select list in which this filter is rendered
	 * @param {int} visibleIndex the visible index within the parent control
	 * @param {int} visibleItemsCount the visible items count
	 * @protected
	 */
	IconTabFilter.prototype.renderInSelectList = function (rm, selectList, visibleIndex, visibleItemsCount) {
		var that = this;

		if (!that.getVisible()) {
			return;
		}

		var isTextOnly = true,
			isIconOnly,
			iconTabHeader = selectList._iconTabHeader,
			resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

		if (iconTabHeader) {
			isTextOnly = iconTabHeader._bTextOnly;
			isIconOnly = selectList._bIconOnly;
		}

		rm.write('<li');
		rm.writeElementData(that);

		rm.writeAttribute('tabindex', '-1');
		rm.writeAttribute('role', 'option');

		if (visibleIndex !== undefined && visibleItemsCount !== undefined) {
			rm.writeAttribute('aria-posinset', visibleIndex + 1);
			rm.writeAttribute('aria-setsize', visibleItemsCount);
		}

		var tooltip = that.getTooltip_AsString();
		if (tooltip) {
			rm.writeAttributeEscaped('title', tooltip);
		}

		if (!that.getEnabled()) {
			rm.addClass('sapMITBDisabled');
			rm.writeAttribute('aria-disabled', true);
		}

		rm.addClass('sapMITBSelectItem');

		if (selectList.getSelectedItem() == that) {
			rm.addClass('sapMITBSelectItemSelected');
			rm.writeAttribute('aria-selected', true);
		}

		var iconColor = that.getIconColor();
		rm.addClass('sapMITBFilter' + iconColor);

		rm.writeClasses();

		var itemId = that.getId(),
			invisibleText,
			iiconColorRead = iconColor == 'Positive' || iconColor == 'Critical' || iconColor == 'Negative';

		var labelledBy = ' aria-labelledby="';

		if (!isIconOnly) {
			labelledBy += itemId + '-text ';
		}

		if (!isTextOnly && that.getIcon()) {
			labelledBy += itemId + '-icon ';
		}

		if (iiconColorRead) {

			invisibleText = new InvisibleText({
				text: resourceBundle.getText('ICONTABBAR_ICONCOLOR_' + iconColor.toUpperCase())
			});

			labelledBy += invisibleText.getId();
		}

		labelledBy += '"';

		rm.write(labelledBy + '>');

		if (invisibleText) {
			rm.renderControl(invisibleText);
		}

		if (!isTextOnly) {
			this._renderIcon(rm);
		}

		if (!isIconOnly) {
			this._renderText(rm);
		}

		rm.write('</li>');
	};

	/**
	 * Renders an icon.
	 * @private
	 */
	IconTabFilter.prototype._renderIcon =  function(rm) {

		var icon = this.getIcon();

		if (icon) {
			var iconInfo = IconPool.getIconInfo(icon);
			var classes = ['sapMITBSelectItemIcon'];

			if (iconInfo && !iconInfo.suppressMirroring) {
				classes.push('sapUiIconMirrorInRTL');
			}

			rm.writeIcon(icon, classes, {
				id: this.getId() + '-icon',
				'aria-hidden': true
			});
		} else {
			rm.write('<span class="sapUiIcon"></span>');
		}
	};

	/**
	 * Renders a text.
	 * @private
	 */
	IconTabFilter.prototype._renderText =  function(rm) {
		var text = this.getText(),
			count = this.getCount(),
			isRtl = sap.ui.getCore().getConfiguration().getRTL(),
			textDir = this.getTextDirection();

		rm.write('<span');

		rm.writeAttribute('id', this.getId() + '-text');
		rm.writeAttribute('dir', 'ltr');

		rm.addClass('sapMText');
		rm.addClass('sapMTextNoWrap');
		rm.addClass('sapMITBText');

		rm.writeClasses();

		if (textDir !== TextDirection.Inherit){
			rm.writeAttribute('dir', textDir.toLowerCase());
		}

		var textAlign = Renderer.getTextAlign(TextAlign.Begin, textDir);
		if (textAlign) {
			rm.addStyle('text-align', textAlign);
			rm.writeStyles();
		}

		if (count) {
			if (isRtl) {
				text = '(' + count + ') ' + text;
			} else {
				text += ' (' + count + ')';
			}
		}

		rm.write('>');
		rm.writeEscaped(text);
		rm.write('</span>');
	};

	return IconTabFilter;

});
