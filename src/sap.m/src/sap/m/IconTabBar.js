/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabBar.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new IconTabBar.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The IconTabBar represents a collection of tabs with associated content.
	 * <h3>Overview</h3>
	 * The IconTabBar can be used for navigation within an object, or as a filter. Different types of IconTabBar are used based on the contents.
	 * <ul>
	 * <li>Filter - There is only one main content for all tabs. The main content can be filtered, based on the selected tab.</li>
	 * <li>Normal tab bar - The contents of each tab are independent from each other.</li>
	 * <li>Combination of the above - There can be both filtered and independent contents.</li>
	 * </ul>
	 * <h3>Structure</h3>
	 * The IconTabBar can hold two types of entities {@link sap.m.IconTabFilter sap.m.IconTabFilter} and {@link sap.m.IconTabSeparator sap.m.IconTabSeparator}
	 *
	 * The IconTabBarFilter holds all information on an item - text, icon and count.
	 *
	 * The IconTabBarSeparator holds an icon that can be used to show a process that runs from item to item.
	 *<h3>Usage</h3>
	 *<h4>Text only</h4>
	 *Uses text labels as tabs with optional counter
	 *<ul>
	 *<li>Used when there are no suitable icons for all items.</li>
	 *<li>Used when longer labels are needed.</li>
	 *<li>If <code>headerMode</code> property is set to <code>Inline</code> the text and the count are displayed in one line.</li>
	 *<li><code>UpperCase</code> is disabled.</li>
	 *<li>Use title case.</li>
	 *</ul>
	 *<h4>Icon Tabs</h4>
	 *Round tabs with optional counter and label
	 *<ul>
	 *<li>Used when there are unique icons for all items.</li>
	 *<li>Only shorter labels are possible.</li>
	 *<li>Provide labels for all icons or for none. Do not mix these.</li>
	 *</ul>
	 *<h4>Tabs as filters</h4>
	 *Tabs with filtered content from the same set of items
	 *<ul>
	 *<li>Provide an <i>"All"</i> tab to show all items without filtering.</li>
	 *<li>Use counters to show the number of items in each filter.</li>
	 *</ul>
	 *<h4>Tabs as process steps</h4>
	 *Tabs show a single step in a process
	 *<ul>
	 *<li>Use an arrow (e.g. triple-chevron) as a separator to connect the steps.</li>
	 *<li>Use counters to show the number of items in each filter.</li>
	 *</ul>
	 *<h3>Responsive Behavior</h3>
	 *<ul>
	 *<li>Text-only tabs are never truncated.</li>
	 *<li>Use the <code>expandable</code> property to specify whether users can collapse the tab container (default = true).</li>
	 *<li>On desktop, tabs can be dragged and dropped (property <code>enableTabReordering</code>).</li>
	 *<li>If you have a large number of tabs, you can scroll through them with the arrows. Additionally all tabs are available in an overflow button (property <code>showOverflowSelectList</code>).</li>
	 *</ul>
	 * @extends sap.ui.core.Control
	 * @implements sap.m.ObjectHeaderContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabBar = Control.extend("sap.m.IconTabBar", /** @lends sap.m.IconTabBar.prototype */ { metadata : {

		interfaces : [
			"sap.m.ObjectHeaderContainer"
		],
		library : "sap.m",
		properties : {

			/**
			 * Defines whether the current selection should be visualized.
			 * @deprecated As of 1.15.0.
			 * Regarding to changes of this control this property is not needed anymore.
			 */
			showSelection : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

			/**
			 * Defines if the tabs are collapsible and expandable.
			 * @since 1.15.0
			 */
			expandable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Indicates if the actual tab content is expanded or not.
			 * @since 1.15.0
			 */
			expanded : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Key of the selected tab item.
			 *
			 * If the key has no corresponding aggregated item, no changes will apply.
			 * If duplicate keys exists the first item matching the key is used.
			 * @since 1.15.0
			 */
			selectedKey : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Determines whether the text of the icon tab filter (not the count) is displayed in uppercase.
			 * @since 1.22
			 */
			upperCase : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines whether the IconTabBar height is stretched to the maximum possible height
			 * of its parent container. As a prerequisite, the height of the parent container must be
			 * defined as a fixed value.
			 *
			 * @since 1.26
			 */
			stretchContentHeight : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines whether the IconTabBar content fits to the full area.
			 * The paddings are removed if it's set to false.
			 *
			 * @since 1.26
			 */
			applyContentPadding : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Specifies the background color of the IconTabBar.
			 *
			 * Depending on the theme, you can change the state of
			 * the background color to "Solid", "Translucent", or "Transparent".
			 * Default is "Solid".
			 * @since 1.26
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : sap.m.BackgroundDesign.Solid},

			/**
			 * Specifies the header mode.
			 * <b>Note:</b> The Inline mode works only if no icons are set.
			 *
			 * @since 1.40
			 */
			headerMode : {type : "sap.m.IconTabHeaderMode", group : "Appearance", defaultValue : sap.m.IconTabHeaderMode.Standard},

			/**
			 * Specifies if the overflow select list is displayed.
			 *
			 * The overflow select list represents a list, where all tab filters are displayed,
			 * so the user can select specific tab filter easier.
			 * @since 1.42
			 */
			showOverflowSelectList : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Specifies the background color of the header.
			 *
			 * Depending on the theme, you can change the state of
			 * the background color to "Solid", "Translucent", or "Transparent".
			 * Default is "Solid".
			 * @since 1.44
			 */
			headerBackgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : sap.m.BackgroundDesign.Solid},

			/**
			 * Specifies whether tab reordering is enabled. Relevant only for desktop devices.
			 * @since 1.46
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		aggregations : {

			/**
			 * The items displayed in the IconTabBar.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item"},

			/**
			 * Represents the contents displayed below the IconTabBar.
			 * If there are multiple contents, they are rendered after each other.
			 * The developer has to manage to display the right one or use the content aggregation
			 * inside the IconTabFilter (which will be displayed instead if it is set).
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * Internal aggregation for managing the icon tab elements.
			 */
			_header : {type : "sap.m.IconTabHeader", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when an item is selected.
			 */
			select : {
				parameters : {

					/**
					 * The selected item
					 * @since 1.15.0
					 */
					item : {type : "sap.m.IconTabFilter"},

					/**
					 * The key of the selected item
					 * @since 1.15.0
					 */
					key : {type : "string"},

					/**
					 * The selected item
					 * @deprecated As of 1.15.0, replaced by parameter <code>item</code> instead.
					 */
					selectedItem : {type : "sap.m.IconTabFilter"},

					/**
					 * The key of the selected item
					 * @deprecated As of 1.15.0, replaced by parameter <code>key</code> instead.
					 */
					selectedKey : {type : "string"}
				}
			},

			/**
			 * Indicates that the tab will expand or collapse.
			 * @since 1.15.0
			 */
			expand : {
				parameters : {

					/**
					 * If the tab will expand, this is true.
					 */
					expand : {type : "boolean"},

					/**
					 * If the tab will collapse, this is true.
					 */
					collapse : {type : "boolean"}
				}
			}
		}
	}});


	IconTabBar.prototype.clone = function () {
		var oClone = Control.prototype.clone.apply(this, arguments);

		// "_header" aggregation is hidden and it is not cloned by default
		var oIconTabHeader = this._getIconTabHeader();
		oClone.setAggregation("_header", oIconTabHeader.clone(), true);

		return oClone;
	};

	/**
	 * Sets the tab content as expanded.
	 * @overwrite
	 * @public
	 * @param {boolean} bExpanded new parameter value
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setExpanded = function (bExpanded) {
		// set internal property
		this.setProperty("expanded", bExpanded, true);

		// toggle animation if control is already rendered
		if (this.$().length) {
			this._toggleExpandCollapse(bExpanded);
		}
		return this;
	};

	/**
	 * Sets the tabs as collapsible and expandable without re-rendering the control.
	 * @overwrite
	 * @public
	 * @param {boolean} bExpandable new parameter value
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setExpandable = function (bExpandable) {
		// set internal property
		this.setProperty("expandable", bExpandable, true);
		return this;
	};

	/**
	 * Sets the header mode.
	 * @overwrite
	 * @public
	 * @param {sap.m.IconTabHeaderMode} mode new parameter value
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setHeaderMode = function (mode) {
		// set internal property
		this.setProperty("headerMode", mode, true);

		this._getIconTabHeader().setMode(mode);

		return this;
	};


	/**
	 * Sets the header background design.
	 * @overwrite
	 * @public
	 * @param {sap.m.BackgroundDesign} headerBackgroundDesign New parameter value
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setHeaderBackgroundDesign = function (headerBackgroundDesign) {
		// set internal property
		this.setProperty("headerBackgroundDesign", headerBackgroundDesign, true);

		this._getIconTabHeader().setBackgroundDesign(headerBackgroundDesign);

		return this;
	};

	/**
	 * Sets the showOverflowSelectList property.
	 * @overwrite
	 * @public
	 * @param {boolean} value New value for showOverflowSelectList
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setShowOverflowSelectList = function (value) {
		// set internal property
		this.setProperty("showOverflowSelectList", value, true);

		this._getIconTabHeader().setShowOverflowSelectList(value);

		return this;
	};

	/**
	 * Sets the enableTabReordering property.
	 * @overwrite
	 * @public
	 * @param {boolean} value New value for enableTabReordering
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setEnableTabReordering = function (value) {
		// set internal property
		this.setProperty("enableTabReordering", value, true);

		this._getIconTabHeader().setEnableTabReordering(value);

		return this;
	};

	/**
	 * Re-renders only the displayed content of the IconTabBar.
	 * @private
	 * @param oContent Content, which should be rendered.
	 */
	IconTabBar.prototype._rerenderContent = function(oContent) {
		var $content = this.$("content");
		if (oContent && ($content.length > 0)) {
			var rm = sap.ui.getCore().createRenderManager();
			for (var i = 0; i < oContent.length; i++) {
				rm.renderControl(oContent[i]);
			}
			rm.flush($content[0]);
			rm.destroy();
		}
	};

	/**
	 * Opens and closes the content Container.
	 *
	 * @param {boolean|undefined} bExpanded the new state of the container. If not specified, it will use the property expanded.
	 * @private
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype._toggleExpandCollapse = function(bExpanded) {
		var $content = this.$("content");
		var oSelectedItem = this._getIconTabHeader().oSelectedItem;

		// use inverted control state if not specified by parameter
		if (bExpanded === undefined) {
			bExpanded = !this.getExpanded();
		}

		// TODO: do this in header now
		// manage selection state

		if (oSelectedItem) {
			oSelectedItem.$().toggleClass("sapMITBSelected", bExpanded);

			oSelectedItem.$().attr({
				'aria-expanded': bExpanded
			});

			if (bExpanded) {
				oSelectedItem.$().attr({ 'aria-selected': bExpanded });
			} else {
				oSelectedItem.$().removeAttr('aria-selected');
			}
		}

		// show animation (keep track of active animations to avoid flickering of controls)
		this._iAnimationCounter = (this._iAnimationCounter === undefined ? 1 : ++this._iAnimationCounter);
		if (bExpanded) { // expanding
			if (oSelectedItem) {
				if (this.$("content").children().length === 0) { //content is not rendered yet
					//if item has own content, this content is shown
					var oSelectedItemContent = oSelectedItem.getContent();
					if (oSelectedItemContent.length > 0) {
						this._rerenderContent(oSelectedItemContent);
					//if item has not own content, general content of the icontabbar is shown
					} else {
						this._rerenderContent(this.getContent());
					}
				}
				$content.stop(true, true).slideDown('400', jQuery.proxy(this.onTransitionEnded, this, bExpanded));
				this.$("containerContent").toggleClass("sapMITBContentClosed", !bExpanded);
			}
		} else { // collapsing
			this.$("contentArrow").hide();
			$content.stop(true, true).slideUp('400', jQuery.proxy(this.onTransitionEnded, this, bExpanded));
		}

		// update property (if we have a selected item) and fire event
		if (!bExpanded || oSelectedItem) {
			this.setProperty("expanded", bExpanded, true);
		}
		this.fireExpand({
			expand: bExpanded,
			collapse: !bExpanded
		});

		return this;
	};

	/**
	 * Function is executed when the expand/collapse animation is finished to adjust the UI.
	 *
	 * @param {boolean} bExpanded the new state of the container. Passed in
	 * @private
	 * @return {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.onTransitionEnded = function(bExpanded) {
		var $content = this.$("content"),
			$container = this.$("containerContent"),
			$arrow = this.$("contentArrow");

		// if multiple animations are triggered, this function is executed multiple times in the end, so we need to ignore all except the last call
		if (this._iAnimationCounter === 1) {
			$container.toggleClass("sapMITBContentClosed", !bExpanded);
			if (bExpanded) { // expanding
				$arrow.show();
				$content.css("display", "block");
			} else { // collapsing
				$arrow.hide();
				$content.css("display", "none");
			}
		}
		// reduce animation counter
		this._iAnimationCounter = (this._iAnimationCounter > 0 ? --this._iAnimationCounter : 0);
		return this;
	};


	/* =========================================================== */
	/*           end: event handlers                               */
	/* =========================================================== */

	/**
	 * Lazy initializes the iconTabHeader aggregation.
	 */
	IconTabBar.prototype._getIconTabHeader = function () {
		var oControl = this.getAggregation("_header");

		if (!oControl) {
			oControl = new sap.m.IconTabHeader(this.getId() + "--header", {
			});
			this.setAggregation("_header", oControl, true);
		}
		return oControl;
	};

	/* =========================================================== */
	/*           begin: reflectors for header properties           */
	/* =========================================================== */

	/*
	 * Reflector for the internal header's showSelection property.
	 * @overwrite
	 * @public
	 * @param {boolean} bValue the new value
	 * @returns {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setShowSelection = function (bValue) {
		this._getIconTabHeader().setShowSelection(bValue);
		return this;
	};

	/*
	 * Reflector for the internal header's showSelection property.
	 * @overwrite
	 * @public
	 * @returns {boolean} The current property value
	 */
	IconTabBar.prototype.getShowSelection = function () {
		return this._getIconTabHeader().getShowSelection();
	};

	/**
	 * Reflector for the internal header's selectedKey property.
	 * @overwrite
	 * @public
	 * @param {string} sValue the new value
	 * @returns {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.setSelectedKey = function (sValue) {
		this._getIconTabHeader().setSelectedKey(sValue);
		return this;
	};

	/**
	 * Reflector for the internal header's selectedKey property.
	 * @overwrite
	 * @public
	 * @returns {string} The current property value
	 */
	IconTabBar.prototype.getSelectedKey = function () {
		return this._getIconTabHeader().getSelectedKey();
	};

	/**
	 * Reflector for the internal header's selectedItem.
	 * Sets the selected item, updates the UI, and fires the select event.
	 * @overwrite
	 * @private
	 * @param {sap.m.IconTabFilter} oItem the item to be selected
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabBar.prototype.setSelectedItem = function(oItem, bAPIchange) {
		return this._getIconTabHeader().setSelectedItem(oItem, bAPIchange);
	};

	/* =========================================================== */
	/*           end: reflectors for header properties             */
	/* =========================================================== */

	/* =========================================================== */
	/*           begin: forward aggregation  methods to header     */
	/* =========================================================== */

	/*
	 * Forwards a function call to a managed object based on the aggregation name.
	 * If the name is items, it will be forwarded to the list, otherwise called locally.
	 * @private
	 * @param {string} sFunctionName The name of the function to be called
	 * @param {string} sAggregationName The name of the aggregation asociated
	 * @returns {any} The return type of the called function
	 */
	IconTabBar.prototype._callMethodInManagedObject = function (sFunctionName, sAggregationName) {
		var aArgs = Array.prototype.slice.call(arguments),
			oHeader;

		if (sAggregationName === "items") {
			// apply to the internal header control
			oHeader = this._getIconTabHeader();
			return oHeader[sFunctionName].apply(oHeader, aArgs.slice(1));
		} else {
			// apply to this control
			return sap.ui.base.ManagedObject.prototype[sFunctionName].apply(this, aArgs.slice(1));
		}
	};

	/**
	 * Forwards aggregations with the name of items to the internal list.
	 * @overwrite
	 * @public
	 * @param {string} sAggregationName The name for the binding
	 * @param {object} oBindingInfo The configuration parameters for the binding
	 * @returns {sap.m.IconTabBar} this pointer for chaining
	 */
	IconTabBar.prototype.bindAggregation = function () {
		var args = Array.prototype.slice.call(arguments);

		// propagate the bind aggregation function to list
		this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
		return this;
	};

	IconTabBar.prototype.validateAggregation = function (sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	IconTabBar.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	IconTabBar.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};

	IconTabBar.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	IconTabBar.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	IconTabBar.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	IconTabBar.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	IconTabBar.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	IconTabBar.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	IconTabBar.prototype.getBinding = function (sAggregationName) {
		return this._callMethodInManagedObject("getBinding", sAggregationName);
	};


	IconTabBar.prototype.getBindingInfo = function (sAggregationName) {
		return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
	};

	IconTabBar.prototype.getBindingPath = function (sAggregationName) {
		return this._callMethodInManagedObject("getBindingPath", sAggregationName);
	};

	/* =========================================================== */
	/*           end: forward aggregation  methods to header       */
	/* =========================================================== */

	return IconTabBar;

}, /* bExport= */ true);
