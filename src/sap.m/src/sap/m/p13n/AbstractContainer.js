/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Page"
], function (Control, Page) {
	"use strict";

	/**
	 * Constructor for a new <code>AbstractContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>AbstractContainer</code> control can be used to define a fixed header and footer area while offering the possibility
	 * to define various controls as content, which can be dynamically added, removed, and switched.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.m.p13n.AbstractContainer
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.96.
	 * @since 1.96
	 *
	 * @private
	 * @ui5-restricted
	 */
	var AbstractContainer = Control.extend("sap.m.p13n.AbstractContainer", {
		metadata: {
			library: "sap.m",
			defaultAggregation: "views",
			properties: {
				/**
				 * Defines the default view for the <code>AbstractContainer</code> content area.
				 */
				defaultView: {
					type: "string"
				}
			},
			aggregations: {
				/**
				 * Defines the content for the <code>AbstractContainer</code> header area.
				 */
				header: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-AbstractContainer",
						aggregation: "customHeader",
						forwardBinding: true
					}
				},
				/**
				 * Defines the content for the <code>AbstractContainer</code> <code>subHeader</code> area.
				 */
				subHeader: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-AbstractContainer",
						aggregation: "subHeader",
						forwardBinding: true
					}
				},
				/**
				 * Defines the content for the <code>AbstractContainer</code> footer area.
				 */
				footer: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-AbstractContainer",
						aggregation: "footer",
						forwardBinding: true
					}
				},
				/**
				 * Defines the different content views for the <code>AbstractContainer</code> content area.
				 */
				views: {
					type: "sap.m.p13n.AbstractContainerItem",
					multiple: true
				},
				/**
				 * Inner <code>sap.m.Page</code> as basic layout control.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event will be fired before a view is switched.
				 */
				beforeViewSwitch: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * This parameter is the current view.
						 */
						 source: {type: "string"},
						 /**
						  * This parameter is the target view.
						  */
						 target: {type: "string"}
					}
				},
				/**
				 * This event will be fired after a view is switched.
				 */
				afterViewSwitch: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * This parameter is the current view.
						 */
						source: {type: "string"},
						/**
						 * This parameter is the target view.
						 */
						target: {type: "string"}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	AbstractContainer.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);
		this.addStyleClass("sapMAbstractContainer");
		this._initializeContent();
	};

	AbstractContainer.prototype.applySettings = function() {
		Control.prototype.applySettings.apply(this, arguments);
		this.switchView(this.getDefaultView());
		return this;
	};

	AbstractContainer.prototype._initializeContent = function() {
		this.oLayout = new Page(this.getId() + "-AbstractContainer");
		this.setAggregation("_content", this.oLayout);
	};

	/**
	 * This method can be used to remove a view from the <code>AbstractContainer</code> instance.
	 *
	 * @param {string|sap.m.p13n.AbstractContainerItem} vContainerItem View that is removed
	 * @param {boolean} bSuppress Suppress invalidate
	 *
	 * @returns {this} The <code>AbstractContainer<code> instance
	 */
	AbstractContainer.prototype.removeView = function(vContainerItem, bSuppress){
		var oContainerItem = typeof vContainerItem == "string" ? this.getView(vContainerItem) : vContainerItem;
		oContainerItem = this.removeAggregation("views", oContainerItem , bSuppress);
		//In case the currently selected view has been removed, switch the view
		if (oContainerItem && oContainerItem.getKey() === this.getCurrentViewKey()){
			this.switchView();
		}
		return this;
	};

	/**
	 * This method can be used to add a view to the <code>AbstractContainer</code> instance.
	 *
	 * @param {sap.m.p13n.AbstractContainerItem} vContainerItem <code>AbstractContainerItem</code> that is added
	 *
	 * @returns {this} The <code>AbstractContainer<code> instance
	 */
	AbstractContainer.prototype.addView = function(vContainerItem) {
		if (vContainerItem && vContainerItem.getContent() && !vContainerItem.getContent().hasStyleClass("sapUiMAbstractContainerContent")){
			vContainerItem.getContent().addStyleClass("sapUiMAbstractContainerContent");
		}
		this.addAggregation("views", vContainerItem);

		return this;
	};

	/**
	 * This method can be used to retrieve the key of the current view.
	 *
	 * @returns {string} The key of the currently visible view in the content area
	 */
	AbstractContainer.prototype.getCurrentViewKey = function() {
		return this._sCurrentView ? this._sCurrentView : this.getDefaultView();
	};

	/**
	 * This method can be used to retrieve the content of the current view.
	 *
	 * @returns {sap.ui.core.Control} The content of the currently visible view in the content area
	 */
	AbstractContainer.prototype.getCurrentViewContent = function() {
		return this.getView(this.getCurrentViewKey()).getContent();
	};

	/**
	 * This method can be used to switch to an existing view using the related <code>ContainerItem</code> key.
	 *
	 * @param {string} sKey The key of the ContainerItem whose content is made visible next
	 */
	AbstractContainer.prototype.switchView = function(sKey) {
		var oNewView = this.getView(sKey);
		if (!oNewView) {
			oNewView = this.getViews()[0];
			if (!oNewView) {
				return;
			}
		}

		if (!this.fireBeforeViewSwitch({source: sCurrentViewKey, target: sKey})) {
			this._bPrevented = true;
			return; // view switch event was prevented by event handler.
		}

		this._bPrevented = false;
		var sCurrentViewKey = this.getCurrentViewKey();

		this._sCurrentView = oNewView.getKey();

		this.oLayout.removeAllContent();
		this.oLayout.addContent(oNewView.getContent());

		if (sCurrentViewKey !== sKey) {
			this.oAfterRenderingDelegate = {
				onAfterRendering: function () {
					this.removeEventDelegate(this.oAfterRenderingDelegate);
					this.fireAfterViewSwitch({source: sCurrentViewKey, target: sKey});
				}.bind(this)
			};
			this.addEventDelegate(this.oAfterRenderingDelegate, this);
		}
	};

	/**
	 * This method can be used to retrieve the current view by using the related <code>ContainerItem</code> key.
	 *
  	 * @param {string|sap.ui.core.Control} vView The key or the content of the ContainerItem which is retrieved
	 *
	 * @returns {sap.m.p13n.AbstractContainerItem} The matching ContainerItem
	 */
	 AbstractContainer.prototype.getView = function(vView) {
		return this.getViews().find(function(oView){
			if (oView.getKey() === vView || oView.getContent() === vView) {
				return oView;
			}
		});
	};

	/**
	 * Gets a plain representation of the current views.
	 *
	 * @returns {object} The current view aggregation as map
	 */
	AbstractContainer.prototype.getViewMap = function() {
		return this.getViews().map(function(o){
			return {
				key: o.getKey(),
				content: o.getContent()
			};
		});
	};

	AbstractContainer.prototype.exit = function() {
		Control.prototype.exit.apply(this, arguments);
		this._sCurrentView = null;
		this.oResourceBundle = null;
	};

	return AbstractContainer;

});