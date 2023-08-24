sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/EventBus",
	"sap/ui/core/Popup",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/events/F6Navigation",
	"require"
], function(jQuery, EventBus, Popup, includeStylesheet, F6Navigation, require) {
	"use strict";

	var counter = 0;

	function uid(){
		var id = "id" + counter;
		counter++;
		return id;
	}

	function container(bGroup, sStyle, sTooltip, aContent, bDefaultContent, sDefaultStyle){
		var res = jQuery("<div></div>");
		if (sStyle){
			res.attr("style", sStyle);
		}
		if (sTooltip){
			res.attr("title", sTooltip);
		}
		if (bGroup){
			res.attr("data-" + F6Navigation.fastNavigationKey, "true");
		}
		res.attr("id", uid());

		if (bDefaultContent){
			res.append(tabbable(true, false, sDefaultStyle)).append(nl());
			res.append(tabbable(true, true, sDefaultStyle)).append(nl());
			res.append(tabbable(true, false, sDefaultStyle, -1)).append(nl());
			res.append(tabbable(false, false, sDefaultStyle, 0)).append(nl());
			res.append(tabbable(false, false, sDefaultStyle, -1));
		}

		for (var i = 0; i < aContent.length; i++){
			res.append(aContent[i]);
		}

		return res;
	}

	function tabbable(bInput, bDisabled, sStyle, iTabIndex){
		var res = jQuery(bInput ? "<input>" : "<div></div>");
		if (bDisabled === true && bInput){
			res.attr("disabled", "disabled");
		}
		if (sStyle){
			res.attr("style", sStyle);
		}
		if (!bInput){
			res.attr("class", "TabbableDiv");
		}
		if (typeof iTabIndex === "number"){
			res.attr("tabindex", "" + iTabIndex);
		}
		res.attr("id", uid());
		return res;
	}

	function nl(bSeperator){
		return jQuery(bSeperator ? "<hr>" : "<br>");
	}

	function popup(i, bModal, bDock, bAutoClose, sMode, aAdditionalContent) {
		var $Button = jQuery("<button id='openPopup" + i + "'></button>");

		bAutoClose = !bModal && bAutoClose;

		var sText = (!bModal ? "non-" : "") + "modal " + (bDock ? "docked " : "") + (bAutoClose ? "auto-close " : "") + "Popup (NavMode: " + sMode + ")";

		var oPopup = window["oPopup" + i];
		if (!oPopup){
			aAdditionalContent = aAdditionalContent ? aAdditionalContent : [];

			if (bModal){
				var oClose = jQuery("<button>Close</button>");
				oClose.on("click", function(){
					oPopup.close(0);
				});
				aAdditionalContent.push(nl());
				aAdditionalContent.push(oClose);
			}

			oPopup = new Popup(container(false, "background:yellow;", "", [
					container(true, null, "", [], true), nl(),
					container(true, null, "", aAdditionalContent, true)
			]), bModal, true, bAutoClose);
			oPopup.setNavigationMode(sMode);

			window["oPopup" + i] = oPopup;
		}

		$Button.text(sText).on("click", function(){
			var oPopup = window["oPopup" + i];

			if (bModal) {
				if (bDock) {
					oPopup.open(0, Popup.Dock.LeftTop, Popup.Dock.LeftBottom, $Button);
				} else {
					oPopup.open(0);
				}
			} else if (oPopup.isOpen()) {
				oPopup.close(0);
			} else if (bDock) {
				oPopup.open(0, Popup.Dock.LeftTop, Popup.Dock.LeftBottom, $Button);
			} else {
				oPopup.open(0);
			}
		});

		return $Button;
	}

	includeStylesheet( require.toUrl("./fastnav.css") );

	jQuery(function(){

		// create anchors in DOM
		if ( jQuery("#scope").length === 0 ) {
			jQuery('<div id="scope"><div id="content"></div><div id="content2"></div><div id="content3"></div></div>').appendTo(document.body);
		}

		var oRoot = jQuery("#content");
		var sStyle = null;

		oRoot.attr("data-" + F6Navigation.fastNavigationKey, "true");

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
			EventBus.getInstance().publish("fastnav", "screenready");
		}, 0);
	});

});