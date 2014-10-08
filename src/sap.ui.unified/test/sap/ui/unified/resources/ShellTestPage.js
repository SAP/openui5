try{
	sap.ui.getCore().loadLibrary("sap.ui.commons");
}catch(e){
	alert("This test page requires the library 'sap.ui.commons' which is not available.");
	throw(e);
}

try {
	sap.ui.getCore().loadLibrary("sap.m");
} catch(e) {
	alert("This test page requires the library 'sap.m' which is not available.");
	throw(e);
}


function createTestSearchField(sId, fOnSearch){
	var oSF =  new sap.m.SearchField(sId, {
		search: fOnSearch || function(){},
		width: "100%"
	});
	oSF.addStyleClass("sapUiSizeCompact");
	oSF.addStyleClass("MyTestSearchField");
	return oSF;
}

window.sLorem = "Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "+
"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita "+
"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit "+
"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in "+
"hendrerit in vulputate velit esse molestie consequat, vel illum dolore "+
"eu feugiat nulla facilisis at vero eros et accumsan et iusto odio "+
"dignissim qui blandit praesent luptatum zzril delenit augue duis "+
"dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, "+
"consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt "+
"ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim "+
"veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl "+
"ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in "+
"hendrerit in vulputate velit esse molestie consequat, vel illum dolore "+
"eu feugiat nulla facilisis at vero eros et accumsan et iusto odio "+
"dignissim qui blandit praesent luptatum zzril delenit augue duis "+
"dolore te feugait nulla facilisi.\n\n Nam liber tempor cum soluta nobis eleifend option congue nihil "+
"imperdiet doming id quod mazim placerat facer possim assum. Lorem "+
"ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy "+
"nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. "+
"Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper "+
"suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem "+
"vel eum iriure dolor in hendrerit in vulputate velit esse molestie "+
"consequat, vel illum dolore eu feugiat nulla facilisis. At vero eos et "+
"accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, "+
"no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum "+
"dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod "+
"tempor invidunt ut labore et dolore magna aliquyam erat, sed diam "+
"voluptua. At vero eos et accusam et justo duo dolores et ea rebum. "+
"Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum "+
"dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing "+
"elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos "+
"erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea "+
"et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero "+
"voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, "+
"consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut "+
"labore et dolore magna aliquyam erat. Consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet "+
"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "+
"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita "+
"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit "+
"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit "+
"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod "+
"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim "+
"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit "+
"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet "+
"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "+
"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita "+
"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit "+
"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit "+
"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod "+
"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim "+
"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit "+
"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet "+
"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "+
"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita "+
"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit "+
"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit "+
"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod "+
"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim "+
"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit "+
"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet "+
"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit "+
"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor "+
"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "+
"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita "+
"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit "+
"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed "+
"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam "+
"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores "+
"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "+
"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur "+
"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et "+
"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam "+
"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea "+
"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit "+
"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod "+
"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim "+
"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit "+
"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum "+
"iriure dolor in hendrerit in vulputate velit esse molestie consequat, "+
"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan "+
"et iusto odio dignissim qui blandit praesent luptatum zzril delenit "+
"augue duis dolore te feugait nulla facilisi.\n\n";

sap.ui.core.Control.extend("SearchFieldPlaceHolder", {
	metadata : {
		events: {
            "search" : {}
        }
    },
	
	renderer: function(rm, ctrl){
		rm.write("<div"); 
		rm.writeControlData(ctrl);
		rm.writeAttribute("class", "SearchFieldPlaceHolder");
		rm.writeAttribute("tabindex", "0");
		rm.write(">Placeholder for a SearchField Control</div>"); 
	},
	
	onclick: function(evt){
		this.fireSearch();
	}
});

sap.ui.core.Control.extend("CurtainContent", {
	metadata : {
		properties: {
			"text" : "string",
			"headerHidden" : "boolean"
        },
        aggregations: {
        	"content" : {type : "sap.ui.core.Control", multiple : true} 
        }
    },
	
	renderer: function(rm, ctrl){
		rm.write("<div");
		rm.addClass("CurtainContent");
		rm.writeClasses();
		rm.writeControlData(ctrl);
		rm.write("><header");
		rm.addClass("_sapUiUfdShellSubHdr");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(ctrl.getText());
		rm.write("</header><div>");
		var aContent = ctrl.getContent();
		for(var i=0; i<aContent.length; i++){
			rm.renderControl(aContent[i]);
		}
		rm.write("</div></div>");
	},
	
	setHeaderHidden: function(bHidden){
		this.setProperty("headerHidden", !!bHidden, true);
		this.$().toggleClass("CurtainContentHeaderHidden", !!bHidden);
	}
});

jQuery.sap.require("sap.ui.core.IconPool");

jQuery(function(){
	jQuery("head").append("<link type='text/css' rel='stylesheet' href='resources/ShellTestPage.css'>");
});


jQuery.sap.require("jquery.sap.script");
var sLogo = jQuery.sap.getUriParameters().get("logo");
if(sLogo){
	sLogo = "images/" + sLogo;
}else{
	sLogo = jQuery.sap.getModulePath("sap.ui.core", '/') + "mimes/logo/sap_50x26.png";
}