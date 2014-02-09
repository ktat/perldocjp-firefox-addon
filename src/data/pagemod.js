self.port.on('showNotification', function (args) {
  var pjp_doc_name = args[0];
  var pjp_url      = args[1];
  var pjp_timeout  = args[2];

  var pjp_link = document.createElement("a");
  pjp_link.href      = pjp_url;
  pjp_link.target    = "_blank";
  pjp_link.innerHTML = pjp_doc_name + ' の翻訳へ';
  pjp_link.style     = 'text-decoration: none';

  var pjp_info = document.querySelector("#perldocjp_notification");
  if (! pjp_info) {
    pjp_info = document.createElement("div");
    pjp_info.innerHTML = 'perldoc.jp<br />';
    pjp_info.id = "perldocjp_notification";
    pjp_info.appendChild(pjp_link);
    document.querySelector("body").appendChild(pjp_info);
    pjp_info.style =   'font-size: 11px;              ' +
                       'width: 170px;                 ' +
                       'position: absolute;           ' +
                       'top: 0px;                     ' +
                       'right: 0px;                   ' +
                       'border-style: solid;          ' +
                       'border-width: 2px 2px 2px 2px;' +
                       'border-color: #006699;        ' +
                       'padding: 10px;                ' +
                       'background-color: #fff;       ' +
                       'z-index: 1000;                ' +
                       'text-align: left;             ';
  } else {
    pjp_info.innerHTML = 'perldoc.jp<br />';
    pjp_info.appendChild(pjp_link);
  }

  window.setTimeout(function () {
    document.querySelector('body').removeChild(pjp_info);
  }, pjp_timeout * 1000);
});
