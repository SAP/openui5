/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.adapter.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Element',
	'sap/ui/core/Control'
],
function(jQuery, Element, Control) {
	"use strict";

	/**
	 * The adapter.js is responsible to register the supported controls and their design time metadata and behavior.
	 * The metadata is based on this contract:
	 * http://vesapui5.dhcp.wdf.sap.corp:1080/trac/sapui5.tools/wiki/AppDesigner/Frontend/DiscussionsAndProposals/WYSIWYG/ContractCore.
	 * In future design time metadata might come from the controls directly and adapter.js might only be the place to enable controls
	 * and override predefined behavior.
	 */

	var adapter = {};

	var aLoadedControls = [];

	Element.prototype.attachBrowserEvent = Control.prototype.attachBrowserEvent;
	Element.prototype.detachBrowserEvent = Control.prototype.detachBrowserEvent;
	Element.prototype.addStyleClass = Control.prototype.addStyleClass;
	Element.prototype.removeStyleClass = Control.prototype.removeStyleClass;

	// Preload control libraries so that xml view does not request each control by itself
	//	var aPreloadLibraries = [ "sap.ui.core", "sap.ui.commons", "sap.m", "sap.me", "sap.ui.layout" ];
	//	var bAsync = window.parent["sap-ui-debug"] ? true : false; // Retrieve full sources in debug mode
	//	for ( var i = aPreloadLibraries.length - 1; i >= 0; i--) {
	//		jQuery.sap.preloadModules(aPreloadLibraries[i] + ".library-preload", bAsync);
	//	}
	
	jQuery.sap.require("sap.ui.core.mvc.XMLViewRenderer");
	sap.ui.core.mvc.XMLViewRenderer.render = function(rm, oControl) {
		//var $oldContent = oControl._$oldContent = sap.ui.core.RenderManager.findPreservedContent(oControl.getId());
		var bSubView = oControl.isSubView();
		if (!bSubView) {
			rm.write("<div");
			rm.writeControlData(oControl);
			rm.addClass("sapUiView");
			rm.addClass("sapUiXMLView");
//			ViewRenderer.addDisplayClass(rm, oControl);
			//rm.writeAttribute("data-sap-ui-preserve", oControl.getId());

			if (oControl.getWidth()) {
				rm.addStyle("width", oControl.getWidth());
			}
			if (oControl.getHeight()) {
				rm.addStyle("height", oControl.getHeight());
			}
			rm.writeStyles();

			rm.writeClasses();

			rm.write(">");
		}
		for (var i = 0; i < oControl.getContent().length; i++) {
			var fragment = oControl.getContent()[i];
			if (fragment && typeof (fragment) === "string") {
				rm.write(fragment);
			} else {
				rm.renderControl(fragment);
				// when the child control did not render anything (e.g. visible=false), we add a placeholder to know where to render the child later 
				//if ( !fragment.bOutput ) {
//					rm.write('<div id="' + sap.ui.core.RenderPrefixes.Dummy + fragment.getId() + '" class="sapUiHidden"/>');
				//}
			}
		}
		if (!bSubView) {
			rm.write("</div>");
		}
			
	}; 

	adapter.register = function(vClassDef, oOptions) {
		var classDef = vClassDef;

		if (jQuery.type(vClassDef) === "string") {
			jQuery.sap.require(vClassDef);
			classDef = jQuery.sap.getObject(vClassDef);
		}

		// Create the default properties for every single control
		var oProperties = classDef.getMetadata().getAllProperties();
		var oDefaultProperties = {};
		for ( var sProperty in oProperties) {
			oDefaultProperties[sProperty] = {
				display : true,
				order : null,
				name : null,
				description : null
			};
		}
		classDef.getMetadata().__designTimeOptions = {
			defaultSettings : {},
			aggregations : {},
			properties : oDefaultProperties,
			associations : {},
			events : {},
			behavior : {
				constructor : null,
				resize : {
					stop : null,
					grid : null,
					start : null,
					minWidth : null,
					minHeight : null,
					maxWidth : null,
					maxHeight : null
				}
			},
			renderer : null,
			css : null,
			icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/placeholder.png",
			name : null,
			description : "description here",
			keywords : [],

			draggable : true,
			selectable : true,
			removable : true,
			resizable : true,
			display : true,

			needDelegateFromParent : false
		/*Set to true if this control does not have its own renderer and need to delegate parent's onAfterRendering*/

		};
		if (oOptions && typeof (oOptions) == "object") {
			//jQuery.extend(true, classDef.getMetadata().getAllAggregations(), oOptions.aggregations);
			jQuery.extend(true, classDef.getMetadata().__designTimeOptions, oOptions);
		}
		// we add the _defaultLayoutData flag so we know that we are dealing with default layout data or layout data with some properties other than the default ones e.g.
		// sap.m.FlexItemData({
		//		growFactor: 1,
		//		alignSelf: "Stretch"
		// })
		for ( var sAggregationName in classDef.getMetadata().__designTimeOptions.aggregations) {
			var oDTAggregation = classDef.getMetadata().__designTimeOptions.aggregations[sAggregationName];
			if (oDTAggregation.layoutData) {
				var oLayoutData = oDTAggregation.layoutData();
				oDTAggregation._defaultLayoutData = hasDefaultProperties(oLayoutData);
				oDTAggregation._layoutDataName = oLayoutData.getMetadata().getName();
			}
		}

		function hasDefaultProperties(oControl) {
			var oProperties = oControl.getMetadata().getAllProperties();
			for ( var key in oProperties) {
				var propertyValue = (oProperties[key]._sGetter && oControl[oProperties[key]._sGetter]()) || oControl.getProperty(key);
				if (!oProperties[key].defaultValue && !propertyValue) {
					continue;
				} else if (propertyValue !== oProperties[key].defaultValue) {
					return false;
				}
			}
			return true;
		}
		var designTimeOptions = classDef.getMetadata().__designTimeOptions;
		if (designTimeOptions && jQuery.type(vClassDef) === "string") {
			aLoadedControls.push(vClassDef);
		}

	};

	// register unsupported controls
	adapter.registerUnsupported = function(sClassDef) {
		this.register(sClassDef, {
			display : false,
			draggable : false,
			resizable : false,
			unsupported : true
		});
	};

	adapter.getLoadedControls = function() {
		return aLoadedControls;
	};

	/* Generic Element aggregation renderer*/

	function renderElement(oRm, oControl) {
		oRm.write("<div");
		oRm.writeElementData(oControl);
		//TODO: replace control-specific parts in the class name
		oRm.addClass("sapUiSimpleFormTitleDesignTime");
		oRm.writeClasses();
		oRm.write(">" + this.getText() + "</div>");
	}

	/* Generic function to override a specific function of a Control to invoke callback
	 * after that specific function call
	 *
	 * oControl - the Control definition e.g. sap.m.Button, should not be an instance of the Control
	 * sFunctionName - the name of the function to override e.g. "onAfterRendering", it cannot be static function
	 * oCallbackFunction - the callback function to be called afterward
	 *  */
	function extendControlFunction(oControl, sFunctionName, oCallbackFunction) {
		if (oControl && oCallbackFunction) {
			var orgMethod = oControl.prototype[sFunctionName];
			oControl.prototype[sFunctionName] = function() {
				if (orgMethod) {
					orgMethod.apply(this, arguments);
				}
				oCallbackFunction.apply(this, arguments);
			};
		}
	}

	function extendOnAfterRendering(oControl, fnOnAfterRendering) {
		extendControlFunction(oControl, "onAfterRendering", fnOnAfterRendering);
	}

	function addEmptyControlBackground(oControl, fnCheckIfEmpty) {
		extendOnAfterRendering(oControl, function() {
			var oCtrl = arguments[0].srcControl;
			if (fnCheckIfEmpty(oCtrl)) {
				var elem = oCtrl.$();
				elem.addClass("sapUiDtNarrowEmptyContainer");
				elem.addClass("sapUiDtEmptyBackground");
			}
		});
	}
	
	function addEmptyImageBackground(oControl, fnCheckIfEmpty) {
		extendOnAfterRendering(oControl, function() {
			var oCtrl = arguments[0].srcControl;
			if (fnCheckIfEmpty(oCtrl)) {
				var elem = oCtrl.$();
				oCtrl.setSrc("none");
				elem.addClass("sapUiDtEmptyImage");
			}
		});
	}

	function addEmptyIconBackground(oControl, fnCheckIfEmpty) {
		extendOnAfterRendering(oControl, function() {
			var oCtrl = arguments[0].srcControl;
			if (fnCheckIfEmpty(oCtrl)) {
				var elem = oCtrl.$();
				elem.addClass("sapUiDtEmptyIcon");
			}
		});
	}

	function addSpacerStyle(oControl) {
		extendOnAfterRendering(oControl, function() {
			var oCtrl = arguments[0].srcControl;
			var elem = oCtrl.$();
			elem.addClass("sapUiDtToolbarSpacerStyle");
		});
	}

	adapter.register("sap.m.Button", {
		defaultSettings : {
			"text" : "Button",
			"width" : "100px"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Button.png",
		properties : {
			icon : {
				bindable : false
			},
			iconFirst : {
				bindable : false
			}
		},
		categories : [ "Action" ]
	});

	adapter.register("sap.m.SegmentedButton", {
		behavior : {
			constructor : function() {
				this.addButton(new sap.m.Button({
					text : 'Button'
				}));
				this.addButton(new sap.m.Button({
					text : 'Button'
				}));
			}
		},
		aggregations : {
			buttons : {
				cssSelector : ":sap-domref",
				show : function(oButton) {
					if (oButton) {
						oButton.bOutput = false;
					}
				},
				validateAsDropTarget : function(oDropTargetAggregationMetadata, oDraggedControl) {
					if (!(oDraggedControl instanceof sap.m.Button)) {
						throw new Error("SegmentedButton only accepts Buttons");
					}
				}
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt")
				+ "/libs/sap.m/sap.m.SegmentedButton.png",
		categories : [ "User Input" ]
	});
	
	//Patches segmentedButton error
	//TODO: remove when fixed in ui5
	sap.m.SegmentedButton.prototype.removeButton = function (oButton) {
		if (!(sap.ui.version.indexOf("1.29") > -1 || sap.ui.version.indexOf("1.30") > -1)){
			jQuery.sap.log.warning(">>>REMOVE this patch<<< Fix should be part of SAPUI5");
		}
		if (typeof oButton === 'undefined') {
			delete oButton.setEnabled;
			this.removeAggregation("buttons", oButton);
		}
	};

	adapter.register("sap.m.CheckBox", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.CheckBox.png",
		resizable : false,
		categories : [ "User Input" ]
	});
	
	extendControlFunction(sap.m.CheckBox, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;
		if (!ctrl._oLabel) {
			return;
		}
		if (ctrl._oLabel.getText().length == 0) {
			ctrl._oLabel.$().addClass("sapUiDtEmptyBackground").addClass("sapMRbBLabel");
		} else {
			ctrl._oLabel.$().removeClass("sapUiDtEmptyBackground").removeClass("sapMRbBLabel");
		}
	});

	adapter
			.register(
					"sap.m.Image",
					{
						defaultSettings : {
							width : "140px",
							height : "140px"
						},
						icon : jQuery.sap.getModulePath("sap.ui.dt")
								+ "/libs/sap.m/sap.m.Image.png",
						categories : [ "Display" ]
					});

	adapter.register("sap.m.Input", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Input.png",
		categories : [ "User Input" ]
	});

	addEmptyImageBackground(sap.m.Image, function(oCtrl) {
		var sSrc = oCtrl.getSrc();
		return !sSrc || sSrc === "" || sSrc === "none";
	});

	adapter.register("sap.m.Label", {
		resizable : false,
		defaultSettings : {
			text : "Label"
		},
		behavior : {
			constructor : function() {
				this.setWidth("100%");
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Label.png",
		categories : [ "Display" ]
	});
	addEmptyControlBackground(sap.m.Label, function(oCtrl) {
		if (oCtrl.getParent() && oCtrl.getParent().getMetadata()._sClassName == "sap.m.RadioButton" ||
				oCtrl.getParent() && oCtrl.getParent().getMetadata()._sClassName == "sap.m.CheckBox") {
			return false;
		}
		return oCtrl.getText().length === 0;
	});

	adapter.register("sap.m.DisplayListItem", {
		defaultSettings : {
			label : "List Item",
			value : "Value",
			type : sap.m.ListType.Navigation
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt")
				+ "/libs/sap.m/sap.m.DisplayListItem.png",
		categories : [ "List" ]
	});

	adapter.register("sap.m.InputListItem", {
		defaultSettings : {
			label : "Input List Item",
			type : sap.m.ListType.Navigation
		},
		behavior : {
			constructor : function() {
				this.addContent(new sap.m.Input({
					value : 'input'
				}));
			}
		},
		aggregations : {
			content : {
				cssSelector : ":sap-domref"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.InputListItem.png",
		categories : [ "List" ]
	});

	adapter
			.register(
					"sap.m.StandardListItem",
					{
						defaultSettings : {
							title : "List Item",
							description : "Description text",
							type : sap.m.ListType.Navigation
						},
						icon : jQuery.sap.getModulePath("sap.ui.dt")
								+ "/libs/sap.m/sap.m.StandardListItem.png",
						categories : [ "List" ]
					});

	adapter
			.register(
					"sap.m.List",
					{
						defaultSettings : {
							noDataText : "Drop list items here"
						},
						behavior : {
							constructor : function() {
								this.addItem(new sap.m.StandardListItem({
									title : "List Item 1",
									description : "Description text",
									type : sap.m.ListType.Navigation
								}));
								this.addItem(new sap.m.StandardListItem({
									title : "List Item 1",
									description : "Description text",
									type : sap.m.ListType.Navigation
								}));
								this.addItem(new sap.m.StandardListItem({
									title : "List Item 1",
									description : "Description text",
									type : sap.m.ListType.Navigation
								}));
							}
						},
						aggregations : {
							items : {
								cssSelector : ":sap-domref"
							}
						},
						icon : jQuery.sap.getModulePath("sap.ui.dt")
								+ "/libs/sap.m/sap.m.List.png",
						categories : [ "List" ]
					});

	adapter.register("sap.m.Page", {
		aggregations : {
			headerContent : {
				cssSelector : "header:first-child"
			},
			content : {
				cssSelector : ":sap-domref > section"
			}
		},
		css : "Page.designtime.css",
		overlay : true,
		draggable : false,
		removable : false,
		display : false,
		categories : [ "Container" ]
	});
	
	adapter.register("sap.ui.core.mvc.XMLView", {
		aggregations : {
			content : {
				cssSelector : ":sap-domref"
			}
		},
		overlay : true,
		draggable : false,
		removable : false,
		display : false,
		resizable : false,
		categories : [ "Container" ]
	});
	
	adapter.register("sap.m.RadioButton", {
		defaultSettings : {
			selected : true
		},
		resizable : false,
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.RadioButton.png",
		categories : [ "User Input" ]
	});
	
	extendControlFunction(sap.m.RadioButton, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;
		if (!ctrl._oLabel) {
			return;
		}
		if (ctrl._oLabel.getText().length == 0) {
			ctrl._oLabel.$().addClass("sapUiDtEmptyBackground");
		} else {
			ctrl._oLabel.$().removeClass("sapUiDtEmptyBackground");
		}
	});

	adapter.register("sap.m.SearchField", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.SearchField.png",
		categories : [ "User Input" ]
	});

	adapter.register("sap.m.TextArea", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.TextArea.png",
		categories : [ "User Input" ]
	});

	//PATCH: Downport setSelectedItem fix, that was already fixed in higher version
	//Needed to get sap.m.Select working. 
	jQuery.sap.require("sap.m.ListBase");
	var fnOriginalListBaseSetSelectedItem = sap.m.ListBase.prototype.setSelectedItem;
	sap.m.ListBase.prototype.setSelectedItem = function(oListItem) {
		if (!(sap.ui.version.indexOf("1.24") > -1 || sap.ui.version.indexOf("1.26") > -1)){
			jQuery.sap.log.warning(">>>REMOVE this patch<<< Fix should be part of SAPUI5");
		}
		
		if (!(oListItem instanceof sap.m.ListItemBase)) {
			jQuery.sap.log.warning("setSelectedItem is called without ListItem parameter " + oListItem + " on " + this.getId());
			return;
		}
		fnOriginalListBaseSetSelectedItem.apply(this, arguments);
	};
	
	sap.m.ListBase.prototype.setGrowing = function() {
		if (this._oGrowingDelegate) {
			this._oGrowingDelegate.destroy();
			this._oGrowingDelegate = null;
		}
	};
	
	jQuery.sap.require("sap.m.Select");

	adapter.register("sap.m.Select", {
		behavior : {
			constructor : function() {
				var oFirstItem = new sap.ui.core.ListItem({
					text : 'List Item 1',
					key : 'item1'
				});
				this.addItem(oFirstItem);
				this.addItem(new sap.ui.core.ListItem({
					text : 'List Item 2',
					key : 'item2'
				}));
				this.addItem(new sap.ui.core.ListItem({
					text : 'List Item 3',
					key : 'item3'
				}));
				this.setSelectedItem(oFirstItem);
			}
		},
		aggregations : {
			items : {
				cssSelector : ":sap-domref",
				show : function(oItem) {
					if (oItem) {
						this.setSelectedItem(oItem);
					}
				}
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Select.png",
		categories : [ "User Input" ]
	});

	adapter.register("sap.m.Slider", {
		defaultSettings : {
			width : '320px'
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Slider.png",
		categories : [ "User Input" ]
	});
	
	adapter.register("sap.m.DatePicker", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.DatePicker.png",
		categories : [ "User Input" ]
	});

	adapter.register("sap.m.Text", {
		defaultSettings : {
			text : "No text specified"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Text.png",
		categories : [ "Display" ]
	});

	addEmptyControlBackground(sap.m.Text, function(oCtrl) {
		return oCtrl.getText().length === 0;
	});

	adapter.register("sap.m.HBox", {
		behavior : {
			constructor : function() {
				this.setWidth("100%");
			}
		},
		aggregations : {
			items : {
				cssSelector : ":sap-domref",
				layoutData : function() {
					return new sap.m.FlexItemData({
						alignSelf : "Stretch"
					});
				}
			}
		},
		css : "HBox.designtime.css",
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.HBox.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.m.VBox", {
		behavior : {
			constructor : function() {
				this.setWidth("100%");
			}
		},
		aggregations : {
			items : {
				cssSelector : ":sap-domref",
				layoutData : function() {
					return new sap.m.FlexItemData({
						alignSelf : "Stretch"
					});
				}
			}
		},
		css : "VBox.designtime.css",
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.VBox.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.ui.layout.HorizontalLayout", {
		defaultSettings : {
			width : "100%"
		},
		behavior : {
			constructor : function() {
			}
		},
		aggregations : {
			content : {
				cssSelector : ":sap-domref"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.HBox.png",
		categories : [ "Layout" ]
	});

	adapter.register("sap.ui.layout.VerticalLayout", {
		defaultSettings : {
			width : "100%"
		},
		behavior : {
			constructor : function() {
			}
		},
		aggregations : {
			content : {
				cssSelector : ":sap-domref"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.VBox.png",
		categories : [ "Layout" ]
	});


	jQuery.sap.require("sap.m.Bar");
	extendControlFunction(sap.m.Bar, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;

		// when there is no content
		if (ctrl.getContentLeft().length === 0
			&& ctrl.getContentMiddle().length === 0
			&& ctrl.getContentRight().length === 0) {
			var elem = ctrl.$();

			elem.attr("style", null); // remove "display:none"
			elem.addClass("sapUiDtEmptyBackground");
		}
	});

	adapter.register("sap.m.Bar", {
		aggregations : {
			contentLeft : {
				cssSelector : ".sapMBarLeft"
			},
			contentMiddle : {
				cssSelector : ".sapMBarMiddle > .sapMBarPH"
			},
			contentRight : {
				cssSelector : ".sapMBarRight"
			}
		},
		css : "Bar.designtime.css",
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Bar.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.m.Switch", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Switch.png",
		categories : [ "User Input" ]
	});

	adapter.register("sap.m.Link", {
		defaultSettings : {
			text : "Link to URL"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Link.png",
		categories : [ "Action" ]
	});

	adapter.register("sap.m.ObjectNumber", {
		defaultSettings : {
			number : "100",
			unit : "Euro"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.ObjectNumber.png",
		categories : [ "Display" ]
	});

	//TODO: rendering not functional control's dom reference is null after rendering
	//TODO: the control makes no sense as a stand-alone control (it's valid only in context of Table and ObjectListItem but there's no other way to populate them with attributes now)
	adapter.register("sap.m.ObjectAttribute", {
		defaultSettings : {
			text : "attribute text"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt")
				+ "/libs/sap.m/sap.m.ObjectAttribute.png",
		categories : [ "Display" ]
	});

	adapter.register("sap.m.ObjectStatus", {
		defaultSettings : {
			text : "status text"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.ObjectStatus.png",
		categories : [ "Display" ]
	});

	adapter.register("sap.m.ObjectIdentifier", {
		defaultSettings : {
			title : "Title",
			text : "Text",
			badgeNotes : true,
			badgePeople : true,
			badgeAttachments : true
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt")
				+ "/libs/sap.m/sap.m.ObjectIdentifier.png",
		categories : [ "Display" ]
	});

	//TODO: The aggregations DOM structure is created only when an aggregation is performed and not available upfront. AppDesigner does not support this at the moment.
	adapter.register("sap.m.ObjectHeader", {
		defaultSettings : {
			intro : "Intro text",
			introActive : true,
			title : "Title",
			titleActive : true,
			number : "123",
			numberUnit : "eur"
		},
		aggregations : {
			attributes: {
				adjustDropTarget : adjustDropTargetsObjectHeader,
				cssSelector : ".sapMOHBottomRow"
			},
			statuses : {
				adjustDropTarget : adjustDropTargetsObjectHeader,
				cssSelector : ".sapMOHBottomRow"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.ObjectHeader.png",
		categories : [ "Display" ]
	});
	
	
	function adjustDropTargetsObjectHeader(oAggregation, oDraggedControl) {
		
		var oDraggedControl = oDraggedControl || this.__widget.getWidgets().getDraggable();

		if (oDraggedControl && oDraggedControl.getMetadata().getName() == "sap.m.ObjectAttribute") {
			return {
				aggregation : this.getMetadata().getAllAggregations().attributes,
				control : this
			};
		} else {
			return {
				aggregation : this.getMetadata().getAllAggregations().statuses,
				control : this
			};
		}
	}

	extendControlFunction(sap.m.ObjectHeader, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;

		// when there is no content
		if (ctrl.getStatuses().length === 0 && ctrl.getAttributes().length === 0) {
			var elem = ctrl.$();
			if (elem.find(".sapMOHBottomRow").length == 0) {
				var sel = jQuery('<div class="sapMOHBottomRow" style="height: 20px" data-aggregation="statuses">');
				sel.appendTo(elem);
			}
		}
	});
	
	addEmptyControlBackground(sap.m.ObjectHeader, function(oCtrl) {

		var bShowEmpty = true,
			bShowMarkers;
		
		if (	oCtrl.getIntro() ||
				oCtrl.getTitle() ||
				oCtrl.getNumber() ||
				oCtrl.getNumberUnit() ||
				oCtrl.getAttributes().length > 0 ||
				oCtrl.getStatuses().length > 0 ||
				oCtrl.getFirstStatus() ||
				oCtrl.getSecondStatus()
		) {
				bShowEmpty = false;
				return bShowEmpty; 
		}
		
		bShowMarkers = oCtrl.getShowMarkers();
		
		if (	bShowMarkers && oCtrl.getMarkFavorite() ||
				bShowMarkers && oCtrl.getMarkFlagged()
		) {
				bShowEmpty = false;
				return bShowEmpty;
		}
		
		return bShowEmpty;
	});

	adapter.register("sap.m.FeedListItem", {
		defaultSettings : {
			icon : sap.ui.core.IconPool.getIconURI("personnel-view"),
			text : "Feed List Item text",
			sender : "John Doe",
			timestamp : "Dec 02, 2012",
			info : "Waiting for Approval"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.FeedListItem.png",
		categories : [ "List" ]
	});

	adapter.register("sap.m.ObjectListItem",
			{
				defaultSettings : {
					type : "Active",
					intro : "On behalf of John Doe",
					title : "Object list item",
					number : "9999999999",
					numberUnit : "eur"
				},
				behavior : {
					constructor : function() {
						this.setFirstStatus(new sap.m.ObjectStatus({
							text : 'first status text'
						}));
						this.setSecondStatus(new sap.m.ObjectStatus({
							text : 'second status text'
						}));
						this.addAttribute(new sap.m.ObjectAttribute({
							text : 'attribute text'
						}));
					}
				},
				aggregations : {
					firstStatus : {
						cssSelector : ".sapMObjLBottomRow",
						adjustDropTarget : function(oAggregation) {
							var oDraggedControl = this.__widget.getWidgets().getDraggable();

							if (oDraggedControl && oDraggedControl.getMetadata().getName() == "sap.m.ObjectAttribute") {
								return {
									aggregation : this.getMetadata().getAllAggregations().attributes,
									control : oDraggedControl
								};
							} else if (oDraggedControl && oDraggedControl.getMetadata().getName() == "sap.m.ObjectStatus") {
								var aggregation;
								if (!this.getFirstStatus()) {
									aggregation = this.getMetadata().getAllAggregations().firstStatus;
								} else if (!this.getSecondStatus()) {
									aggregation = this.getMetadata().getAllAggregations().secondStatus;
								} else {
									return false;
								}
								// TODO: Wrong Implementation -> control is this control and not the one being dragged! (MW)
								return {
									aggregation : aggregation,
									control : oDraggedControl
								};
							}
						}
					},
					secondStatus : {
						cssSelector : ".sapMObjLBottomRow"
					},
					attributes : {
						cssSelector : ".sapMObjLBottomRow"
					}
				},
				icon : jQuery.sap.getModulePath("sap.ui.dt")
						+ "/libs/sap.m/sap.m.ObjectListItem.png",
				categories : [ "List" ]
			});

	extendControlFunction(sap.m.ObjectListItem, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;

		// when there is no content
		if (ctrl.getAttributes().length === 0 && !ctrl.getFirstStatus() && !ctrl.getSecondStatus()) {
			var elem = ctrl.$();
			if (elem.find(".sapMObjLBottomRow").length == 0) {
				var sel = jQuery('<div class="sapMObjLBottomRow" style="height: 20px" data-aggregation="firstStatus">');
				sel.appendTo(elem.find(".sapMLIBContent"));
			}
		}
	});

	jQuery.sap.require("sap.m.IconTabFilter");
	sap.m.IconTabFilter.prototype.renderer = renderElement;

	adapter.register("sap.m.IconTabFilter", {
		defaultSettings : {
			icon : "sap-icon://task",
			iconColor : sap.ui.core.IconColor.Critical,
			count : "10",
			text : "Open",
			key : "Open"
		},
		aggregations : {
			content : {
				cssSelector : ".sapMITBTab"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.IconTabFilter.png",
		categories : [ "Container" ],
		// IconTabFilter's must not serve as a drop target:
		// It's content aggregation is fed by a drop into the content aggregation of the IconTabFilter
		isntDropTarget : true
	});

	/*	jQuery.sap.require("sap.m.IconTabSeparator");
	sap.m.IconTabSeparator.prototype.renderer = renderElement;

	adapter.register("sap.m.IconTabSeparator");
	*/

	/* Touch event mode is needed by IconTabBar: Otherwise the icon bar is not scrollable
	 */
	jQuery.sap.touchEventMode = "ON"; // Needed by sap.m.IconTabBar
	jQuery.sap.require("sap.m.IconTabBar");


	/* Redefinition of _checkScrolling needed as of 10-2013:
	 * Otherwise the AppDesigner's performance is negatively affected
	 * -> Remove once function is not triggered with an interval timer any more
	 */
	sap.m.IconTabBar.prototype._checkScrolling = function(h, $) {
		var s = false;
		if (jQuery.sap.touchEventMode === 'ON') {
			var d = jQuery.sap.domById(this.getId() + '-scrollContainer');
			var a = jQuery.sap.domById(this.getId() + '-head');
			if (a.offsetWidth > d.offsetWidth) {
				s = true;
			}
		} else {
			if (h) {
				if (h.scrollWidth > h.clientWidth) {
					s = true;
				}
			}
		}
		if (s !== this._remember_s) {
			$.toggleClass('sapMITBScrollable', s);
			$.toggleClass('sapMITBNotScrollable', !s);
		}
		this._remember_s = s;
		return s;
	};

	extendControlFunction(sap.m.IconTabBar, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;
		//TODO: discuss if this is the right way to do it
		// 	refresh dropparea after rerendering to assign dragover handlers
		if (ctrl.__widget) {
			ctrl.__widget.eventBus.publish("droppables.refresh");
		}

		// when there is no content
		if ((ctrl.getContent().length === 0) && (ctrl.getItems().length === 0)) {

			var elem = ctrl.$();

			elem.attr("style", null); // remove "display:none"
			elem.addClass("sapUiDtEmptyContainer"); // show a rect with grey color backgroud
			elem.addClass("sapUiDtEmptyBackground");
		}
	});

	//TODO: The aggregations DOM structure is created only when an aggregation is performed and not available upfront. AppDesigner does not support this at the moment.
	adapter.register("sap.m.IconTabBar", {
		behavior : {
			constructor : function() {
				this.addItem(new sap.m.IconTabFilter({
					showAll : true,
					count : "22",
					text : "Orders",
					key : "All"
				}));
				//				this.addItem(new sap.m.IconTabSeparator());
				this.addItem(new sap.m.IconTabFilter({
					icon : "sap-icon://task",
					iconColor : sap.ui.core.IconColor.Critical,
					count : "10",
					text : "Open",
					key : "Open"
				}));
				var oShippedIconTabFilter = new sap.m.IconTabFilter({
					icon : "sap-icon://shipping-status",
					iconColor : sap.ui.core.IconColor.Positive,
					count : "5",
					text : "Shipped",
					key : "Shipped"
				});
				oShippedIconTabFilter.addContent(new sap.m.Text({
					text : 'Special content for this tab goes here ...'
				}));
				this.addItem(oShippedIconTabFilter);
				this.addContent(new sap.m.List({
					items : [ new sap.m.StandardListItem({
						title : "List Item 1"
					}), new sap.m.StandardListItem({
						title : "List Item 2"
					}), new sap.m.StandardListItem({
						title : "List Item 3"
					}) ]
				}));
			}
		},
		aggregations : {
			items : {
				cssSelector : ".sapMITBHead",
				validateAsDropTarget : function(oDropTargetAggregationMetadata, oDraggedControl) {
					// sap.m.IconTabBar's items aggregation does accept sap.m.IconTabFilters only
					if (oDraggedControl instanceof sap.m.IconTabFilter == false) {
						throw new Error("Validation fails");
					}
				},
				show : function(oItem) {
					if (oItem) {
						// Rerender icon tab bar if item to show has not yet been rendered
						if (!oItem.$().length) {
							this.rerender();
						}

						// Scroll icon tab filter into view
						this._getIconTabHeader()._scrollIntoView(oItem, 150);

						// Get it selected if there's a key; Don't select if already done
						if (oItem.getKey() && this.getSelectedKey() != oItem.getKey()) {
							this.setSelectedKey(oItem.getKey());
						}
						//TODO: discuss if this is the right way to do it
						if (this.__widget) {
							this.__widget.eventBus.publish("dom.changed");
						}
					}
				}
			},
			content : {
				cssSelector : ".sapMITBContent",
				adjustDropTarget : function(oAggregation) {

					// A drop to the IconTabBar content aggregation is delegated to the selected IconTabFilter's content aggregation, if
					// - it has a content or
					// - it has no content and the IconTabBar has no content as well.

					// Aggregation meta data are mandatory
					if (!oAggregation) {
						return;
					}

					// Detect control state
					var aItems = this.getItems();
					var aIconTabFilter = [];
					var aContent = this.getContent();
					var sSelectedKey = this.getSelectedKey();
					var oSelectedItem;

					// Determine IconTabFilter currently selected
					for ( var i = aItems.length - 1; i >= 0; i--) {
						var oCurrentItem = aItems[i];
						if (oCurrentItem.getMetadata().getName() === "sap.m.IconTabFilter") {
							aIconTabFilter.push(oCurrentItem);
							if (sSelectedKey === oCurrentItem.getKey()) {
								oSelectedItem = oCurrentItem;
								break;
							}
						}
					}

					// Adjust if visible content comes from tab filter
					if (aItems.length === 0 || !oSelectedItem || (aContent.length > 0 && oSelectedItem.getContent().length === 0)) {
						return false;
					} else {
						return {
							control : oSelectedItem,
							aggregation : oSelectedItem.getMetadata().getAllAggregations().content
						};
					}
				}
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.IconTabBar.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.m.Shell", {
		draggable : false,
		display : false,
		removable : false,
		resizable : false
	});

	adapter.register("sap.ui.core.Title", {
		defaultSettings : {
			text : "Title"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Title.png",
		categories : [ "Container" ]
	});

	//adapter.register("sap.ui.commons.RadioButtonGroup");
	jQuery.sap.require("sap.ui.layout.form.SimpleForm");

	// TODO: Remove this patch when bug is fixed in UI5
	// SIMPLE FORM PATCH BEGIN
	// =======================
	var _getFormContent = function(oForm) {

		var aElements = [];
		var aFormContainers = oForm.getFormContainers();

		for ( var i = 0; i < aFormContainers.length; i++) {
			var oFormContainer = aFormContainers[i];
			var oTitle = oFormContainer.getTitle();
			if (oTitle) {
				aElements.push(oTitle);
			}

			var aFormElements = oFormContainer.getFormElements();
			for ( var j = 0; j < aFormElements.length; j++) {
				var oFormElement = aFormElements[j];
				var oLabel = oFormElement.getLabel();
				if (oLabel) {
					aElements.push(oLabel);
				}
				var aFields = oFormElement.getFields();
				for ( var k = 0; k < aFields.length; k++) {
					var oField = aFields[k];
					aElements.push(oField);
				}
			}
		}

		return aElements;

	};
	sap.ui.layout.form.SimpleForm.prototype._formInvalidated = function(oOrigin) {
		if (!this._bChangedByMe) {
			var aContent = _getFormContent(this.getAggregation("form"));
			this.removeAllContent();
			for ( var i = 0; i < aContent.length; i++) {
				var oElement = aContent[i];
				this.addContent(oElement);
			}
		}
	};
	// =====================
	// SIMPLE FORM PATCH END
	adapter.register("sap.ui.layout.form.SimpleForm",
			{
				aggregations : {
					content : {
						cssSelector : ":sap-domref",
						validateAsDropTarget : function(oDropTargetAggregationMetadata, oDraggedControl) {
							if (!(oDraggedControl instanceof sap.ui.core.Title || oDraggedControl instanceof sap.ui.core.Control)) {
								throw new Error("Simple Form accepts only Title elements or controls");
							}
						}
					}
				},
				defaultSettings : {
					maxContainerCols : 2,
					layout : sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
				},
				behavior : {
					constructor : function() {
						this.addContent(new sap.ui.core.Title({
							text : "Title"
						}));
						this.addContent(new sap.m.Label({
							text : "Label 1"
						}));
						this.addContent(new sap.m.Input());
						this.addContent(new sap.m.Input());
						this.addContent(new sap.m.Label({
							text : "Label 2"
						}));
						this.addContent(new sap.m.Input());
					}
				},
				name : "Simple Form",
				properties : {
					layout : {
						display : false
					}
				},
				icon : jQuery.sap.getModulePath("sap.ui.dt")
						+ "/libs/sap.m/sap.m.ResponsiveForm.png",
				categories : [ "Layout" ]
			});

	jQuery.sap.require("sap.ui.core.Title");
	sap.ui.core.Title.prototype.renderer = renderElement;

	adapter.register("sap.m.GroupHeaderListItem", {
		icon : jQuery.sap.getModulePath("sap.ui.dt")
				+ "/libs/sap.m/sap.m.GroupHeaderListItem.png",
		categories : [ "List" ]
	});

	jQuery.sap.require("sap.ui.core.ListItem");
	sap.ui.core.ListItem.prototype.renderer = renderElement;

	adapter.register("sap.ui.core.ListItem", {
		defaultSettings : {
			text : "List item"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.ListItem.png",
		categories : [ "List" ]
	});

// scroll container currently not regarded as enabled.
// Issues regarding overlays of not visible content
// Enablement subject of BI: https://sapjira.wdf.sap.corp/browse/WATTWDF-332
//	jQuery.sap.require("sap.m.ScrollContainer");
//	extendControlFunction(sap.m.ScrollContainer, "onAfterRendering", function() {
//		var ctrl = arguments[0].srcControl;
//		if (ctrl.getContent().length === 0) {
//			var elem = ctrl.$();
//			elem.addClass("sapUiDtEmptyContainer");
//			elem.addClass("sapUiDtEmptyBackground");
//		}
//	});
//
//	/*  renders as an empty container and without content - hard to find and select */
//	adapter.register("sap.m.ScrollContainer", {
//		aggregations : {
//			content : {
//				cssSelector : ":sap-domref"
//			}
//		},
//		icon : jQuery.sap.getModulePath("sap.ui.dt")
//				+ "/libs/sap.m/sap.m.ScrollContainer.png",
//		categories : [ "Container" ]
//	});

	/* Renders hidden behind the title bar. In runtime you need to pull down this area to refresh. Since events are blocked in designtime it's not visible. */
//	adapter.register("sap.m.PullToRefresh", {
//		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.PullToRefresh.png",
//		categories : [ "Action" ]
//	});
	adapter.register("sap.m.ActionListItem",
			{
				defaultSettings : {
					label : "Action List Item",
					text : "Text",
					type : sap.m.ListType.Navigation
				},
				icon : jQuery.sap.getModulePath("sap.ui.dt")
						+ "/libs/sap.m/sap.m.ActionListItem.png",
				categories : [ "List" ]
			});

	adapter.register("sap.m.CustomListItem",
			{
				defaultSettings : {
					label : "Action List Item",
					text : "Text",
					type : sap.m.ListType.Navigation
				},
				behavior : {
					constructor : function() {
						this.addContent(new sap.m.Text({
							text : 'sample custom content'
						}));
					}
				},
				aggregations : {
					content : {
						cssSelector : ":sap-domref"
					}
				},
				icon : jQuery.sap.getModulePath("sap.ui.dt")
						+ "/libs/sap.m/sap.m.CustomListItem.png",
				categories : [ "List" ]
			});

	/* when there is no content, Toolbar is rendered with "display:none".
	 * however we need to show a rect for dropping controls.
	 *
	 * when switching between layout editor and code editor,
	 * the constructor defined in register behavior is not called
	 */
	jQuery.sap.require("sap.m.Toolbar");
	extendControlFunction(sap.m.Toolbar, "onAfterRendering", function() {
		var ctrl = arguments[0].srcControl;

		// when there is no content
		if (ctrl.getContent().length === 0) {
			var elem = ctrl.$();

			elem.attr("style", null); // remove "display:none"
			elem.addClass("sapUiDtEmptyContainer"); // show a rect with grey color backgroud
			elem.addClass("sapUiDtEmptyBackground");
		}
	});

	adapter.register("sap.m.Toolbar", {
		defaultSettings : {
			"width" : "100%"
		},
		aggregations : {
			content : {
				cssSelector : ":sap-domref"
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Button.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.m.ToolbarSpacer", {
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Button.png",
		categories : [ "Container" ],
		behavior : {
			validateDropTarget : function(oDropTargetAggregationMetadata, oDropTargetControl) {
				// sap.m.ToolbarSpacer may be dropped in a sap.m.Toolbar only
				if (oDropTargetControl.getMetadata().getName() != "sap.m.Toolbar") {
					throw new Error("Validation fails");
				}
			}
		}
	});
	addSpacerStyle(sap.m.ToolbarSpacer);

	jQuery.sap.require("sap.m.Panel");
	
	var PANEL_HEADER_TOOLBAR_CSS_SELECTOR =  ".sapMPanelHdr,.sapMPanelHdrExpandable, .sapMPanelWrappingDivTb, .layoutEditorSapMPanelHdrEmpty";
	
	extendOnAfterRendering(sap.m.Panel, function(oEvent) {
		// show dropping area for header/info Toolbar when there is no header/info Toolbar and header text
		var ctrl = oEvent.srcControl;

		var oHeaderToolbar = ctrl.getHeaderToolbar();
		
		if (!oHeaderToolbar && !ctrl.getHeaderText()) {
			ctrl.$().prepend("<div class=\"sapUiDtEmptyBackground layoutEditorSapMPanelHdrEmpty\"></div>");
		}
		if (!ctrl.getInfoToolbar()) {
			//ensure info toolbar is added below header!
			var $header;
			if (oHeaderToolbar){
				$header = oHeaderToolbar.$();
			} else {
				$header = ctrl.$().find(PANEL_HEADER_TOOLBAR_CSS_SELECTOR);
			}
			
			$header.after("<div class=\"sapUiDtEmptyBackground layoutEditorSapMPanelInfoToolbarEmpty\"></div>");
		}

	});

	adapter.register("sap.m.Panel", {
		defaultSettings : {
		},
		css : "Panel.designtime.css",
		aggregations : {
			headerToolbar : {
				//different with classes depending on expandable & expanded
				cssSelector : PANEL_HEADER_TOOLBAR_CSS_SELECTOR
			},
			infoToolbar : {
				cssSelector : ".layoutEditorSapMPanelInfoToolbarEmpty"
			},
			content : {
				cssSelector : ".sapMPanelContent",
				show : function(oItem){
					if (!this.getExpanded()){
						this.setExpanded(true);
					}
				}
			}
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Button.png",
		categories : [ "Container" ]
	});

	adapter.register("sap.ui.core.Icon", {
		defaultSettings : {
			"size" : "2em",
			"src" : "sap-icon://doctor"
		},
		icon : jQuery.sap.getModulePath("sap.ui.dt") + "/libs/sap.m/sap.m.Button.png",
		categories : [ "Display" ]
	});

	addEmptyIconBackground(sap.ui.core.Icon, function(oCtrl) {
		var sSrc = oCtrl.getSrc();
		return !sSrc || sSrc === "";
	});

	return adapter;
}, /* bExport= */ true);