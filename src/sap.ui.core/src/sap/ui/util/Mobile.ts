import Device from "sap/ui/Device";
import Log from "sap/base/Log";
import jQuery from "sap/ui/thirdparty/jquery";
export class Mobile {
    static init(options: any) {
        var $head = jQuery("head");
        if (!_bInitTriggered) {
            _bInitTriggered = true;
            options = jQuery.extend({}, {
                viewport: true,
                statusBar: "default",
                hideBrowser: true,
                preventScroll: true,
                preventPhoneNumberDetection: true,
                useFullScreenHeight: true,
                homeIconPrecomposed: false,
                mobileWebAppCapable: "default"
            }, options);
            if (Device.os.ios && options.preventPhoneNumberDetection) {
                $head.append(jQuery("<meta name=\"format-detection\" content=\"telephone=no\">"));
            }
            var bIsIOS7Safari = Device.os.ios && Device.os.version >= 7 && Device.os.version < 8 && Device.browser.name === "sf";
            if (options.viewport) {
                var sMeta;
                var iInnerHeightBefore = Device.resize.height;
                var iInnerWidthBefore = Device.resize.width;
                if (bIsIOS7Safari && Device.system.phone) {
                    sMeta = "minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
                }
                else if (bIsIOS7Safari && Device.system.tablet) {
                    sMeta = "initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
                }
                else if ((Device.os.ios && Device.system.phone) && (Math.max(window.screen.height, window.screen.width) === 568)) {
                    sMeta = "user-scalable=0, initial-scale=1.0";
                }
                else if (Device.os.android && Device.os.version < 3) {
                    sMeta = "width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
                }
                else {
                    sMeta = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
                }
                $head.append(jQuery("<meta name=\"viewport\" content=\"" + sMeta + "\">"));
                if ((iInnerHeightBefore !== window.innerHeight || iInnerWidthBefore !== window.innerWidth) && Device.resize._update) {
                    Device.resize._update();
                }
            }
            if (options.mobileWebAppCapable === "default") {
                if (Device.os.ios) {
                    $head.append(jQuery("<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"));
                }
            }
            if (Device.os.ios) {
                $head.append(jQuery("<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"" + options.statusBar + "\">"));
            }
            if (options.useFullScreenHeight) {
                jQuery(function () {
                    document.documentElement.style.height = "100%";
                });
            }
            if (options.preventScroll && Device.os.ios) {
                jQuery(function () {
                    document.documentElement.style.position = "fixed";
                    document.documentElement.style.overflow = "hidden";
                    document.documentElement.style.height = "100%";
                    document.documentElement.style.width = "100%";
                });
            }
        }
        if (options && options.homeIcon) {
            var oIcons;
            if (typeof options.homeIcon === "string") {
                oIcons = {
                    phone: options.homeIcon,
                    favicon: options.homeIcon
                };
            }
            else {
                oIcons = jQuery.extend({}, options.homeIcon);
                oIcons.phone = options.homeIcon.phone || options.homeIcon.icon || oIcons.favicon;
                oIcons.favicon = oIcons.favicon || options.homeIcon.icon || options.homeIcon.phone;
                oIcons.icon = undefined;
            }
            oIcons.precomposed = options.homeIconPrecomposed || oIcons.precomposed;
            Mobile.setIcons(oIcons);
        }
        if (options && options.mobileWebAppCapable !== "default") {
            Mobile.setWebAppCapable(options.mobileWebAppCapable);
        }
    }
    static setIcons(oIcons: any) {
        if (!oIcons || (typeof oIcons !== "object")) {
            Log.warning("Call to sap/ui/util/Mobile.setIcons() has been ignored because there were no icons given or the argument was not an object.");
            return;
        }
        var $head = jQuery("head"), precomposed = oIcons.precomposed ? "-precomposed" : "", getBestFallback = function (res) {
            return oIcons[res] || oIcons["tablet@2"] || oIcons["phone@2"] || oIcons["phone"] || oIcons["tablet"];
        }, mSizes = {
            "phone": "",
            "tablet": "76x76",
            "phone@2": "120x120",
            "tablet@2": "152x152"
        };
        if (oIcons["favicon"]) {
            var $fav = $head.find("[rel=icon]");
            $fav.each(function () {
                if (this.rel === "icon") {
                    jQuery(this).remove();
                }
            });
            $head.append(jQuery("<link rel=\"icon\" href=\"" + oIcons["favicon"] + "\">"));
        }
        if (getBestFallback("phone")) {
            $head.find("[rel=apple-touch-icon]").remove();
            $head.find("[rel=apple-touch-icon-precomposed]").remove();
        }
        for (var platform in mSizes) {
            oIcons[platform] = oIcons[platform] || getBestFallback(platform);
            if (oIcons[platform]) {
                var size = mSizes[platform];
                $head.append(jQuery("<link rel=\"apple-touch-icon" + precomposed + "\" " + (size ? "sizes=\"" + size + "\"" : "") + " href=\"" + oIcons[platform] + "\">"));
            }
        }
    }
    static setWebAppCapable(bValue: any) {
        if (!Device.system.tablet && !Device.system.phone) {
            return;
        }
        var $Head = jQuery("head"), aPrefixes = ["", "apple"], sNameBase = "mobile-web-app-capable", sContent = bValue ? "yes" : "no", i, sName, $WebAppMeta;
        for (i = 0; i < aPrefixes.length; i++) {
            sName = aPrefixes[i] ? (aPrefixes[i] + "-" + sNameBase) : sNameBase;
            $WebAppMeta = $Head.children("meta[name=\"" + sName + "\"]");
            if ($WebAppMeta.length) {
                $WebAppMeta.attr("content", sContent);
            }
            else {
                $Head.append(jQuery("<meta name=\"" + sName + "\" content=\"" + sContent + "\">"));
            }
        }
    }
}
var _bInitTriggered = false;