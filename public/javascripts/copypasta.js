(function() {
  var $, activate, blank_dialog, copypasta, currentLive, deactivate, default_form, dialog, el, ids, iframe_action, indicator, paths, show_widget, watch, _i, _len, _ref;
  var __hasProp = Object.prototype.hasOwnProperty;
  $ = jQuery;
  currentLive = false;
  window.copypasta = copypasta = {
    init_frame: function(parent_url) {
      copypasta.parent_url = parent_url;
      return $('.close').live('click', function() {
        return copypasta.postMessage('finished');
      });
    },
    postMessage: function(msg) {
      var t;
      t = parent || window;
      return t.postMessage(msg, copypasta.parent_url);
    }
  };
  ids = {
    indicator: 'copy-pasta-edit-indicator',
    dialog: 'copy-pasta-dialog',
    iframe: 'copy-pasta-iframe',
    form: 'copy-pasta-form',
    cancel_btn: 'copy-pasta-cancel'
  };
  paths = {
    indicator: '#' + ids.indicator,
    dialog: '#' + ids.dialog,
    btn: '.copy-pasta-button',
    active: '.copy-pasta-active',
    form: '#' + ids.form,
    cancel_btn: '#' + ids.cancel_btn
  };
  default_form = '<form style="" id="' + ids.form + '" method="post" action="http://copypasta.heroku.com/edits/new" target="' + ids.iframe + '"><input type="hidden" name="view" value="framed"></form>';
  blank_dialog = '<div id="' + ids.dialog + '"><iframe frameborder="no" style="margin: 0px; padding: 0px; width: 400px; height: 400px;" id="' + ids.iframe + '" scrolling="no"></iframe><input type="button" class="close" id="copy-pasta-cancel" style="display:none;"></div>';
  indicator = function() {
    if ($(paths.indicator).length === 0) {
      $('body').append('<div id="' + ids.indicator + '"><p>click to correct</p></div>');
    }
    return $(paths.indicator);
  };
  dialog = function() {
    if ($(paths.dialog).length === 0) {
      $('body').append(blank_dialog);
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
    var data, e, key, value, _ref;
    e = currentLive;
    (_ref = e.original_text) != null ? _ref : e.original_text = e.innerHTML;
    indicator().addClass('loading');
    data = {
      'edit[original]': e.original_text,
      'edit[proposed]': e.original_text,
      'url': window.location.href
    };
    dialog().append(default_form);
    for (key in data) {
      if (!__hasProp.call(data, key)) continue;
      value = data[key];
      $('<input type="hidden" name="' + key + '">').val(value).appendTo(paths.form);
    }
    dialog().lightbox_me();
    return $(paths.form).submit();
  };
  iframe_action = function(e) {
    if (!(e.origin = 'http://localhost:3000')) {
      return;
    }
    if (e.data === 'finished') {
      $(paths.btn + '.on').click();
      return dialog().find(paths.cancel_btn).click();
    }
  };
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
  window.addEventListener('message', iframe_action, false);
}).call(this);
