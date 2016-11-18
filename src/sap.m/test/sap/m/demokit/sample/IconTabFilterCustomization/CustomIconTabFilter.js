sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/IconPool',
		'sap/m/IconTabFilter',
		'sap/ui/core/Icon'
	], function(jQuery, IconPool, IconTabFilter, Icon) {
	'use strict';

	var CustomIconTabFilter = IconTabFilter.extend("sap.m.sample.IconTabFilterCustomization.CustomIconTabFilter", {
		metadata : {
			properties: {

				/**
				 * Shows if a control is edited (default is false). Items that are marked as modified
				 * have a * symbol to indicate that they haven't been saved.
				 */
				modified: {type: "boolean", group: "Misc", defaultValue: false}
			},
			aggregations: {

				/**
				 * Internal aggregation to hold the Close button.
				 */
				_closeIcon: { type : "sap.ui.core.Icon", multiple: false}
			},
			events : {

				/**
				 * Fired when a tab is closed.
				 */
				close: {
					parameters: {

						/**
						 * The closed tab.
						 */
						item: {type: "sap.m.sample.IconTabFilterCustomization.CustomIconTabFilter"}
					}
				}
			}
		}
	});

	CustomIconTabFilter.prototype.init = function () {
		var that = this,
			icon = new Icon({
			src: IconPool.getIconURI('decline'),
			tooltip: 'Close',
			noTabStop: true,
			press: function (e) {
				that.fireClose({
					item: that
				});
			}
		}).addStyleClass('customCloseIcon');
		this.setAggregation('_closeIcon', icon);
	};

	/**
	 * Renders this item in the IconTabHeader.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @protected
	 */
	CustomIconTabFilter.prototype.render = function (rm) {
		var that = this;

		if (!that.getVisible()) {
			return;
		}

		var iconTabHeader = this.getParent(),
			iconTabBar = iconTabHeader.getParent(),
			id = that.getId(),
			text = that.getText();

		var ariaParams = 'role="tab" aria-controls="' + iconTabBar.getId() + '-content" ';
		ariaParams += 'aria-labelledby="' + id + '-text"';
		rm.write('<div ' + ariaParams + ' ');

		rm.writeElementData(that);
		rm.addClass('sapMITBItem');

		rm.addClass('sapMITBItemNoCount');
		rm.addClass('sapMITBVertical');
		rm.addClass('sapMITBFilter');

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

		rm.write('<div id="' + id + '-text" ');
		rm.addClass('sapMITBText');
		rm.addClass('customTextDiv');

		rm.writeClasses();
		rm.write('>');

		if (that.getModified()) {
			text += '*';
		}

		rm.writeEscaped(text);
		rm.write('</div>');

		rm.write('<div class="customCloseDiv">');
		rm.renderControl(that.getAggregation('_closeIcon'));
		rm.write('</div>');

		rm.write('<div class="sapMITBContentArrow customContentArrow"></div>');

		rm.write('</div>');
	};

	/**
	 * Renders this item in the IconTabSelectList.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.IconTabBarSelectList} selectList the select list in which this filter is rendered
	 * @protected
	 */
	CustomIconTabFilter.prototype.renderInSelectList = function (rm, selectList) {
		var that = this;

		if (!that.getVisible()) {
			return;
		}

		var items = selectList.getItems(),
			length = items.length,
			index = items.indexOf(that);

		rm.write('<li');
		rm.writeElementData(that);

		rm.writeAttribute('tabindex', '-1');
		rm.writeAttribute('role', 'option');
		rm.writeAttribute('aria-posinset', index + 1);
		rm.writeAttribute('aria-setsize', length);

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

		rm.writeClasses();

		var itemId = that.getId();
		var labelledBy = ' aria-labelledby="' + itemId + '-text"';

		rm.write(labelledBy + '>');

		var text = this.getText();
		rm.write('<span');
		rm.writeAttribute('id', this.getId() + '-text');
		rm.addClass('sapMText');
		rm.addClass('sapMTextNoWrap');
		rm.addClass('sapMITBText');
		rm.writeClasses();
		rm.write('>');

		if (that.getModified()) {
			text += '*';
		}

		rm.writeEscaped(text);
		rm.write('</span>');

		rm.write('</li>');
	};


	return CustomIconTabFilter;
});
