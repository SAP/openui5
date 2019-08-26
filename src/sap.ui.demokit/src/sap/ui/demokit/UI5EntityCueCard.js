/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.UI5EntityCueCard.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/commons/Link',
	'./EntityInfo',
	'./library',
	'./UI5EntityCueCardRenderer'
],
	function(jQuery, Control, Link, EntityInfo, library, UI5EntityCueCardRenderer) {
	"use strict";



	/**
	 * Constructor for a new UI5EntityCueCard.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays documentation for a UI5 entity (control or type).
	 *
	 * The documentation will be read from a UI5 metamodel file that by default is loaded from the same resource location
	 * where the control or type would be loaded from (using the UI5 resource loading). This control displays all properties,
	 * aggregations, associations, events and methods that are described in the metamodel. For each part, it lists the name,
	 * type (where applicable) and documentation. If the navigable property is set to true, all types are shown as links
	 * and when pressed, the navigate event is fired. This allows consumers to react on a user click on such a type
	 * (and to e.g. navigate to the underlying type of a property or aggregation)
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sdk
	 * @alias sap.ui.demokit.UI5EntityCueCard
	 */
	var UI5EntityCueCard = Control.extend("sap.ui.demokit.UI5EntityCueCard", /** @lends sap.ui.demokit.UI5EntityCueCard.prototype */ { metadata : {

		library : "sap.ui.demokit",
		properties : {

			/**
			 * Whether the cue card can be collapsed at all. When set to true, the value of property expanded determines the current collapsed/expanded state. When false, the control is always expanded.
			 */
			collapsible : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Whether the cue card is currently expanded.
			 */
			expanded : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Whether type information is navigable. Also see event 'navigate'.
			 */
			navigable : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Qualified name of the control or type to show the documentation for. The name can be specified in the metamodel notation ('sap.ui.core/Control' or in the UI5 resource notation (sap.ui.core.Control).
			 */
			entityName : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Style of the cue card.
			 */
			style : {type : "sap.ui.demokit.UI5EntityCueCardStyle", group : "Misc", defaultValue : null}
		},
		events : {

			/**
			 * Fired when a link for a type is activated (clicked) by the user.
			 *
			 * When property "navigable" is set to true, type links are created for the types of properties, aggregations and associations, for the types of event or method parameters and for the return types of methods (if not void).
			 *
			 * The default behavior for this event is to set the entityName property to the clicked entityName. Applications can prevent the default by calling the corresponding method on the event object.
			 */
			navigate : {allowPreventDefault : true,
				parameters : {

					/**
					 * Name of the entity (control or type) that has been clicked.
					 */
					entityName : {type : "string"}
				}
			}
		}
	}});


	UI5EntityCueCard.prototype.init = function() {
		this._oShowCueCardLink = new Link({	text : "Show All Settings", press : [this._toggleExpanded, this]});
		this._oShowCueCardLink.setParent(this); //TODO provide sAggregationName?
		this._aHistory = [];
		/**
		 * Active position in the history. Moved by back/forward and setEntityName
		 */
		this._iHistory = -1;
	};

	UI5EntityCueCard.prototype.exit = function() {
		if ( this._oShowCueCardLink ) {
			this._oShowCueCardLink.destroy();
			this._oShowCueCardLink = null;
		}
	};

	UI5EntityCueCard.prototype.setEntityName = function(sEntityName) {
		if ( sEntityName !== this.getEntityName() ) {
			this.setProperty("entityName", sEntityName);
			this._aHistory[++this._iHistory] = sEntityName;
			this._aHistory.length = this._iHistory + 1; // cut off any dangling entries
		}
	};

	UI5EntityCueCard.prototype.back = function() {
		if ( this._iHistory > 0 ) {
			this.setProperty("entityName", this._aHistory[--this._iHistory]);
		}
	};

	UI5EntityCueCard.prototype.forward = function() {
		if ( this._iHistory + 1 < this._aHistory.length ) {
			this.setProperty("entityName", this._aHistory[++this._iHistory]);
		}
	};

	UI5EntityCueCard.prototype.setExpanded = function(bExpanded) {
		this.setProperty("expanded", bExpanded);
		this._oShowCueCardLink && this._oShowCueCardLink.setText(this.getExpanded() ? "Hide Settings" : "Show All Settings");
	};

	UI5EntityCueCard.prototype.onclick = function(oEvent) {
		/*if ( oEvent.target && oEvent.target.nodeName == "A" ) {
			oEvent.preventDefault();
		}*/
		if ( this.getNavigable() ) {
			var sEntity = jQuery(oEvent.target).attr("data-sap-ui-entity");
			if ( sEntity && this.fireNavigate({entityName : sEntity}) ) {
				this.setEntityName(sEntity);
			}
		}
	};

	UI5EntityCueCard.prototype._toggleExpanded = function() {
		this.setExpanded(!this.getExpanded());
	};

	UI5EntityCueCard.prototype._getDoc = function() {
		var sName = this.getEntityName();
		return EntityInfo.getEntityDocu(sName);
	};

	UI5EntityCueCard.createDialog = function() {

		return new Promise(function(resolve, reject) {

			sap.ui.require(['sap/ui/commons/Button', 'sap/ui/commons/Dialog', 'sap/ui/commons/Toolbar'], function(Button, Dialog, Toolbar) {

				var oCueCard = new UI5EntityCueCard({
					collapsible : false,
					expanded : true,
					navigable: true
				});

				var oDialog = new Dialog({
					title : "Cue Card",
					minWidth : "200px",
					minHeight : "200px",
					maxWidth : "75%",
					maxHeight : "75%",
					content : [
						new Toolbar({
							standalone : false,
							items : [
								new Button({
									text : "Back",
									press : function() {
										oCueCard.back();
									}
								}),
								new Button({
									text : "Fwd",
									press : function() {
										oCueCard.forward();
									}
								})
							]
						}),
						oCueCard
					]
				});

				oDialog.openForClass = function(sClassName) {
					oCueCard.setEntityName(sClassName);
					this.rerender();
					this.open();
				};

				resolve(oDialog);
			});

		});

	};

	UI5EntityCueCard.attachToContextMenu = function(oNode) {
		var oDialog;

		function dialogCreated() {
			return oDialog ? Promise.resolve(oDialog) : UI5EntityCueCard.createDialog().then(function(oResult) {
				oDialog = oResult;
				return oResult;
			});
		}

		jQuery(oNode || window.document).bind("contextmenu.sapDkCueCd", function(e) {
			if ( e.shiftKey && e.ctrlKey )  {
				var oCtrl = jQuery(e.target).control(0);
				// if there is a control and if the control is not part of the cue card dialog
				if ( oCtrl && (!oDialog || !oDialog.getDomRef() || (oDialog.getDomRef() !== e.target && !jQuery.contains(oDialog.getDomRef(), e.target)) ) ) {
					dialogCreated().then(function(oDialog) {
						oDialog.openForClass(oCtrl.getMetadata().getName());
						e.preventDefault();
						e.stopPropagation();
					});
				}
			}
		});
	};

	UI5EntityCueCard.detachFromContextMenu = function(oNode) {
		jQuery(oNode || window.document).unbind("contextmenu.sapDkCueCd");
	};


	/*
	 * TODOs
	 *
	 * - defaultValues
	 * - method & event parameters
	 * - styling
	 * - integrate into snippix itself
	 * - initial size
	 */

	return UI5EntityCueCard;

});
