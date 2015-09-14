/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.demokit.UI5EntityCueCard
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class UI5EntityCueCard renderer. 
	 * @static
	 */
	var UI5EntityCueCardRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	UI5EntityCueCardRenderer.render = function(rm, oControl){
	
		var bNavigable = oControl.getNavigable();
		var bDemokit = oControl.getStyle() == sap.ui.demokit.UI5EntityCueCardStyle.Demokit;
	
		function isPrimitive(sType) {
			while ( sType.slice(-2) == "[]" ) {
				sType = sType.slice(0, -2);
			}
			if ( sType.indexOf("sap.ui.core.") == 0 ) {
				sType = sType.slice("sap.ui.core.".length);
			}
			return /^(any|boolean|float|int|object|string|void)$/.test(sType);
		}
		
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.writeAttribute("class","sapDkCueCd");
		rm.write(">");
	
		var child = 0;
		
		function names(o) {
			var r = [];
			for (var s in o) {
				r.push(s);
			}
			r.sort(function(a,b) {
				var a_depr = o[a].deprecation ? 1 : 0;
				var b_depr = o[b].deprecation ? 1 : 0;
				var c = a_depr - b_depr;
				if ( c === 0 && a !== b ) {
					c = a < b ? -1 : 1;
				} // if c === 0 && a === b, c remains 0
				return c;
			});
			return r;
		}
		
		function alternate(i) {
			return " class='" + ((i % 2) ? "sapDkCueCdOdd" : "sapDkCueCdEven") + "'";
		}
		
		function kind(k) {
			if ( k === 0 ) {
				return "Property of type ";
			} else if ( k === 1 || k === 2 ) {
				return "Aggregation of type ";
			} else if ( k === 3 || k === 4 ) {
				return "Association of type ";
			} else if ( k === 6 ) {
				return "Event parameter of type ";
			} else if ( k === 7 ) {
				return "Return value of type ";
			} else if ( k === 6 ) {
				return "Method parameter of type ";
			} else {
				return "";
			}
		}
		
		function crossref(p, t, card) {
			if ( t ) {
				if ( card === "0..n" ) {
					return crossref(p, t) + "[]";
				}
				var bPrimitive = isPrimitive(t);
				var sShort = jQuery.sap.encodeHTML(t.split(".").slice(-1)[0]);
				var tfull = jQuery.sap.encodeHTML(kind(p.kind) + t);
				if ( bNavigable && (!bDemokit || !bPrimitive ) ) {
					return "<a class='sapDkLnk' id='" + oControl.getId() + "-l-" + (child++) + "' data-sap-ui-entity='" + t + "' title='" + tfull + "'>" + sShort + "</a>";
				} else {
					return "<span title='" + t + "'>" + sShort + "</span>";
				}
			}
			return '';
		}

		function deprClass(o) {
			return o.deprecation ? " sapDkCueCdDeprct" : "";
		}
		
		function deprDoc(o) {
			return o.deprecation ? "<br><i><b>Deprecated</b>: " + o.deprecation + "</i>" : "";
		}
		
		function defaultAggrClass(bIsDefault) {
			return bIsDefault ? " sapDkCueCdDfltAggr" : "";
		}
		
		function defaultAggrDoc(bIsDefault) {
			return bIsDefault ? "<br><b>Note</b>: This is the default aggregation." : "";
		}
		
		if ( !oControl.getCollapsible() || oControl.getExpanded() ) {
			
			var oDoc = oControl._getDoc();
			
			if ( oDoc ) {
				rm.write("<table>");
				if ( !bDemokit ) {
					rm.write("<tr><td colspan='3' class='sapDkCueCdHd0", deprClass(oDoc), "'>", oControl.getEntityName(), "</td></tr>");
					rm.write("<tr><td colspan='3' class='sapDkCueCdDoc'>", oDoc.doc || '', deprDoc(oDoc), "</td></tr>");
				}
				if ( oDoc.metatype === ".control" ) {
	
					var settings = jQuery.extend({}, oDoc.properties, oDoc.aggregations, oDoc.associations);
					var n = names(settings);
					if ( n.length > 0 ) {
						rm.write("<tr><td colspan='3' class='sapDkCueCdHd'>", "Properties, Aggregations, Associations", "</td></tr>");
						for (var i = 0; i < n.length; i++) {
							var oProp = settings[n[i]];
							rm.write("<tr", alternate(i), "><td class='sapDkCueCdName", deprClass(oProp), defaultAggrClass(n[i] === oDoc.defaultAggregation), "'>", n[i], "</td>", "<td class='sapDkCueCdType'>", crossref(oProp, oProp.type, oProp.cardinality), "</td>", "<td class='sapDkCueCdDoc'>", oProp.doc, deprDoc(oProp), defaultAggrDoc(n[i] === oDoc.defaultAggregation), "</td></tr>");
						}
					}
					
					var n = names(oDoc.events);
					if ( n.length > 0 ) {
						rm.write("<tr><td colspan='3' class='sapDkCueCdHd'>", "Events", "</td></tr>");
						for (var i = 0; i < n.length; i++) {
							var oEvent = oDoc.events[n[i]];
							rm.write("<tr", alternate(i), "><td class='sapDkCueCdName", deprClass(oEvent), "'>", n[i], "</td>", "<td class='sapDkCueCdType'>", "&nbsp", "</td>", "<td class='sapDkCueCdDoc'>", oEvent.doc, deprDoc(oEvent), "</td></tr>");
							var pnames = names(oEvent.parameters);
							for (var j = 0; j < pnames.length; j++) {
								var pn = pnames[j];
								var oParam = oEvent.parameters[pn];
								rm.write("<tr", alternate(i), "><td class='sapDkCueCdSubName", deprClass(oParam), "'>", pn, "</td>", "<td class='sapDkCueCdType'>", crossref(oParam, oParam.type), "</td>", "<td class='sapDkCueCdDoc'>", oParam.doc, deprDoc(oParam), "</td></tr>");
							}
						}
					}
					
					var n = names(oDoc.methods);
					if ( n.length > 0 ) {
						rm.write("<tr><td colspan='3' class='sapDkCueCdHd'>", "Methods", "</td></tr>");
						for (var i = 0; i < n.length; i++) {
							var oMethod = oDoc.methods[n[i]];
							var signature = n[i] + "(";
							for (var j = 0; j < oMethod.parameters.length; j++) {
								if ( j > 0 ) {
									signature += ",";
								}
								signature += oMethod.parameters[j].name;
							}
							signature += ")";
							rm.write("<tr", alternate(i), "><td class='sapDkCueCdName", deprClass(oMethod), "' colspan='2'>", signature, "</td>", "<td class='sapDkCueCdDoc'>", oMethod.doc, deprDoc(oMethod), "</td></tr>");
							for (var j = 0; j < oMethod.parameters.length; j++) {
								var oParam = oMethod.parameters[j];
								rm.write("<tr", alternate(i), "><td class='sapDkCueCdSubName", deprClass(oParam), "'>", oParam.name, "</td>", "<td class='sapDkCueCdType'>", crossref(oParam, oParam.type), "</td>", "<td class='sapDkCueCdDoc'>", oParam.doc, deprDoc(oParam), "</td></tr>");
							}
							if ( oMethod.type !== "sap.ui.core/void" ) {
								rm.write("<tr", alternate(i), "><td class='sapDkCueCdSubName'>", "<i>returns</i>", "</td>", "<td class='sapDkCueCdType'>", crossref(oMethod, oMethod.type), "</td>", "<td class='sapDkCueCdDoc'>", "&nbsp;", "</td></tr>");
							}
						}
					}
				}
				if ( oDoc.metatype === ".type" ) {
					var n = names(oDoc.values);
					if ( n.length > 0 ) {
						rm.write("<tr><td colspan='3' class='sapDkCueCdHd", deprClass(oDoc), "'>", "Values", "</td></tr>");
						for (var i = 0; i < n.length; i++) {
							var oValue = oDoc.values[n[i]];
							rm.write("<tr", alternate(i), "><td class='sapDkCueCdName", deprClass(oValue), "'>", n[i], "</td>", "<td class='sapDkCueCdType'>", "&nbsp;", "</td>", "<td class='sapDkCueCdDoc'>", oValue.doc, deprDoc(oValue), "</td></tr>");
						}
					}
					if ( oDoc.pattern ) {
						rm.write("<tr><td colspan='3' class='sapDkCueCdHd'>", "Constraints", "</td></tr>");
						rm.write("<tr", alternate(i), "><td class='sapDkCueCdName'>", "pattern", "</td>", "<td>", "&nbsp;", "</td>", "<td class='sapDkCueCdDoc'>", oDoc.pattern, "</td></tr>");
					}
				}
				rm.write("</table>");
			}

		}
		if ( oControl.getCollapsible() ) {
			rm.renderControl(oControl._oShowCueCardLink);
		}
		rm.write("</div>");
	};
	
	

	return UI5EntityCueCardRenderer;

}, /* bExport= */ true);
