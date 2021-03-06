class SessionsController < ApplicationController
  def new
    raise "Key required" unless params[:key]
    token = EditorToken.where(:key => params[:key]).first
    raise "Invalid key" if token.nil?
    EditorToken.increment_counter(:use_count, token.id)
    setcookie "editor_key_#{token.editor.account.id}", token.key
    redirect_to params[:url] || '/'
  end
end
