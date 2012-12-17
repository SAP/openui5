/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.support.plugins.ControlTree (ControlTree support plugin)
jQuery.sap.declare("sap.ui.core.support.plugins.ControlTree");

jQuery.sap.require("sap.ui.core.support.Plugin");

(function() {

	/**
	 * Creates an instance of sap.ui.core.support.plugins.ControlTree.
	 * @class This class represents the ControlTree plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
	 * @abstract
	 * @extends sap.ui.base.Object
	 * @version 1.9.1-SNAPSHOT
	 * @constructor
	 * @private
	 * @name sap.ui.core.support.plugins.ControlTree
	 */
	sap.ui.core.support.Plugin.extend("sap.ui.core.support.plugins.ControlTree", {
		constructor : function(oSupportStub) {
			sap.ui.core.support.Plugin.apply(this, ["sapUiSupportControlTree", "Control Tree", oSupportStub]);
	
			this._oStub = oSupportStub;
			
			if (this.isToolPlugin()) {
				// TOOLS SIDE!
				this._aEventIds = [this.getId() + "Entry", "sapUiSupportSelectorSelect", "sapUiSupportControlProperties"];
			} else {
				// APPS SIDE!
				this._aEventIds = ["sapUiSupportRequestControlProperties", "sapUiSupportControlPropertyChange"];

				// register as core plugin
				var that = this;
				sap.ui.getCore().registerPlugin({
					startPlugin: function(oCore) {
						that.oCore = oCore;
					},
					stopPlugin: function() {
						that.oCore = undefined;
					}
				});
				
			}
		}
	});
	
	
	function initInTools(oSupportStub) {
		this.$().find("li img.sapUiControlTreeIcon").live("click", jQuery.proxy(this._onIconClick, this));
		this.$().find("li span").live("click", jQuery.proxy(this._onNodeClick, this));
		this.$().find("[data-sap-ui-name]").live("change", jQuery.proxy(this._onPropertyChange, this));
	};
	
	function initInApps(oSupportStub) {

		// Quirks mode (IE) doesn't have the JSON object
		if (JSON) {
			
			var oUIAreas = this.oCore.mUIAreas;
			var aControlTree = [];
			
			function serializeElement(oElement) {
				var mElement = {id: oElement.getId(), type: "", aggregation: [], association: []};
				if (oElement instanceof sap.ui.core.UIArea) {
					mElement.library = "sap.ui.core";
					mElement.type = "sap.ui.core.UIArea";
					jQuery.each(oElement.getContent(), function(iIndex, oElement) {
						var mChild = serializeElement(oElement);
						mElement.aggregation.push(mChild);
					});
				} else {
					mElement.library = oElement.getMetadata().getLibraryName();
					mElement.type = oElement.getMetadata().getElementName();
					if (oElement.mAggregations) {
						for (var sAggrName in oElement.mAggregations) {
							var oAggrElement = oElement.mAggregations[sAggrName];
							if (oAggrElement) {
								var aElements = jQuery.isArray(oAggrElement) ? oAggrElement : [oAggrElement];
								jQuery.each(aElements, function(iIndex, oValue) {
									// tooltips are also part of aggregations
									if (oValue instanceof sap.ui.core.Element) {
										var mChild = serializeElement(oValue);
										mElement.aggregation.push(mChild);
									}
								});
							}
						}
					}
					if (oElement.mAssociations) {
						for (var sAssocName in oElement.mAssociations) {
							var sAssocId = oElement.mAssociations[sAssocName];
							if (sAssocId) {
								var aAssocIds = jQuery.isArray(sAssocId) ? sAssocId : [sAssocId];
								jQuery.each(aAssocIds, function(iIndex, oValue) {
									mElement.association.push(oValue);
								});
							}
						}
					}
				}
				return mElement;
			};
			
			jQuery.each(this.oCore.mUIAreas, function(iIndex, oUIArea) {
				var mElement = serializeElement(oUIArea);
				aControlTree.push(mElement);
			});
			
			oSupportStub.sendEvent(this.getId() + "Entry", {controlTree: JSON.stringify(aControlTree)});
			
		}
		
	};
	
	sap.ui.core.support.plugins.ControlTree.prototype.init = function(oSupportStub){
		sap.ui.core.support.Plugin.prototype.init.apply(this, arguments);
		
		if (this.isToolPlugin()) {
			initInTools.call(this, oSupportStub);
		} else {
			initInApps.call(this, oSupportStub);
		}
		
	};

	

	sap.ui.core.support.plugins.ControlTree.prototype.exit = function(oSupportStub){
		sap.ui.core.support.Plugin.prototype.exit.apply(this, arguments);
		if (this.isToolPlugin()) {
			this.$().find("li img.sapUiControlTreeIcon").die();
			this.$().find("li span").die();
		}
	};
	
	
	/**
	 * Handler for sapUiSupportControlTreeEntry event
	 * @param {sap.ui.base.Event} oEvent the event
	 * @private
	 */
	sap.ui.core.support.plugins.ControlTree.prototype.onsapUiSupportControlTreeEntry = function(oEvent) {

		var that = this;
		var aControlTree = JSON.parse(oEvent.getParameter("controlTree"));
		
		function renderNode(mElement, rm) {
			var bHasChildren = mElement.aggregation.length > 0 || mElement.association.length > 0;
			rm.write("<li id=\"sap-debug-controltree-" + mElement.id + "\" class=\"sapUiControlTreeElement\">");
			var sImage = bHasChildren ? "minus" : "space";
			rm.write("<img class=\"sapUiControlTreeIcon\" style=\"height: 12px; width: 12px;\" align=\"middle\" src=\"../../../../testsuite/images/" + sImage + ".gif\" />");
			var sPath = mElement.library.replace(/\./g, "/") + "/images/controls/" + mElement.type + ".gif";
			rm.write("<img style=\"height: 16px; width: 16px;\" align=\"middle\" src=\"../../../../../test-resources/" + sPath + "\" />");
			var sClass = mElement.type.lastIndexOf(".") > 0 ? mElement.type.substring(mElement.type.lastIndexOf(".") + 1) : mElement.type;
			rm.write("<span title=\"" + mElement.type + "\">" + sClass + " - " + mElement.id + "</span>");
			if (mElement.aggregation.length > 0) {
				rm.write("<ul>");
				jQuery.each(mElement.aggregation, function(iIndex, oValue) {
					renderNode(oValue, rm);
				});
				rm.write("</ul>");
			}
			if (mElement.association.length > 0) {
				rm.write("<ul>");
				jQuery.each(mElement.association, function(iIndex, oValue) {
					rm.write("<li id=\"sap-debug-controltreelink-" + oValue + "\" class=\"sapUiControlTreeLink\">");
					rm.write("<img style=\"height: 12px; width: 12px;\" align=\"middle\" src=\"../../../../testsuite/images/space.gif\" />");
					rm.write("<img style=\"height: 12px; width: 12px;\" align=\"middle\" src=\"../../../../testsuite/images/link.gif\" />");
					rm.write("<span title='Association to \"" + oValue + "\"'>" + oValue + "</span>");
					rm.write("</li>");
				});
				rm.write("</ul>");
			}
			rm.write("</li>");
		}
		
		var rm = sap.ui.getCore().createRenderManager();
		rm.write("<div id=\"sapUiSupportControlTreeArea\"><ul>");
		jQuery.each(aControlTree, function(iIndex, oValue) {
			renderNode(oValue, rm);
		});
		rm.write("</ul></div><div id=\"sapUiSupportControlPropertiesArea\"></div>");
		rm.flush(this.$().get(0));
		rm.destroy();

	};

	
	sap.ui.core.support.plugins.ControlTree.prototype.onsapUiSupportSelectorSelect = function(oEvent) {
		var sControlId = oEvent.getParameter("id");
		jQuery(".sapUiControlTreeElement > span").removeClass("sapUiSupportControlTreeSelected");
		var that = this;
		jQuery.sap.byId("sap-debug-controltree-" + sControlId).parents("[data-sap-ui-collapsed]").each(function(iIndex, oValue) {
			that._onIconClick({srcElement: jQuery(oValue).find("img:first").get(0)});
		});
		var oPosition = jQuery.sap.byId("sap-debug-controltree-" + sControlId).children("span").addClass("sapUiSupportControlTreeSelected").position();
		var iScrollTop = this.$().find("#sapUiSupportControlTreeArea").scrollTop();
		this.$().find("#sapUiSupportControlTreeArea").scrollTop(iScrollTop + oPosition.top);
		
		this._oStub.sendEvent("sapUiSupportRequestControlProperties", {id: sControlId});
		
	};
	
	sap.ui.core.support.plugins.ControlTree.prototype._onNodeClick = function(oEvent) {
		var oSource = oEvent.srcElement || oEvent.target;
		var $li = jQuery(oSource).closest("li");
		if ($li.hasClass("sapUiControlTreeElement")) {
			jQuery(".sapUiControlTreeElement > span").removeClass("sapUiSupportControlTreeSelected");
			$li.children("span").addClass("sapUiSupportControlTreeSelected");
			this._oStub.sendEvent("sapUiSupportSelectorHighlight", {id: $li.attr("id").substring("sap-debug-controltree-".length)});
			this._oStub.sendEvent("sapUiSupportRequestControlProperties", {id: $li.attr("id").substring("sap-debug-controltree-".length)});
		}
		oEvent.stopPropagation();
	};
	
	sap.ui.core.support.plugins.ControlTree.prototype._onIconClick = function(oEvent) {
		var oSource = oEvent.srcElement || oEvent.target;
		var $source = jQuery(oSource);
		if ($source.parent().attr("data-sap-ui-collapsed")) {
			$source.attr("src", $source.attr("src").replace("plus", "minus")).parent().removeAttr("data-sap-ui-collapsed");
			$source.siblings("ul").show();
		} else {
			$source.attr("src", $source.attr("src").replace("minus", "plus")).parent().attr("data-sap-ui-collapsed", "true");
			$source.siblings("ul").hide();
		}
		if (oEvent.stopPropagation) {
			oEvent.stopPropagation();
		}
	};
	
	
	sap.ui.core.support.plugins.ControlTree.prototype.onsapUiSupportRequestControlProperties = function(oEvent) {
	
		var pSimpleType = /^((boolean|string|int|float)(\[\])?)$/;

		var aControlProps = [];
		
		var oControl = sap.ui.getCore().byId(oEvent.getParameter("id"));
		
		if (!oControl && sap.ui.getCore().getUIArea(oEvent.getParameter("id"))) {

			aControlProps.push({
				control: "sap.ui.core.UIArea",
				properties: [],
				aggregations: []
			});
			
		} else if (oControl) {
			
			var oMetadata = oControl.getMetadata();
			
			while(oMetadata instanceof sap.ui.core.ElementMetadata) {
				
				var mControlProp = {
					control: oMetadata.getName(),
					properties: [],
					aggregations: []
				};
				
				var mProperties = oMetadata.getProperties();
				jQuery.each(mProperties, function(sKey, oProperty) {
					var mProperty = {};
					jQuery.each(oProperty, function(sName, sValue) {
						if (sName.substring(0, 1) !== "_") {
							mProperty[sName] = sValue;
						}
						var oType = sap.ui.base.DataType.getType(oProperty.type);
						if (oType && !(oType instanceof sap.ui.base.DataType)) {
							mProperty["enumValues"] = oType;
						}
					});
					mProperty.value = oControl.getProperty(sKey);
					mControlProp.properties.push(mProperty);
				});
				
				var mAggregations = oMetadata.getAggregations();
				jQuery.each(mAggregations, function(sKey, oAggregation) {
					if (oAggregation.altTypes && oAggregation.altTypes[0] && pSimpleType.test(oAggregation.altTypes[0])) {
						var mAggregation = {};
						jQuery.each(oAggregation, function(sName, sValue) {
							if (sName.substring(0, 1) !== "_") {
								mAggregation[sName] = sValue;
							}
						});
						mAggregation.value = oControl.getAggregation(sKey);
						mControlProp.aggregations.push(mAggregation);
					}
				});
				
				aControlProps.push(mControlProp);
				
				oMetadata = oMetadata.getParent();
				
			}

		}
		
		this._oStub.sendEvent("sapUiSupportControlProperties", {id: oEvent.getParameter("id"), properties: JSON.stringify(aControlProps)});
		
	};
	
	
	sap.ui.core.support.plugins.ControlTree.prototype.onsapUiSupportControlProperties = function(oEvent) {
	
		var aControlProps = JSON.parse(oEvent.getParameter("properties"));

		var rm = sap.ui.getCore().createRenderManager();
		rm.write("<ul data-sap-ui-controlid='" + oEvent.getParameter("id") + "'>");
		jQuery.each(aControlProps, function(iIndex, oValue) {
			
			rm.write("<li>");
			
			rm.write("<span><label class='sapUiSupportLabel'>BaseType:</label> <code>" + oValue.control + "</code></span>");
			
			if (oValue.properties.length > 0 || oValue.aggregations.length > 0) {
				
				rm.write("<div class=\"sapUiSupportControlProperties\"><table><colgroup><col width=\"50%\"/><col width=\"50%\"/></colgroup>");
				
				jQuery.each(oValue.properties, function(iIndex, oProperty) {
					
					rm.write("<tr><td>");
					
					rm.write("&nbsp;&nbsp;<label class='sapUiSupportLabel'>" + oProperty.name + "</label>");
					rm.write("</td><td>");
					
					if (oProperty.type === "boolean") {

						rm.write("<input type='checkbox' ");
						rm.write("data-sap-ui-name='" + oProperty.name + "' ");
						if (oProperty.value == true) {
							rm.write("checked='checked'");
						}
						rm.write("/>");
						
					} else if (oProperty.enumValues) {
						
						rm.write("<div><select ");
						rm.write("data-sap-ui-name='" + oProperty.name + "'>");
						jQuery.each(oProperty.enumValues, function(sKey, sValue) {
							rm.write("<option>");
							rm.writeEscaped(sKey);
							rm.write("</option>");
						})
						rm.write("</select></div>");
						
					} else {
						
						rm.write("<div><input type='text' ");
						rm.write("data-sap-ui-name='" + oProperty.name + "' ");
						if (oProperty.value) {
							rm.write("value='");
							rm.writeEscaped("" + oProperty.value);
							rm.write("'");
						}
						rm.write("/></div>");
						
						
					}
					
					rm.write("</td></tr>");
					
				});

				jQuery.each(oValue.aggregations, function(iIndex, oAggregation) {
					
					rm.write("<tr><td>");
					
					rm.write("&nbsp;&nbsp;<label class='sapUiSupportLabel'>" + oAggregation.name + "</label>");
					rm.write("</td><td>");
					
					rm.write(jQuery.sap.encodeHTML("" + oAggregation.value));
					
					rm.write("</td></tr>");
					
				});

				rm.write("</table></div>");
				
			}
			
			rm.write("</li>");
			
		});
		rm.write("</ul>");
		rm.flush(this.$().find("#sapUiSupportControlPropertiesArea").get(0));
		rm.destroy();
		
	};
	
	
	sap.ui.core.support.plugins.ControlTree.prototype._onPropertyChange = function(oEvent) {
		var oSource = oEvent.srcElement || oEvent.target;
		var $input = jQuery(oSource);
		var sId = $input.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid");
		var sValue = $input.val();
		if ($input.attr("type") === "checkbox") {
			sValue = "" + $input.is(":checked");
		}
		
		this._oStub.sendEvent("sapUiSupportControlPropertyChange", {id: sId, name: $input.attr("data-sap-ui-name"), value: sValue });
	};
	
	sap.ui.core.support.plugins.ControlTree.prototype.onsapUiSupportControlPropertyChange = function(oEvent) {
		
		var sId = oEvent.getParameter("id");
		var oControl = sap.ui.getCore().byId(sId);
		
		if (oControl) {

			var sName = oEvent.getParameter("name");
			var sValue = oEvent.getParameter("value");
			
			var oMetadata = oControl.getMetadata();
			oMetadata.getJSONKeys(); // hack to enrich the properties
			var oProperty = oControl.getMetadata().getAllProperties()[sName];
			
			if (oProperty && oProperty.type) {
				
				var oType = sap.ui.base.DataType.getType(oProperty.type);
				if (oType instanceof sap.ui.base.DataType) {
					
					// DATATYPE
					
					var vValue = oType.parseValue(sValue);
					if (oType.isValid(vValue) && vValue !== "(null)" ) {
						oControl[oProperty._sMutator](vValue);
					}
					
				} else if (oType) {
					
					// ENUM
					
					if (oType[sValue]) {
						oControl[oProperty._sMutator](sValue);
					}
					
				}
				
			}
			
		}
		
	};
		
}());