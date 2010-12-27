$ = jQuery
currentLive = false

ids =
  indicator: 'copy-pasta-edit-indicator'
  dialog: 'copy-pasta-dialog'
  iframe : 'copy-pasta-iframe'
  form : 'copy-pasta-form'

paths =
  indicator: '#' + ids.indicator
  dialog: '#' + ids.dialog
  btn: '.copy-pasta-button'
  active: '.copy-pasta-active'
  form: '#' + ids.form

default_form = '<form id="' + ids.form + '" method="post" action="edits/new" target="' + ids.iframe + '"><input type="hidden" name="view" value="framed"></form>'

indicator = () ->
  if $(paths.indicator).length == 0
    $('body').append('<div id="' + ids.indicator + '"><p>click to correct</p></div>')
  $(paths.indicator)

dialog = () ->
  if $(paths.dialog).length == 0
    $('body').append('<div id="' + ids.dialog + '"><iframe id="' + ids.iframe + '"></iframe>' + default_form + '</div>')
  $(paths.dialog)

activate = () ->
  pos = $(this).offset()
  pos.top = pos.top + 'px'
  pos.left = pos.left + 'px'
  sz =
    width: $(this).outerWidth() + 'px'
    height: $(this).outerHeight() + 'px'

  indicator().css(sz).css(pos).show()
  currentLive = this

deactivate = () ->
  indicator().hide()
  currentLive = false

watch = (el) ->
  $(paths.active + ' ' + el).live('mouseover', activate)

show_widget = () ->
  e = currentLive
  e.original_text ?= e.innerHTML

  indicator().addClass('loading')

  data =
    'edit[original]' : e.original_text
    'edit[proposed]' : e.original_text
    'edit[url]' : window.location.href

  $(paths.form).replaceWith(default_form)

  for own key, value of data
    i = $('<input type="hidden" name="' + key + '">')
    i.val(value)
    $(paths.form).append(i)

  dialog().lightbox_me()
  console.debug($(paths.form))
  $(paths.form).submit()

iframe_action = (e) ->
  console.debug(e)

watch el for el in ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5']

$(paths.indicator).live('mouseout', deactivate)
$(paths.indicator).live('click', show_widget)

$(paths.btn + '.off').live 'click', ()->
  btn = $(this)
  btn.removeClass('off').addClass('on')
  $(btn.attr('href')).addClass('copy-pasta-active')

$(paths.btn + '.on').live 'click', ()->
  btn = $(this)
  btn.removeClass('on').addClass('off')
  $(btn.attr('href')).removeClass('copy-pasta-active')

window.addEventListener('message', iframe_action, false)
