// copied from chrome extension

function get_doc_name (tab) {
  var doc_name = '';
  if (! tab)  return;

  if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/search\.html\?q=(.+)/)) {
    var q = RegExp.$1;
    doc_name = q.replace(/\%3A/gi, ':');
  } else if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/.+/)) {
    doc_name = tab.title;
  } else if(tab.url.match(/^https?:\/\/(?:search\.|meta)cpan\.org\/search(\?.+)/)) {
    var q = RegExp.$1;
    if (q.match(/(?:&|\?)q=([^&]+)/) || q.match(/(?:&|\?)query=([^&]+)/)) {
      q = RegExp.$1;
      doc_name = q.replace(/\%3A/gi, ':');
    }
  } else if(tab.url.match(/^https?:\/\/search\.cpan\.org\/dist\/([^\/]+)/)) {
    var module = RegExp.$1;
    doc_name = module.replace(/[\/\-]/g, '::');
  } else if(tab.url.match(/^https?:\/\/search\.cpan\.org\/(.+)/)) {
    doc_name = tab.title;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/module\/.+\/(perl.+)\.pod/)) {
    doc_name = RegExp.$1;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/(.+)/)) {
    var path = RegExp.$1;
    if (tab.title.match(/^([\w:]+)/)) {
      doc_name = RegExp.$1;
    } else {
      if (path.match(/^module\/\w+\/[\w\-]+\/(.+)\.pod$/)) {
	doc_name = RegExp.$1;
      } else if (path.match(/^.+\/(?:lib|pod)\/(.+)\.pod$/)) {
	doc_name = RegExp.$1;
      }
      if (! path.match('/' + doc_name + '-') && ! doc_name.match('/')) {
        // like https://metacpan.org/module/GIULIENK/Audio-Beep-0.11/Beep.pod
        // doc_name is 'Beep'
        if (path.match(/module\/\w+\/([\w-]+)-[\d\.]+\//)) {
	  doc_name = RegExp.$1;
	}
      }
      doc_name = doc_name.replace(/[\/\-]/g, '::');
    }
  }
  if (doc_name.match(/^([\w:]+)/)) {
    return RegExp.$1;
  }
}

// copy & modify from chrom extension
function get_perldocjp_url (doc_name, perldocjp_db) {
console.log(doc_name);
console.log(perldocjp_db);
  if (doc_name && doc_name.match(/^([\w:]+)/)) {
    var module = RegExp.$1;
    var perldocjp_path = perldocjp_db[module];
    if (perldocjp_path) {
      return 'http://perldoc.jp/docs/' + perldocjp_path;
    }
  }
}

exports.get_doc_name      = get_doc_name;
exports.get_perldocjp_url = get_perldocjp_url;

// http://perldoc.perl.org/perltoot.html