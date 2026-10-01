sap.ui.define(['exports'], (function (exports) { 'use strict';

	var ICON_ACTION_SETTINGS = "[[[Ŝēţţįŋğş∙∙∙∙∙∙]]]";
	var ICON_ACTIVATE = "[[[Āċţįʋąţē∙∙∙∙∙∙]]]";
	var ICON_ADD = "[[[Āƌƌ∙]]]";
	var ICON_ADD_CONTACT = "[[[Āƌƌ Ĉŏŋţąċţ∙∙∙∙∙∙∙∙]]]";
	var ICON_ADD_FILTER = "[[[Āƌƌ Ƒįĺţēŗ∙∙∙∙]]]";
	var ICON_ADD_PHOTO = "[[[Āƌƌ Ƥĥŏţŏ∙∙∙∙∙]]]";
	var ICON_BACK_TO_TOP = "[[[Ɓąċķ ţŏ Ţŏρ∙∙∙∙∙∙∙∙]]]";
	var ICON_COLLAPSE = "[[[Ĉŏĺĺąρşē∙∙∙∙∙∙]]]";
	var ICON_COLLAPSE_GROUP = "[[[Ĉŏĺĺąρşē Ģŗŏűρ∙∙∙∙∙]]]";
	var ICON_CROP = "[[[Ĉŗŏρ]]]";
	var ICON_DECLINE = "[[[Ďēċĺįŋē∙∙∙∙∙∙∙]]]";
	var ICON_DELETE = "[[[Ďēĺēţē∙∙∙∙∙∙∙∙]]]";
	var ICON_DISPLAY = "[[[Ďįşρĺąŷ∙∙∙∙∙∙∙]]]";
	var ICON_DOWN = "[[[Ďŏŵŋ]]]";
	var ICON_DOWNLOAD = "[[[Ďŏŵŋĺŏąƌ∙∙∙∙∙∙]]]";
	var ICON_DRILL_DOWN = "[[[Ďŗįĺĺ Ďŏŵŋ∙∙∙∙]]]";
	var ICON_DRILL_UP = "[[[Ďŗįĺĺ Ůρ∙∙∙∙∙∙]]]";
	var ICON_ERROR = "[[[Ĕŗŗŏŗ∙∙∙∙∙∙∙∙∙]]]";
	var ICON_EXIT_FULL_SCREEN = "[[[Ĕχįţ Ƒűĺĺ Ŝċŗēēŋ∙∙∙∙∙∙∙∙]]]";
	var ICON_EXPAND = "[[[Ĕχρąŋƌ∙∙∙∙∙∙∙∙]]]";
	var ICON_EXPAND_GROUP = "[[[Ĕχρąŋƌ Ģŗŏűρ∙∙∙∙∙∙∙]]]";
	var ICON_FILTER = "[[[Ƒįĺţēŗ∙∙∙∙∙∙∙∙]]]";
	var ICON_FLAG = "[[[Ƒĺąğ]]]";
	var ICON_FORWARD = "[[[Ƒŏŗŵąŗƌ∙∙∙∙∙∙∙]]]";
	var ICON_FULL_SCREEN = "[[[Ĕŋţēŗ Ƒűĺĺ Ŝċŗēēŋ∙∙∙∙∙∙∙]]]";
	var ICON_GENERATE_SHORTCUT = "[[[Ĉŗēąţē Ŝĥŏŗţċűţ∙∙∙∙]]]";
	var ICON_GROUP_2 = "[[[Ģŗŏűρ∙∙∙∙∙∙∙∙∙]]]";
	var ICON_HIDE = "[[[Ĥįƌē]]]";
	var ICON_IPAD = "[[[Ţąƃĺēţ∙∙∙∙∙∙∙∙]]]";
	var ICON_IPHONE = "[[[Ƥĥŏŋē∙∙∙∙∙∙∙∙∙]]]";
	var ICON_LAPTOP = "[[[Ļąρţŏρ∙∙∙∙∙∙∙∙]]]";
	var ICON_MESSAGE_ERROR = "[[[Ĕŗŗŏŗ∙∙∙∙∙∙∙∙∙]]]";
	var ICON_MESSAGE_INFORMATION = "[[[Ĭŋƒŏŗɱąţįŏŋ∙∙∙∙∙∙∙∙]]]";
	var ICON_MESSAGE_SUCCESS = "[[[Ŝűċċēşşƒűĺ∙∙∙∙]]]";
	var ICON_MESSAGE_WARNING = "[[[Ŵąŗŋįŋğ∙∙∙∙∙∙∙]]]";
	var ICON_MOVE = "[[[Μŏʋē]]]";
	var ICON_MULTI_SELECT = "[[[Μűĺţį Ŝēĺēċţ∙∙∙∙∙∙∙]]]";
	var ICON_NAV_BACK = "[[[Ńąʋįğąţē Ɓąċķ∙∙∙∙∙∙]]]";
	var ICON_OVERFLOW = "[[[Μŏŗē]]]";
	var ICON_REDO = "[[[Řēƌŏ]]]";
	var ICON_REFRESH = "[[[Řēƒŗēşĥ∙∙∙∙∙∙∙]]]";
	var ICON_RESIZE = "[[[Řēşįžē∙∙∙∙∙∙∙∙]]]";
	var ICON_RESIZE_HORIZONTAL = "[[[Řēşįžē Ĥŏŗįžŏŋţąĺĺŷ∙∙∙∙∙]]]";
	var ICON_RESIZE_VERTICAL = "[[[Řēşįžē Ʋēŗţįċąĺĺŷ∙∙∙∙∙∙∙]]]";
	var ICON_RESPONSE = "[[[Řēρĺŷ∙∙∙∙∙∙∙∙∙]]]";
	var ICON_SAVE = "[[[Ŝąʋē]]]";
	var ICON_SEARCH = "[[[Ŝēąŗċĥ∙∙∙∙∙∙∙∙]]]";
	var ICON_SETTINGS = "[[[Ŝēţţįŋğş∙∙∙∙∙∙]]]";
	var ICON_SHOW = "[[[Ŝĥŏŵ]]]";
	var ICON_SORT = "[[[Ŝŏŗţ]]]";
	var ICON_SORT_ASCENDING = "[[[Ŝŏŗţ Āşċēŋƌįŋğ∙∙∙∙∙]]]";
	var ICON_SORT_DESCENDING = "[[[Ŝŏŗţ Ďēşċēŋƌįŋğ∙∙∙∙]]]";
	var ICON_SYNCHRONIZE = "[[[Ŝŷŋċĥŗŏŋįžē∙∙∙∙∙∙∙∙]]]";
	var ICON_UNDO = "[[[Ůŋƌŏ]]]";
	var ICON_UP = "[[[Ůρ∙∙]]]";
	var ICON_UPLOAD = "[[[Ůρĺŏąƌ∙∙∙∙∙∙∙∙]]]";
	var ICON_ZOOM_IN = "[[[Żŏŏɱ Ĭŋ∙∙∙∙∙∙∙]]]";
	var ICON_ZOOM_OUT = "[[[Żŏŏɱ Ŏűţ∙∙∙∙∙∙]]]";
	var messagebundle_en_US_sappsd = {
		ICON_ACTION_SETTINGS: ICON_ACTION_SETTINGS,
		ICON_ACTIVATE: ICON_ACTIVATE,
		ICON_ADD: ICON_ADD,
		ICON_ADD_CONTACT: ICON_ADD_CONTACT,
		ICON_ADD_FILTER: ICON_ADD_FILTER,
		ICON_ADD_PHOTO: ICON_ADD_PHOTO,
		ICON_BACK_TO_TOP: ICON_BACK_TO_TOP,
		ICON_COLLAPSE: ICON_COLLAPSE,
		ICON_COLLAPSE_GROUP: ICON_COLLAPSE_GROUP,
		ICON_CROP: ICON_CROP,
		ICON_DECLINE: ICON_DECLINE,
		ICON_DELETE: ICON_DELETE,
		ICON_DISPLAY: ICON_DISPLAY,
		ICON_DOWN: ICON_DOWN,
		ICON_DOWNLOAD: ICON_DOWNLOAD,
		ICON_DRILL_DOWN: ICON_DRILL_DOWN,
		ICON_DRILL_UP: ICON_DRILL_UP,
		ICON_ERROR: ICON_ERROR,
		ICON_EXIT_FULL_SCREEN: ICON_EXIT_FULL_SCREEN,
		ICON_EXPAND: ICON_EXPAND,
		ICON_EXPAND_GROUP: ICON_EXPAND_GROUP,
		ICON_FILTER: ICON_FILTER,
		ICON_FLAG: ICON_FLAG,
		ICON_FORWARD: ICON_FORWARD,
		ICON_FULL_SCREEN: ICON_FULL_SCREEN,
		ICON_GENERATE_SHORTCUT: ICON_GENERATE_SHORTCUT,
		ICON_GROUP_2: ICON_GROUP_2,
		ICON_HIDE: ICON_HIDE,
		ICON_IPAD: ICON_IPAD,
		ICON_IPHONE: ICON_IPHONE,
		ICON_LAPTOP: ICON_LAPTOP,
		ICON_MESSAGE_ERROR: ICON_MESSAGE_ERROR,
		ICON_MESSAGE_INFORMATION: ICON_MESSAGE_INFORMATION,
		ICON_MESSAGE_SUCCESS: ICON_MESSAGE_SUCCESS,
		ICON_MESSAGE_WARNING: ICON_MESSAGE_WARNING,
		ICON_MOVE: ICON_MOVE,
		ICON_MULTI_SELECT: ICON_MULTI_SELECT,
		ICON_NAV_BACK: ICON_NAV_BACK,
		ICON_OVERFLOW: ICON_OVERFLOW,
		ICON_REDO: ICON_REDO,
		ICON_REFRESH: ICON_REFRESH,
		ICON_RESIZE: ICON_RESIZE,
		ICON_RESIZE_HORIZONTAL: ICON_RESIZE_HORIZONTAL,
		ICON_RESIZE_VERTICAL: ICON_RESIZE_VERTICAL,
		ICON_RESPONSE: ICON_RESPONSE,
		ICON_SAVE: ICON_SAVE,
		ICON_SEARCH: ICON_SEARCH,
		ICON_SETTINGS: ICON_SETTINGS,
		ICON_SHOW: ICON_SHOW,
		ICON_SORT: ICON_SORT,
		ICON_SORT_ASCENDING: ICON_SORT_ASCENDING,
		ICON_SORT_DESCENDING: ICON_SORT_DESCENDING,
		ICON_SYNCHRONIZE: ICON_SYNCHRONIZE,
		ICON_UNDO: ICON_UNDO,
		ICON_UP: ICON_UP,
		ICON_UPLOAD: ICON_UPLOAD,
		ICON_ZOOM_IN: ICON_ZOOM_IN,
		ICON_ZOOM_OUT: ICON_ZOOM_OUT
	};

	exports.ICON_ACTION_SETTINGS = ICON_ACTION_SETTINGS;
	exports.ICON_ACTIVATE = ICON_ACTIVATE;
	exports.ICON_ADD = ICON_ADD;
	exports.ICON_ADD_CONTACT = ICON_ADD_CONTACT;
	exports.ICON_ADD_FILTER = ICON_ADD_FILTER;
	exports.ICON_ADD_PHOTO = ICON_ADD_PHOTO;
	exports.ICON_BACK_TO_TOP = ICON_BACK_TO_TOP;
	exports.ICON_COLLAPSE = ICON_COLLAPSE;
	exports.ICON_COLLAPSE_GROUP = ICON_COLLAPSE_GROUP;
	exports.ICON_CROP = ICON_CROP;
	exports.ICON_DECLINE = ICON_DECLINE;
	exports.ICON_DELETE = ICON_DELETE;
	exports.ICON_DISPLAY = ICON_DISPLAY;
	exports.ICON_DOWN = ICON_DOWN;
	exports.ICON_DOWNLOAD = ICON_DOWNLOAD;
	exports.ICON_DRILL_DOWN = ICON_DRILL_DOWN;
	exports.ICON_DRILL_UP = ICON_DRILL_UP;
	exports.ICON_ERROR = ICON_ERROR;
	exports.ICON_EXIT_FULL_SCREEN = ICON_EXIT_FULL_SCREEN;
	exports.ICON_EXPAND = ICON_EXPAND;
	exports.ICON_EXPAND_GROUP = ICON_EXPAND_GROUP;
	exports.ICON_FILTER = ICON_FILTER;
	exports.ICON_FLAG = ICON_FLAG;
	exports.ICON_FORWARD = ICON_FORWARD;
	exports.ICON_FULL_SCREEN = ICON_FULL_SCREEN;
	exports.ICON_GENERATE_SHORTCUT = ICON_GENERATE_SHORTCUT;
	exports.ICON_GROUP_2 = ICON_GROUP_2;
	exports.ICON_HIDE = ICON_HIDE;
	exports.ICON_IPAD = ICON_IPAD;
	exports.ICON_IPHONE = ICON_IPHONE;
	exports.ICON_LAPTOP = ICON_LAPTOP;
	exports.ICON_MESSAGE_ERROR = ICON_MESSAGE_ERROR;
	exports.ICON_MESSAGE_INFORMATION = ICON_MESSAGE_INFORMATION;
	exports.ICON_MESSAGE_SUCCESS = ICON_MESSAGE_SUCCESS;
	exports.ICON_MESSAGE_WARNING = ICON_MESSAGE_WARNING;
	exports.ICON_MOVE = ICON_MOVE;
	exports.ICON_MULTI_SELECT = ICON_MULTI_SELECT;
	exports.ICON_NAV_BACK = ICON_NAV_BACK;
	exports.ICON_OVERFLOW = ICON_OVERFLOW;
	exports.ICON_REDO = ICON_REDO;
	exports.ICON_REFRESH = ICON_REFRESH;
	exports.ICON_RESIZE = ICON_RESIZE;
	exports.ICON_RESIZE_HORIZONTAL = ICON_RESIZE_HORIZONTAL;
	exports.ICON_RESIZE_VERTICAL = ICON_RESIZE_VERTICAL;
	exports.ICON_RESPONSE = ICON_RESPONSE;
	exports.ICON_SAVE = ICON_SAVE;
	exports.ICON_SEARCH = ICON_SEARCH;
	exports.ICON_SETTINGS = ICON_SETTINGS;
	exports.ICON_SHOW = ICON_SHOW;
	exports.ICON_SORT = ICON_SORT;
	exports.ICON_SORT_ASCENDING = ICON_SORT_ASCENDING;
	exports.ICON_SORT_DESCENDING = ICON_SORT_DESCENDING;
	exports.ICON_SYNCHRONIZE = ICON_SYNCHRONIZE;
	exports.ICON_UNDO = ICON_UNDO;
	exports.ICON_UP = ICON_UP;
	exports.ICON_UPLOAD = ICON_UPLOAD;
	exports.ICON_ZOOM_IN = ICON_ZOOM_IN;
	exports.ICON_ZOOM_OUT = ICON_ZOOM_OUT;
	exports.default = messagebundle_en_US_sappsd;

}));
