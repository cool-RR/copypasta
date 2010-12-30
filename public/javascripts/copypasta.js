(function() {
  var $, activate, blank_dialog, copypasta, currentLive, deactivate, dialog, ids, iframe_action, iframe_ready, indicator, init, paths, queue, s, scripts, send_queued, send_to_iframe, send_to_iframe_queue, show_widget, watch;
  $ = false;
  currentLive = false;
  iframe_ready = false;
  window.copypasta = copypasta = {};
  ids = {
    indicator: 'copy-pasta-edit-indicator',
    dialog: 'copy-pasta-dialog',
    iframe: 'copy-pasta-iframe',
    cancel_btn: 'copy-pasta-cancel'
  };
  paths = {
    indicator: '#' + ids.indicator,
    dialog: '#' + ids.dialog,
    btn: '.copy-pasta-button',
    active: '.copy-pasta-active',
    cancel_btn: '#' + ids.cancel_btn,
    iframe: '#' + ids.iframe
  };
  blank_dialog = '<div id="' + ids.dialog + '"><iframe frameborder="no" style="margin: 0px; padding: 0px; width: 100%; height: 300px; z-index: 2;" id="' + ids.iframe + '" scrolling="no"></iframe><input type="button" class="close" id="copy-pasta-cancel" style="display:none;"></div>';
  indicator = function() {
    if ($(paths.indicator).length === 0) {
      $('body').append('<div id="' + ids.indicator + '"><p>click to correct</p></div>');
    }
    return $(paths.indicator);
  };
  dialog = function(src) {
    if ($(paths.dialog).length === 0) {
      $('body').append(blank_dialog);
    }
    iframe_ready = false;
    if (src != null) {
      $(paths.iframe).attr('src', src);
    }
    return $(paths.dialog);
  };
  activate = function() {
    var pos, sz;
    pos = $(this).offset();
    pos.top = pos.top + 'px';
    pos.left = pos.left + 'px';
    sz = {
      width: $(this).outerWidth() + 'px',
      height: $(this).outerHeight() + 'px'
    };
    indicator().css(sz).css(pos).show();
    return currentLive = this;
  };
  deactivate = function() {
    indicator().hide();
    return currentLive = false;
  };
  watch = function(el) {
    return $(paths.active + ' ' + el).live('mouseover', activate);
  };
  show_widget = function() {
    var data, e, _ref;
    e = currentLive;
    (_ref = e.original_text) != null ? _ref : e.original_text = e.innerHTML;
    indicator().addClass('loading');
    data = {
      'edit[original]': e.original_text,
      'edit[proposed]': e.original_text,
      'edit[url]': window.location.href
    };
    send_to_iframe({
      'label': 'form_data',
      'data': data
    });
    return dialog('http://copypasta.heroku.com/edits/new?view=framed&url=' + escape(window.location.href)).lightbox_me({
      closeClick: false,
      closeEsc: false
    });
  };
  send_to_iframe_queue = [];
  send_to_iframe = function(msg) {
    if (iframe_ready) {
      return $(paths.iframe).get(0).contentWindow.postMessage(JSON.stringify(msg), 'http://copypasta.heroku.com');
    } else {
      return send_to_iframe_queue.push(msg);
    }
  };
  send_queued = function() {
    var m, _i, _len;
    for (_i = 0, _len = send_to_iframe_queue.length; _i < _len; _i++) {
      m = send_to_iframe_queue[_i];
      send_to_iframe(m);
    }
    return send_to_iframe_queue = [];
  };
  iframe_action = function(e) {
    var data;
    if (e.origin !== 'http://copypasta.heroku.com') {
      return;
    }
    data = JSON.parse(e.data);
    if (data.label === 'ready') {
      iframe_ready = true;
      return send_queued();
    } else if (data.label === 'finished') {
      $(paths.btn + '.on').click();
      return dialog().find(paths.cancel_btn).click();
    } else if (data.label === 'resize') {
      return $(paths.iframe).animate({
        height: data.h + 'px'
      });
    }
  };
  init = function() {
    var el, _i, _len, _ref;
    lightbox_me_init($);
    _ref = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      watch(el);
    }
    $(paths.indicator).live('mouseout', deactivate);
    $(paths.indicator).live('click', show_widget);
    $(paths.btn + '.off').live('click', function() {
      var btn;
      btn = $(this);
      btn.removeClass('off').addClass('on');
      return $(btn.attr('href')).addClass('copy-pasta-active');
    });
    $(paths.btn + '.on').live('click', function() {
      var btn;
      btn = $(this);
      btn.removeClass('on').addClass('off');
      $(btn.attr('href')).removeClass('copy-pasta-active');
      return false;
    });
    if (window.addEventListener != null) {
      return window.addEventListener('message', iframe_action, false);
    } else if (window.attachEvent != null) {
      return window.attachEvent('onmessage', function() {
        return iframe_action(event);
      });
    }
  };
  scripts = [
    {
      test: function() {
        return window.jQuery && window.jQuery.fn && window.jQuery.fn.jquery > "1.4.2";
      },
      src: 'http://copypasta.heroku.com/javascripts/jquery-1.4.2.min.js',
      callback: function() {
        return ($ = window.jQuery).noConflict(1);
      }
    }, {
      test: function() {
        return window.jQuery && window.jQuery.fn.lightbox_me;
      },
      src: 'http://copypasta.heroku.com/javascripts/jquery.lightbox_me.js'
    }, {
      test: function() {
        return window.JSON;
      },
      src: 'http://copypasta.heroku.com/javascripts/json2.js'
    }
  ];
  scripts.load = function(queue, callback) {
    var def, s;
    def = queue.pop();
    def.loaded = false;
    s = document.createElement('script');
    s.type = "text/javascript";
    s.src = def.src;
    s.onload = s.onreadystatechange = function() {
      var d, i, remaining;
      d = this.readyState;
      if (!loaded && (!d || d === 'loaded' || d === 'complete')) {
        def.loaded = true;
        if (def.callback != null) {
          def.callback();
        }
        remaining = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = queue.length; _i < _len; _i++) {
            i = queue[_i];
            if (!i.loaded) {
              _results.push(i);
            }
          }
          return _results;
        })();
        if (remaining.length === 0) {
          return callback();
        }
      }
    };
    scripts.load(queue, callback);
    return document.documentElement.childNodes[0].appendChild(s);
  };
  queue = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = scripts.length; _i < _len; _i++) {
      s = scripts[_i];
      if ((s != null) && !s.test()) {
        _results.push(s);
      }
    }
    return _results;
  })();
  if (queue.length > 0) {
    scripts.load(queue, init);
  } else {
    init();
  }
}).call(this);
