require 'sinatra'
require 'json'

$:.unshift File.dirname(__FILE__) 
require 'lib/raw_upload'

class MyApp < Sinatra::Base
  use Rack::RawUpload

  configure do
    set :root, File.dirname(__FILE__) 
    set :uploads, File.join(root, 'uploads')
    Dir.mkdir uploads unless Dir.exists? uploads
  end

  get '/' do
    erb :index
  end

  post '/upload' do
    content_type 'application/json', :charset => 'utf-8' if request.xhr?
    
    file_hash = params[:file]
    save_path = File.join settings.uploads, file_hash[:filename]
    File.open(save_path, 'wb') { |f| f.write file_hash[:tempfile].read }
    
    # should allways return json
    file_hash.to_json
  end
end
