/*!
 * @copyright@
 */

// Provides reuse functionality for reading documentation from metamodel entities
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	var EntityInfo = {
	
		getEntityDocu : function (sEntityName, fnCallback) {
	
			var oEntityDoc = this._oDocumentation;
			
			if ( !oEntityDoc || oEntityDoc.name !== sEntityName ) {
				oEntityDoc = undefined;
				load(sEntityName, ".control");
				if ( !oEntityDoc ) {
					load(sEntityName, ".type");
				}
				this._oDocumentation = oEntityDoc;
				return oEntityDoc;
			}
			
			function load(sName, sType) {
	
				var PARSERS = {
					".control" : parseControl,
					".type"    : parseType
				};
				
				// just a hack, needs proper type resolution
				var CORE_TYPES = "boolean int float number function object string void any Element Control Component";
				
				function parseControl($control) {
					
					oEntityDoc = oEntityDoc || {
						baseType : undefined,
						doc : undefined,
						deprecation : undefined,
						properties : {},
						aggregations : {},
						associations : {},
						events : {},
						methods : {}
					};
					
					var sBaseType = $control.children("baseType").text();
					oEntityDoc.baseType = oEntityDoc.baseType || ((sBaseType) ? resolve(sBaseType) : null);
					
					oEntityDoc.doc = oEntityDoc.doc || doc($control);
					oEntityDoc.deprecation = oEntityDoc.deprecation || depr($control);
					
					each($control, "properties/property", function($prop) {
						oEntityDoc.properties[$prop.attr("name")] = {
							kind : 0,
							type : resolve($prop.attr("type") || "string"),
							defaultValue : $prop.attr("defaultValue") || "empty/undefined",
							doc : doc($prop),
							deprecation : depr($prop),
							since : $prop.attr("since") || null
						};
					});
					
					oEntityDoc.defaultAggregation = oEntityDoc.defaultAggregation || $control.children("aggregations").attr("default");
					each($control, "aggregations/aggregation", function($aggr) {
						oEntityDoc.aggregations[$aggr.attr("name")] = {
							kind : $aggr.attr("cardinality") === "0..1" ? 1 : 2,
							type : resolve($aggr.attr("type") || "sap.ui.core/Control"),
							cardinality : $aggr.attr("cardinality") || "0..n",
							visibility : $aggr.attr("visibility") || null,
							doc : doc($aggr),
							deprecation : depr($aggr),
							since : $aggr.attr("since") || null
						};
					});
					
					each($control, "associations/association", function($assoc) {
						oEntityDoc.associations[$assoc.attr("name")] = {
							kind : $assoc.attr("cardinality") === "0..n" ? 4 : 3,
							type : resolve($assoc.attr("type") || "sap.ui.core/Control"),
							cardinality : $assoc.attr("cardinality") || "0..1",
							doc : doc($assoc),
							deprecation : depr($assoc),
							since : $assoc.attr("since") || null
						};
					});
					
					each($control, "events/event", function($event) {
						var sName = $event.attr("name");
						oEntityDoc.events[sName] = {
							kind : 5,
							doc : doc($event),
							deprecation : depr($event),
							since : $event.attr("since") || null,
							parameters : []
						};
						each($event, "parameters/parameter", function($param) {
							oEntityDoc.events[sName].parameters[$param.attr("name")] = {
								kind : 6,
								type : resolve($param.attr("type") || "string"),
								doc : doc($param),
								since : $param.attr("since") || null,
								deprecation : depr($param)
							};
						});
					});
					
					each($control, "methods/method", function($method) {
						var sName = $method.attr("name");
						oEntityDoc.methods[sName] = {
							kind : 7,
							type : resolve($method.attr("type") || "sap.ui.core/void"),
							doc : doc($method),
							deprecation : depr($method),
							since : $method.attr("since") || null,
							parameters : []
						};
						each($method, "parameters/parameter", function($param) {
							oEntityDoc.methods[sName].parameters.push({
								kind: 8,
								name : $param.attr("name"),
								type : resolve($param.attr("type") || "sap.ui.core/Control"),
								doc : doc($param),
								since : $param.attr("since") || null,
								deprecation : depr($param)
							});
						});
					});
					
					if ( sBaseType ) {
						load(sBaseType, ".control");
					}
				}
					
				function parseType($type) {
			
					oEntityDoc = oEntityDoc || {
						doc : undefined,
						deprecation : false,
						values : {}
					};
					
					oEntityDoc.doc = oEntityDoc.doc || doc($type);
					oEntityDoc.deprecation = oEntityDoc.deprecation || depr($type);
					
					each($type, "enumeration/value", function($value) {
						var sName = $value.attr("name");
						oEntityDoc.values[sName] = {
							value : $value.attr("value") || sName,
							doc : doc($value),
							deprecation : depr($value)
						};
					});
					
					oEntityDoc.pattern = $type.children("pattern").text();
					
					var sBaseType = $type.children("baseType").text();
					if ( sBaseType ) {
						load(sBaseType, ".type");
					}
				}
				
				function each($,sNames,fnCallback) {
					jQuery.each(sNames.split("/"), function(i,n) {
						$ = $.children(n);
					});
					$.each(function(i,e) {
						fnCallback(jQuery(e));
					});
				}
				
				function doc($) {
					return $.children("documentation").text();
				}
			
				function depr($) {
					return $.children("deprecation").text();
				}
				
				function resolve(sType) {
					if ( sType.indexOf("/") >= 0 ) {
						return sType.replace(/\//g, ".");
					} else if ( sType && sType.indexOf(".") < 0 && CORE_TYPES.indexOf(sType) >= 0 ) {
						return "sap.ui.core." + sType;
					} else {
						return sName.split(".").slice(0, -1).concat([sType.replace(/\//g, ".")]).join(".");
					}
				}
			
				jQuery.ajax({
					async: false,
					url : jQuery.sap.getModulePath(sName, sType),
					dataType : 'xml',
					success : function(oXMLDoc) {
						PARSERS[sType](jQuery(oXMLDoc.documentElement));
						oEntityDoc.name = sName;
						oEntityDoc.metatype = sType;
					},
					error : function (err) {
						jQuery.sap.log.error("tried to load entity docu for: " + sName + sType);
					}
				});
			}
		}
	};

	return EntityInfo;

}, /* bExport= */ true);
