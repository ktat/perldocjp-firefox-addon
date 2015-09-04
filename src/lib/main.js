var debug = 1;

var notifications = require("sdk/notifications");
var data          = require("sdk/self").data;
var ui            = require("sdk/ui");
var tabs          = require("sdk/tabs");
var ss            = require("sdk/simple-storage");
var timers        = require('sdk/timers');
var pageMod       = require("sdk/page-mod");
var common        = require('lib/pjp_common.js');
var prefs         = require("sdk/simple-prefs");

var notified = {};
// var toolbarbutton = require("toolbarbutton");
var button;

function open_pjp () {
  var doc_name = common.get_doc_name(tabs.activeTab);
  var pjp_url = common.get_perldocjp_url(doc_name, ss.storage.perldocjp_db);
  if (pjp_url) {
    tabs.open(pjp_url);
  } else {
    tabs.open('http://perldoc.jp/');
  }
}

function make_toolbarbutton (options) {
  button = toolbarbutton.ToolbarButton({
    id: "perldocjp-button",
    label: "perldoc.jp",
    tooltiptext: "move to perldoc.jp",
    image: "./perldocjp_off.png",
    onCommand: open_pjp
  });
  if (debug || (options.loadReason == 'install')) {
    button.moveTo({
      toolbarID: "nav-bar",
      forceMove: true
    });
  }
}

var widget = ui.ActionButton({
  id: "perldocjp-link",
  icon: "./favicon.ico",
  label: "Perldoc.jp Website",
  contentURL: "./widget_off.html",
  onClick: open_pjp
});

exports.main = function (options) {
//  make_toolbarbutton(options);
  start();
}

function start () {
  changePref();
  if (ss.storage.perldocjp_db) {
    prefs.on("" , onPrefChange);
    setPageMod();
    setEvents();
    timers.setTimeout(updatePerldocJpDb, 3600);
  } else {
    updatePerldocJpDb(start);
  }
}

function setEvents () {
  var f = function (tab) {
    var doc_name = common.get_doc_name(tab);
    var pjp_url = common.get_perldocjp_url(doc_name, ss.storage.perldocjp_db);
    if (pjp_url) {
      if (button)
	button.image = "./perldocjp_on.png";
      if (widget)
        widget.icon = "./perldocjp_on.png";
	widget.contentURL = "./widget_on.html";
    } else {
      if (button)
	button.image = "./perldocjp_off.png";
      if (widget)
        widget.icon = "./perldocjp_off.png";
	widget.contentURL = "./widget_off.html";
    }
  };

  tabs.on('activate', f);
  tabs.on('ready', f);
  tabs.on('deactivate', f);
}

function updatePerldocJpDb (fn) {
  var now = (new Date).getTime();
  var request = require("sdk/request").Request;
  var url = "http://perldoc.jp/static/docs.json?time=" + now;
  request({
    url: url,
    onComplete: function (response) {
      ss.storage.perldocjp_db = response.json;
      if (fn) {
	fn();
      }
    }
  }).get();
}

function checkSameUrl (url) {
  var found = false;
  for each (var tab in tabs) {

    if (tab.url == url) {
      found = true;
    }
  }
  return found;
}

function setPageMod () {
  pageMod.PageMod({
    include: [
      "http://perldoc.perl.org/*",
      "http://search.cpan.org/*",
      "http://metacpan.org/*",
      "https://perldoc.perl.org/*",
      "https://search.cpan.org/*",
      "https://metacpan.org/*"
    ],
    contentScriptWhen: 'ready',
    contentScriptFile: './pagemod.js',
    onAttach: function onAttach(worker) {
      var doc_name = common.get_doc_name(worker.tab);
      var pjp_url  = common.get_perldocjp_url(doc_name, ss.storage.perldocjp_db);
      if (pjp_url) {
	widget.contentURL = "./widget_on.html";
	if ((ss.storage.notify_everytime || ! notified[pjp_url]) && ss.storage.notify_timeout > 0) {
	  notified[pjp_url] = true;
	  if (ss.storage.howto_notify == "2") {
            notifications.notify({
              title: "Perldoc.jp 翻訳通知",
              text: doc_name + "の翻訳が見つかりました",
              data: pjp_url,
	      iconURL: './perldocjp.png',
              onClick: function (data) {
                tabs.open(pjp_url);
              }
            });
	  } else {
            worker.port.emit('showNotification', [doc_name, pjp_url, ss.storage.notify_timeout || 5]);
	  }
        }
	if (ss.storage.notify_and_open && ! checkSameUrl(pjp_url)) {
	  tabs.open(pjp_url);
	}
      }
    }
  });
}

function onPrefChange(prefName) {
  // console.log(prefs.prefs);
  if (prefName === 'howto_notify_popup' && prefs.prefs['howto_notify_popup'] === true) {
      ss.storage.howto_notify = 1;
      prefs.prefs['howto_notify_desktop'] = false;
  } else if (prefName === 'howto_notify_desktop' && prefs.prefs['howto_notify_desktop'] === true) {
      ss.storage.howto_notify = 2;
      prefs.prefs['howto_notify_popup'] = false;
  } else if (prefs.prefs['howto_notify_popup']) {
      prefs.prefs['howto_notify_desktop'] = false;
  } else if (prefs.prefs['howto_notify_desktop']) {
      prefs.prefs['howto_notify_popup'] = false;
  }

  ss.storage.notify_everytime = prefs.prefs['notify_everytime'];
  ss.storage.notify_timeout   = prefs.prefs['notify_timeout']  ;
  ss.storage.notify_and_open  = prefs.prefs['notify_and_open'] ;
}

function changePref() {
  if (! ss.storage.perldocjp_db) {
    ss.storage.howto_notify     = '1';
    ss.storage.notify_everytime = true;
    ss.storage.notify_timeout   = 5;
    ss.storage.notify_and_open  = false;
  }

  if (ss.storage.howto_notify === "2") {
    prefs.prefs['howto_notify'] = "2";
    prefs.prefs['howto_notify_desktop'] = true;
    prefs.prefs['howto_notify_popup'] = false;
  } else {
    prefs.prefs['howto_notify'] = "1";
    prefs.prefs['howto_notify_desktop'] = false;
    prefs.prefs['howto_notify_popup'] = true;
  }

  prefs.prefs['notify_everytime'] = ss.storage.notify_everytime || true;
  prefs.prefs['notify_timeout']   = ss.storage.notify_timeout   || 8;
  prefs.prefs['notify_and_open']  = ss.storage.notify_and_open  || false;
  prefs.prefs['notify_timeout']
}

