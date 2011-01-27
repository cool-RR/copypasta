class ApplicationController < ActionController::Base
  protect_from_forgery

  def setcookie(name, value)
    cookies.permanent[name] = {
      :value => value,
      :secure => Rails.env == 'production',
      :httponly => true
    }
  end

  def require_account!
    raise "You must supply either an account ID or a URL" if account.nil?
  end

  def host
    return @host if @host
    return nil unless params[:url]
    u = URI.parse params[:url]
    @host = u.host
  end

  def account
    return @account if @account

    @account = Account.find_with_obfuscated_id(params[:account_id]) unless params[:account_id].blank? || params[:account_id] == 'undefined'
    if @account.nil? && !(h = host).nil?
      @account = Account.for_host(h)
    end
    @account
  end

  def is_editor_for?(account_or_child)
    account = ((account_or_child.is_a?(Account) && account_or_child) || account_or_child.account)
    t = cookies["editor_key_#{account.id}"]
    return false if t.nil?
    EditorToken.where(:key => t).first || false
  end

  def editor_for
    keys = cookies.select{|k| k.index('editor_key_') == 0}.map{|k,v| v}
    EditorToken.where('editor_tokens.key in (?)', keys).includes(:editor).map{|et| et.editor.account_id}
  end

  def no_cache!
    headers['Cache-Control'] = 'no-cache'
  end
end
