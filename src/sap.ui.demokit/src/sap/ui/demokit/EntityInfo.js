/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from metamodel entities
sap.ui.define(['jquery.sap.global', './util/jsanalyzer/ModuleAnalyzer'],
	function(jQuery, analyzer) {
	"use strict";

	var oRootPackageInfo = {};
	
	function getPackageInfo(sName) {
		var aParts = sName.split('.');
		var oPackageInfo = oRootPackageInfo;
		var l = aParts.length - 1;
		for (var i = 0; i < l && !oPackageInfo.__noMetamodel && !oPackageInfo.__noSource; i++ ) {
			oPackageInfo = oPackageInfo[aParts[i]] || (oPackageInfo[aParts[i]] = {});
		}
		return oPackageInfo;
	}

	// just a hack, needs proper type resolution
	var CORE_TYPES = "boolean int float number function object string void any Element Control Component";
		
	function resolve(sType, sContextName) {
		if ( sType.indexOf("/") >= 0 ) {
			return sType.replace(/\//g, ".");
		} else if ( sType && sType.indexOf(".") < 0 && CORE_TYPES.indexOf(sType) >= 0 ) {
			return "sap.ui.core." + sType;
		} else {
			return sContextName.split(".").slice(0, -1).concat([sType.replace(/\//g, ".")]).join(".");
		}
	}

	function parseControlMetamodel(oData, sEntityName) {
		
		var $control = jQuery(oData.documentElement);
		var oEntityDoc = {
			metatype : 'control',
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
		oEntityDoc.baseType = (sBaseType) ? resolve(sBaseType, sEntityName) : null;
		
		oEntityDoc.doc = doc($control);
		oEntityDoc.deprecation = depr($control);
		
		each($control, "properties/property", function($prop) {
			oEntityDoc.properties[$prop.attr("name")] = {
				kind : 0,
				type : resolve($prop.attr("type") || "string", sEntityName),
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
				type : resolve($aggr.attr("type") || "sap.ui.core/Control", sEntityName),
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
				type : resolve($assoc.attr("type") || "sap.ui.core/Control", sEntityName),
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
					type : resolve($param.attr("type") || "string", sEntityName),
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
				type : resolve($method.attr("type") || "sap.ui.core/void", sEntityName),
				doc : doc($method),
				deprecation : depr($method),
				since : $method.attr("since") || null,
				parameters : []
			};
			each($method, "parameters/parameter", function($param) {
				oEntityDoc.methods[sName].parameters.push({
					kind: 8,
					name : $param.attr("name"),
					type : resolve($param.attr("type") || "sap.ui.core/Control", sEntityName),
					doc : doc($param),
					since : $param.attr("since") || null,
					deprecation : depr($param)
				});
			});
		});

		return oEntityDoc;
	}
		
	function parseTypeMetamodel(oData, sEntityName) {

		var $type = jQuery(oData.documentElement);
		var oEntityDoc = {
			metatype : 'type',
			doc : undefined,
			deprecation : false,
			values : {}
		};
		
		oEntityDoc.doc = doc($type);
		oEntityDoc.deprecation = depr($type);
		
		each($type, "enumeration/value", function($value) {
			var sName = $value.attr("name");
			oEntityDoc.values[sName] = {
				value : $value.attr("value") || sName,
				doc : doc($value),
				deprecation : depr($value)
			};
		});
		
		oEntityDoc.pattern = $type.children("pattern").text();
		oEntityDoc.baseType = resolve($type.children("baseType").text(), sEntityName);
		
		return oEntityDoc;
	}
	
	function parseJavascript(oData, sEntityName, sModuleName) {
		
		// delegate Javascript parsing to ModuleAnalyzer
		return analyzer.analyze(oData, sEntityName, sModuleName);

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
	
	function load(sName, sType, sDataType, fnParser, sEntityName) {

		var oEntityDoc;
		
		jQuery.ajax({
			async: false,
			url : jQuery.sap.getModulePath(sName, sType),
			dataType : sDataType,
			success : function(vResponse) {
				oEntityDoc = fnParser(vResponse, sEntityName, sName.replace(/\./g,'/'));
			},
			error : function (err) {
				jQuery.sap.log.debug("tried to load entity docu for: " + sName + sType);
			}
		});
		
		return oEntityDoc;

	}

	function get(sEntityName, sType) {
		
		var bControl = !sType || sType === "control";
		var bType = !sType || sType === "type";
		var oPackageInfo = getPackageInfo(sEntityName);
		var oEntityDoc;
		
		if ( !oEntityDoc && !oPackageInfo.__noMetamodel ) {
			if ( !oEntityDoc && bControl ) {
				oEntityDoc = load(sEntityName, ".control", "xml", parseControlMetamodel, sEntityName);
			}
			if ( !oEntityDoc && bType ) {
				oEntityDoc = load(sEntityName, ".type", "xml", parseTypeMetamodel, sEntityName);
			}
			if ( oEntityDoc ) {
				oPackageInfo.__noSource = true;
			}
		} else if ( oPackageInfo.__noMetamodel ) {
			jQuery.sap.log.debug("ancestor package for " + sEntityName + " is marked with 'noMetamodel'");
		}
		if ( !oEntityDoc && !oPackageInfo.noSource ) {
			if ( !oEntityDoc && bType ) {
				var sLibraryName = sEntityName.replace(/\.[^.]+$/, ".library");
				oEntityDoc = load(sLibraryName, ".js", "text", parseJavascript, sEntityName);
			}
			if ( !oEntityDoc ) {
				oEntityDoc = load(sEntityName, ".js", "text", parseJavascript, sEntityName);
			}
			if ( oEntityDoc ) {
				oPackageInfo.__noMetamodel = true;
			}
		} else if ( oPackageInfo.__noSource ) {
			jQuery.sap.log.debug("ancestor package for " + sEntityName + " is marked with 'noSource'");
		}
		
		return oEntityDoc;
	
	}

	var EntityInfo = {
	
		getEntityDocu : function (sEntityName, sType, bResolveInheritance) {
		
			function merge(a,b) {
				for (var n in b) {
					if ( b.hasOwnProperty(n) && !a.hasOwnProperty(n) ) { // do not overwrite existing entries
						a[n] = b[n];
					}
				}
			}
			
			// read info from first document
			var oEntityDoc = get(sEntityName, sType);

			// collect entries from base types 
			if ( bResolveInheritance ) {
				var oDoc = oEntityDoc;
				while ( oDoc && oDoc.baseType ) {
					oDoc = get(oDoc.baseType, oDoc.metatype);
					if ( oDoc ) {
						merge(oEntityDoc.properties, oDoc.properties);
						merge(oEntityDoc.aggregations, oDoc.aggregations);
						merge(oEntityDoc.associations, oDoc.assocations);
						merge(oEntityDoc.events, oDoc.events);
						merge(oEntityDoc.methods, oDoc.methods);
					}
				}
			}
			
			return oEntityDoc;
			
		}
		
	};
	
	return EntityInfo;

}, /* bExport= */ true);
