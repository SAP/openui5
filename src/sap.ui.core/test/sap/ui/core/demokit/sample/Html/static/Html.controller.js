/*!
 * ${copyright}
 */
sap.ui.define([
  'jquery.sap.global',
  'sap/ui/core/mvc/Controller',
  'sap/ui/core/HTML'
], function(
  jQuery,
  Controller,
  HTML
) {
  "use strict";

  return Controller.extend("sap.ui.core.sample.Html.static.Html", {

    onInit: function() {
      var oHtml = this.byId("htmlControl");

      if (!oHtml) {
        var sId = this.createId("htmlControl");
        oHtml = new HTML(sId, {
          // the static content as a long string literal
          content:
          "<div style='position:relative;background-color:black;width:64px;height:64px'>" +
          "<div style='position:absolute;background-color:rgb(200,  0,  0);width:8px;height:8px;top:28px;left:48px' ></div>" +
          "<div style='position:absolute;background-color:rgb(200,100,  0);width:8px;height:8px;top:18px;left:45px' ></div>" +
          "<div style='position:absolute;background-color:rgb(200,200,  0);width:8px;height:8px;top:11px;left:38px' ></div>" +
          "<div style='position:absolute;background-color:rgb(100,200,  0);width:8px;height:8px;top: 8px;left:28px' ></div>" +
          "<div style='position:absolute;background-color:rgb(  0,200,  0);width:8px;height:8px;top:11px;left:18px' ></div>" +
          "<div style='position:absolute;background-color:rgb(  0,200,100);width:8px;height:8px;top:18px;left:11px' ></div>" +
          "<div style='position:absolute;background-color:rgb(  0,200,200);width:8px;height:8px;top:28px;left: 8px' ></div>" +
          "<div style='position:absolute;background-color:rgb(  0,100,200);width:8px;height:8px;top:38px;left:11px' ></div>" +
          "<div style='position:absolute;background-color:rgb(  0,  0,200);width:8px;height:8px;top:45px;left:18px' ></div>" +
          "<div style='position:absolute;background-color:rgb(100,  0,200);width:8px;height:8px;top:48px;left:28px' ></div>" +
          "<div style='position:absolute;background-color:rgb(200,  0,200);width:8px;height:8px;top:45px;left:38px' ></div>" +
          "<div style='position:absolute;background-color:rgb(200,  0,100);width:8px;height:8px;top:38px;left:45px' ></div>" +
          "</div>",

          preferDOM : false,

          // use the afterRendering event for 2 purposes
          afterRendering : function(oEvent) {
            if ( !oEvent.getParameters()["isPreservedDOM"] ) {
              var $DomRef = oEvent.getSource().$();
              $DomRef.click(function(oEvent) {
                this.addColorBlockAtCursor($DomRef, oEvent, 64, 8);
              }.bind(this));
            }
          }.bind(this)
        });

        var oLayout = this.byId("staticContentLayout");
        oLayout.addContent(oHtml);
      }
    },

    rgb: function(r,g,b) {
      return 'rgb(' + Math.round(255 * r) + ',' + Math.round(255 * g) + ',' + Math.round(255 * b) + ')';
    },

    hsb2rgb: function(h,s,b) {
      h = (360.0 * h / 255.0);
      s = s / 255.0;
      b = b / 255.0;

      var f,i,p,q,t;
      if ( s == 0 ) {
        // color is on black-and-white center line
        return this.rgb(b,b,b);
      } else {
          // chromatic color
          h = (h % 360) / 60.0;     // h is now IN [0,6)
          i = Math.floor(h);        // largest integer <= h
          f = h - i;                  // fractional part of h

          p = b * (1.0 - s);
          q = b * (1.0 - (s * f));
          t = b * (1.0 - (s * (1.0 - f)));

          switch (i) {
            case 0: return this.rgb(b,t,p);
            case 1: return this.rgb(q,b,p);
            case 2: return this.rgb(p,b,t);
            case 3: return this.rgb(p,q,b);
            case 4: return this.rgb(t,p,b);
            case 5: return this.rgb(b,p,q);
            // no default
          }
      }
    },

    colorBlock: function(sColor, iX, iY, iSize) {
      return jQuery("<div/>").
        attr("title", sColor).
        css({
          "position": "absolute",
          "background-color": sColor,
          "top": iY + "px",
          "left": iX + "px",
          "width": iSize + "px",
          "height": iSize + "px"
        }).
        click(function(e) {
          jQuery(this).remove();
        });
    },

    addColorBlockAtCursor: function($DomRef, oEvent, psize, size) {
      var oOffset;
      if (typeof oEvent.offsetX === "undefined" ) {
        oOffset = jQuery(oEvent.target).offset();
        oEvent.offsetX = oEvent.pageX - oOffset.left;
        oEvent.offsetY = oEvent.pageY - oOffset.top;
      }
      var dx = oEvent.offsetX - psize / 2;
      var dy = -(oEvent.offsetY - psize / 2);
      var a = 2 * Math.PI + (dx < 0 ? Math.PI - Math.atan2(dy, -dx) : Math.atan2(dy, dx));
      var h = a / 2 / Math.PI * 255.0;
      this.colorBlock(this.hsb2rgb(h, 255, 200), oEvent.offsetX - 4, oEvent.offsetY - 4, size).appendTo($DomRef);
    },

    onRedraw: function(oEvent) {
      oEvent.getSource().getUIArea().invalidate();
    }
  });

});
