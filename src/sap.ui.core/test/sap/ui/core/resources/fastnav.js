(function(){

	jQuery.sap.require("sap.ui.core.Popup");
	
	var counter = 0;
	
	function uid(){
		var id = "id"+counter;
		counter++;
		return id;
	}
	
	function container(bGroup, sStyle, sTooltip, aContent, bDefaultContent, sDefaultStyle){
		var res = jQuery("<div/>");
		if(sStyle){
			res.attr("style", sStyle);
		}
		if(sTooltip){
			res.attr("title", sTooltip);
		}
		if(bGroup){
			res.attr("data-"+jQuery.sap._FASTNAVIGATIONKEY, "true");
		}
		res.attr("id", uid());
		
		if(bDefaultContent){
			res.append(tabbable(true, false, sDefaultStyle)).append(nl());
			res.append(tabbable(true, true, sDefaultStyle)).append(nl());
			res.append(tabbable(true, false, sDefaultStyle, -1)).append(nl());
			res.append(tabbable(false, false, sDefaultStyle, 0)).append(nl());
			res.append(tabbable(false, false, sDefaultStyle, -1));
		}
		
		for(var i=0; i<aContent.length; i++){
			res.append(aContent[i]);
		}
		
		return res;
	}
	
	function tabbable(bInput, bDisabled, sStyle, iTabIndex){
		var res = jQuery(bInput ? "<input/>" : "<div/>");
		if(bDisabled === true && bInput){
			res.attr("disabled", "disabled");
		}
		if(sStyle){
			res.attr("style", sStyle);
		}
		if(!bInput){
			res.attr("class", "TabbableDiv");
		}
		if(typeof iTabIndex === "number"){
			res.attr("tabindex", ""+iTabIndex);
		}
		res.attr("id", uid());
		return res;
	}
	
	function nl(bSeperator){
		return jQuery(bSeperator ? "<hr>" : "<br>");
	}
	
	function popup(i, bModal, bDock, bAutoClose, sMode, aAdditionalContent) {
		var $Button = jQuery("<button id='openPopup"+i+"'></button>");
		
		bAutoClose = !bModal && bAutoClose;
		
		var sText = (!bModal ? "non-" : "") + "modal " + (bDock ? "docked " : "") + (bAutoClose ? "auto-close " : "") + "Popup (NavMode: " + sMode + ")";
		
		var oPopup = window["oPopup"+i];
		if(!oPopup){
			aAdditionalContent = aAdditionalContent ? aAdditionalContent : [];
			
			if(bModal){
				var oClose = jQuery("<button>Close</button>");
				oClose.click(function(){
					oPopup.close(0);
				});
				aAdditionalContent.push(nl());
				aAdditionalContent.push(oClose);
			}
			
			oPopup = new sap.ui.core.Popup(container(false, "background:yellow;", "", [
     			    container(true, null, "", [], true), nl(),
      			 	container(true, null, "", aAdditionalContent, true)
      		]), bModal, true, bAutoClose);
			oPopup.setNavigationMode(sMode);
			
			window["oPopup"+i] = oPopup;
		}
		
		$Button.text(sText).click(function(){
			var oPopup = window["oPopup"+i];
			
			if (bModal) {
				if(bDock){
					oPopup.open(0, sap.ui.core.Popup.Dock.LeftTop, sap.ui.core.Popup.Dock.LeftBottom, $Button);
				}else{
					oPopup.open(0);
				}
			}else{
				if(oPopup.isOpen()){
					oPopup.close(0);
				}else{
					if(bDock){
						oPopup.open(0, sap.ui.core.Popup.Dock.LeftTop, sap.ui.core.Popup.Dock.LeftBottom, $Button);
					}else{
						oPopup.open(0);
					}
				}
			}
		});
		
		return $Button;
	}
	
	
	
	jQuery(function(){
		
		var oRoot = jQuery("#content");
		var sStyle = null;
		
		oRoot.attr("data-"+jQuery.sap._FASTNAVIGATIONKEY, "true");
		
		oRoot.append(container(true, null, "Visible", [nl(),
		    popup(1, false, false, false, "NONE", []),
			popup(2, false, true, false, "DOCK", []),
			popup(3, false, true, false, "SCOPE", []), nl(),
			popup(4, true, false, false, "NONE", []),
			popup(5, true, false, false, "SCOPE", []),
			popup(6, true, false, false, "SCOPE", [popup(7, false, true, true, "DOCK", [])])
		], true, sStyle));
		oRoot.append(nl(true));
		
		oRoot.append(container(false, null, "", [], true, sStyle));
		oRoot.append(nl(true));
		
		sStyle = "display:none;";
		oRoot.append(container(true, null, "Display none on control", [], true, sStyle));
		oRoot.append(nl(true));
		
		sStyle = "visibility:hidden;";
		oRoot.append(container(true, null, "Visibility hidden on control", [], true, sStyle));
		oRoot.append(nl(true));
		
		oRoot.append(container(true, null, "", [
		    tabbable(true, true, null), nl(),
		    tabbable(true, true, null)
		]));
		
		sStyle = null;
		oRoot.append(container(true, "display:none;", "Display none on parent", [], true, sStyle));
		oRoot.append(nl(true));
		
		oRoot.append(container(true, "visibility:hidden;", "Visibility hidden on parent", [], true, sStyle));
		oRoot.append(nl(true));
		
		oRoot.append(container(true, null, "Visible", [], true, sStyle));
		oRoot.append(nl(true));
		
		oRoot.append(container(false, null, "", [
		    tabbable(true, false, null), nl(),
		    tabbable(true, false, null), nl()
		]));
		
		
		oRoot = jQuery("#content2");
		oRoot.append(container(false, null, "", [
		    tabbable(true, false, null), nl(),
		    tabbable(true, false, null), nl()
		]));
		
		
		oRoot = jQuery("#content3");
		
		oRoot.append(container(true, null, "", [
			tabbable(true)
		]));
		oRoot.append(tabbable(false, false, "height:auto;", 0).append(container(true, null, "", [
		   tabbable(true)
		])));
		oRoot.append(tabbable(true));
		
		
		setTimeout(function(){
			sap.ui.getCore().getEventBus().publish("fastnav", "screenready");
		}, 0);
	});

})();