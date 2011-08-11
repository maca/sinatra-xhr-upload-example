HTML 5 xhr uploads for Ruby Web Apps with fallback for older browsers using jQuery
==================================================================================

Progress bars when uploading files or at least some kind of feedback is a really basic usability feature,
but so far has been a pain to implement, at least for me, and the solution used to rely on Flash.

Another hack to simulate ajaxy uploads is to use iframes but that doesn't give a progress bar, at most you can display a spinner.

So heres my shot at having a true xhr file upload with progress bar for Rails/Sinatra/Rack apps with iframe fallback for older browsers.
The iframe fallback is truly hackish, but it works. I used Sinatra for it's immediacy but it translates easily to Rails.

https://github.com/maca/sinatra-xhr-upload-example

BTW, if you're running local make sure you choose a big file otherwise you won't see a progress bar because of the short upload time.

Some clarification
------------------

jquery.xhr-upload.js 
Is a jQuery plugin I wrote, it checks browser capabilities and does the xhr or faux ajax upload accordingly.

Here's the content of application.js:
 
    #!javascript
    $(function(){
      $('input.upload').livequery(function(){
        $(this).ajaxyUpload({
          // set url
          url : '/upload',
          // upload succeded callback
          success : function(data){
            // 'this' points to the file input
            var notice = $('<div class="confirmation">').text('You uploaded "' + data.filename + '"');
            $(this).closest('form').css('background-color', '#dfd').prepend(notice);
          },
          // upload start callback
          start : function() {
            $('div.confirmation').remove();
            $(this).closest('form').css('background-color', '#dff');
          },
          // completed callback for both success and error
          complete : function() {
          },
          // upload error callback
          error : function(data) {
            $(this).closest('form').css('background-color', '#fdd');
          }
        });
      });
    });

Notice I've used livequery (which IMO is the coolest jQuery plugin ever written) instead of calling ajaxyUpload directly on the jQuery object,
the latter works only for the first upload.

The callbacks work for either xhr or iframe uploads and the upload action should allways return json regardless of the type of request. Yeah, that's 
hackish, when the upload uses an iframe the response rendered in the iframe is parsed as json and used for the callbacks.  

A Rack middleware is needed for the upload to be accessible in params by the web app, my middleware blatantly borrows from New Bamboos' RawUpload
but I chose to limit processings to requests that had the custom header 'HTTP_X_XHR_UPLOAD' instead of by defined routes, the jQuery plugin sets this
header.
