/*!
 * ${copyright}
 */
// Creates Index Page within the Demokit
sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool', './IndexLayout', 'sap/ui/model/json/JSONModel', 'jquery.sap.encoder'],
	function(jQuery, IconPool, IndexLayout, JSONModel/* , jQuerySap */) {
	"use strict";


	
	var IndexLayoutPage = function IndexPage(oData, sTarget, sBaseUrl, bCustomFont) {
		
		var oModel = new JSONModel(oData);
		sap.ui.getCore().setModel(oModel);
		
		var oCatIndex = new IndexLayoutPage.Repeat({
			categories: {
				path: "/categories",
				template: new IndexLayoutPage.Cat({
					title: "{text}",
					layout: new IndexLayout({
						enableScaling: true,
						content: {
							path: "links",
							template: new IndexLayout._Tile({
								title: "{text}",
								description: "{desc}",
								target: sTarget,
								icon: {
									path: "icon",
									formatter: function(ico){
										if (!ico) {
											ico = "learning-assistant";
										}
										return "sap-icon://" + ico;
									}
								},
								href: "{ref}"
							})
						}
					})
				})
			}
		});
		
		if (bCustomFont) {
			IconPool.addIcon("explored", "custom", "brandico", "e001", true);
			IconPool.addIcon("cart", "custom", "brandico", "e002", true); //Obsolete?
			IconPool.addIcon("makit", "custom", "brandico", "e005", true); //Obsolete?
			IconPool.addIcon("helloworld", "custom", "brandico", "e003", true); //Obsolete?
			IconPool.addIcon("poa", "custom", "brandico", "e007", true); //Obsolete?
			IconPool.addIcon("flexbox", "custom", "brandico", "e00A", true); //Obsolete?
			IconPool.addIcon("crud", "custom", "brandico", "e009", true); //Obsolete?
			IconPool.addIcon("icon-explorer", "custom", "brandico", "e006", true); //Obsolete?
			IconPool.addIcon("splitapp", "custom", "brandico", "e00C", true);
			IconPool.addIcon("mvc", "custom", "brandico", "e00B", true); //Obsolete?
		}
		
		sap.ui.getCore().attachInit(function(){
			if (bCustomFont) {
				var sFontBaseUrl = jQuery.sap.getModulePath("", "/../test-resources/sap/m/demokit/demokit-home/");
				IndexLayoutPage._introduceCustomFont("brandico", sFontBaseUrl, "demoAppsIconFont");
			}
			
			jQuery("body").append("<div id='root'></div>");
			oCatIndex.placeAt("root");
		});
	};
	
	
	sap.ui.core.Element.extend("sap.ui.demokit.IndexLayoutPage.Cat", {
		metadata : {
			properties : {
				"title" : "string"
			},
			aggregations : {
				"layout": {type : "sap.ui.demokit.IndexLayout", multiple : false}
			}
		}
	});
	
	
	sap.ui.core.Control.extend("sap.ui.demokit.IndexLayoutPage.Repeat", {
		metadata : {
			aggregations : {
				"categories" : {type : "sap.ui.demokit.IndexLayoutPage.Cat", multiple : true}
			}
		},
		
		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.write(">");
			
			var aCats = oControl.getCategories();
			for (var i = 0; i < aCats.length; i++) {
				oRm.write("<div");
				oRm.writeElementData(aCats[i]);
				oRm.write(">");
				if (aCats[i].getTitle()) {
					oRm.write("<h2>");
					oRm.writeEscaped(aCats[i].getTitle());
					oRm.write("</h2>");
				}
				oRm.renderControl(aCats[i].getLayout());
				oRm.write("</div>");
			}
			
			oRm.write("</div>");
		}
	});
	
	
	IndexLayoutPage._introduceCustomFont = function(sFamilyName, sFontPath, sFontFile){
		var sFontFace = "@font-face {" +
			"font-family: '" + sFamilyName + "';" +
			"src: url('" + sFontPath + sFontFile + ".eot');" +
			"src: url('" + sFontPath + sFontFile + ".eot?#iefix') format('embedded-opentype'), url('" + sFontPath + sFontFile + ".ttf') format('truetype');" +
			"font-weight: normal;" +
			"font-style: normal;" +
			"}";
		jQuery('head').append('<style type="text/css">' + sFontFace + '</style>');
	};

	return IndexLayoutPage;

}, /* bExport= */ true);
