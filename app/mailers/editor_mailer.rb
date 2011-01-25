class EditorMailer < ActionMailer::Base
  default :from => "copypasta@credibl.es"
  layout 'editor_email'
  helper :edits

  def new_edit_notice(edit, editor)
    @edit = edit
    @editor = editor
    from = "copypasta <copypasta+edit-#{edit.id}-#{edit.key}@credibl.es>"

    mail(:to => editor.email, :from => from, :subject => "Corrections for #{edit.page.url}", :bcc => 'kurt@mubble.net')
  end

  def edit_message(edit, message, editor)
    from = "copypasta <copypasta+edit-#{edit.id}-#{edit.key}@credibl.es>"
    mail(:to => editor.email, :from => from, :subject => "Re: Corrections for #{edit.page.url}", :bcc => 'kurt@mubble.net')

  end

  def receive(email)
    addr = ReceivedEmail.parse_address(email.to.join(","))
    return unless addr && addr[:id]

    e = Edit.where(:id => addr[:id]).first

    if addr[:key].nil? #user response
      message = email.text_part.body.to_s
      e.page.account.editors.each do |editor|
        EditorMailer.edit_message(e, message, editor)
      end
    else #editor response
      ins = ReceivedEmail.parse_body(email.text_part.body.to_s, addr[:key])
      if e && addr[:key] == e.key
        e.last_message = ins[:message]
        unless ins[:status].blank?
          e.status = ins[:status]
          Rails.logger.info "Updating status on edit #{e.id}: #{ins[:status]}"
        end
        e.save!
      elsif e && addr[:key] != e.key
        Rails.logger.info "Key for #{e.id} didn't match: #{addr[:key]}"
      elsif e.nil?
        Rails.logger.info "Can't find edit #{addr[:id]}, ignoring email"
      end
    end
  end
end
