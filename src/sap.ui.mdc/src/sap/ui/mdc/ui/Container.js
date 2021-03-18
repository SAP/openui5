/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Page"
], function (Control, Page) {
	"use strict";

	/**
	 * Constructor for a new <code>Container</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>Container</code> control can be used to define a fixed header/footer area while offering the possibility
	 * to define different content controls which can be dynamically added/removed and switched.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.ui.Container
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.85.0
	 *
	 * @private
	 * @experimental
	 */
	var Container = Control.extend("sap.ui.mdc.ui.Container", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "views",
			properties: {
				/**
				 * Defines the default view for the <code>Container</code> content area
				 */
                defaultView: {
                    type: "String"
                }
			},
			aggregations: {
				/**
				 * Defines the content for the <code>Container</code> header area
				 */
				header: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-container",
						aggregation: "customHeader",
						forwardBinding: true
					}
				},
				/**
				 * Defines the content for the <code>Container</code> subHeader area
				 */
				subHeader: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-container",
						aggregation: "subHeader",
						forwardBinding: true
					}
				},
				/**
				 * Defines the content for the <code>Container</code> header area
				 */
				footer: {
					type: "sap.m.IBar",
					multiple: false,
					forwarding: {
						idSuffix: "-container",
						aggregation: "footer",
						forwardBinding: true
					}
				},
				/**
				 * Defines the different content views for the <code>Container</code> content area
				 */
                views: {
					type: "sap.ui.mdc.ui.ContainerItem",
                    multiple: true
				},
				/**
				 * Inner <code>sap.m.Page</code> as basic layout control
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					hidden: true
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

	Container.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);

		this._initializeContent();
	};

	Container.prototype.applySettings = function() {
		Control.prototype.applySettings.apply(this, arguments);
		this.switchView(this.getDefaultView());
		return this;
	};

	Container.prototype._initializeContent = function() {
		this.oLayout = new Page(this.getId() + "-container");
		this.setAggregation("_content", this.oLayout);
	};

	/**
	 * This method can be used to remove a view from the <code>Container</code> instance.
	 *
	 * @param {string|sap.ui.mdc.ui.ContainerItem} vContainerItem View that should be removed
	 * @param {boolean} bSuppress Supress invalidate
	 *
	 * @returns {sap.ui.mdc.ui.Container} The Container instance
	 */
	Container.prototype.removeView = function(vContainerItem, bSuppress){
		var oContainerItem = typeof vContainerItem == "string" ? this.getView(vContainerItem) : vContainerItem;
		oContainerItem = this.removeAggregation("views", oContainerItem , bSuppress);
		//In case the currently selected view has been removed, switch the view
		if (oContainerItem && oContainerItem.getKey() === this.getCurrentViewKey()){
			this.switchView();
		}
		return this;
	};

	Container.prototype.addView = function(oView) {
		if (oView && !oView.getContent().hasStyleClass("sapUiMDCContainerContent")){
			oView.getContent().addStyleClass("sapUiMDCContainerContent");
		}
		this.addAggregation("views", oView);

        return this;
	};

	/**
	 * This method can be used to retrieve the key of the current view.
	 *
	 * @returns {string} The key of the currently visible view in the content area
	 */
	Container.prototype.getCurrentViewKey = function() {
		return this._sCurrentView ? this._sCurrentView : this.getDefaultView();
	};

	/**
	 * This method can be used to retrieve the content of the current view.
	 *
	 * @returns {sap.ui.core.Control} The content of the currently visible view in the content area
	 */
	Container.prototype.getCurrentViewContent = function() {
		return this.getView(this.getCurrentViewKey()).getContent();
	};

	/**
	 * This method can be used to switch to an existing view using the according <code>ContainerItem</code> key.
	 *
	 * @param {string} sKey They key of the ContainerItem whose content should be visible up next
	 */
	Container.prototype.switchView = function(sKey) {

		var oNewView = this.getView(sKey);

		if (!oNewView) {
			oNewView = this.getViews()[0];
			if (!oNewView) {
				return;
			}
		}

		this._sCurrentView = oNewView.getKey();

		this.oLayout.removeAllContent();
		this.oLayout.addContent(oNewView.getContent());
	};

	/**
	 * This method can be used to retrieve the current present view by using the according <code>ContainerItem</code> key.
	 *
  	 * @param {string} sKey They key of the ContainerItem which should be retrieved
	 *
	 * @returns {sap.ui.mdc.ui.ContainerItem} The matching ContainerItem
	 */
	Container.prototype.getView = function(sKey) {
		return this.getViews().find(function(oView){
			if (oView.getKey() === sKey) {
				return oView;
			}
		});
	};

	Container.prototype._getResourceText = function(sText) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		return sText ? this.oResourceBundle.getText(sText) : this.oResourceBundle;
	};

    Container.prototype.exit = function() {
        Control.prototype.exit.apply(this, arguments);
		this._sCurrentView = null;
		this.oResourceBundle = null;
    };

	return Container;

});