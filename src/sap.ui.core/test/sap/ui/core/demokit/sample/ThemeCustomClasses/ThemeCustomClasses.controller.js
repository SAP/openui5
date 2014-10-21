sap.ui.controller("sap.ui.core.sample.ThemeCustomClasses.ThemeCustomClasses", {
	// whole code in controller is irrelevant for usage! 
	// only for sample display
	onInit: function () {
		var sheets = document.styleSheets;
		var themeClasses = {"Styles" : []};
		for(var i in sheets){
			if(sheets[i].cssRules){
				var x = sheets[i].cssRules;
				for(var j in x){
					if(x[j].selectorText && x[j].selectorText.indexOf("sapTheme")>0){
						var sCssRule = x[j].cssText.split('{')[1].split('}')[0];
						var bBorder = ( x[j].cssText.indexOf('border') > 0 ) ? true : false;
						var sStyles = "";
						if(x[j].selectorText.indexOf(',')>0){
							var aStyles = x[j].selectorText.split(',');
							for(var k in aStyles){
								sStyles = aStyles[k].split('.')[1];
								themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });		
							}
						} else if(x[j].selectorText.split('.').length > 2){
							var aStyles = x[j].selectorText.split('.');
							for(var k in aStyles){
								sStyles += aStyles[k];
								sStyles += " ";
							}
							themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });
						} else {
							sStyles = x[j].selectorText.split('.')[1];
							themeClasses.Styles.push({"stylingString" : sCssRule, "styleClass" : sStyles, "style" : x[j].style, 'border' : bBorder });
						}
					}
				}
			}
		}
		var oModel = new sap.ui.model.json.JSONModel(themeClasses);
		this.getView().setModel(oModel);
	},
	onAfterRendering : function(){
		// special treatment for border styles
		var mData = this.oView.getModel().oData.Styles;
		mData.forEach(function(e,i){
			var elem = $('.sampling')[i];
			if(elem && e.border){
				elem.style.borderWidth = "1xp";
				elem.style.borderStyle = "solid";
			}
		})
	}
});

