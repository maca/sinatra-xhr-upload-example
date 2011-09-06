/*
 * jQuery XHR upload plugin
 * http://github.com/maca
 *
 * Copyright 2011, Macario Ortega
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

(function($){
  $.fn.ajaxyUpload = function(opts) {
    var settings  = {
      error      : $.noop, 
      success    : $.noop,
      start      : $.noop,
      complete   : $.noop
    };

    return $(this).each(function(){
      var fileInput = $(this);
      if (opts) { $.extend(settings, opts); }

      // xhrUpload callback, this is triggered below only if the browser has hxr upload
      // capabilities
      fileInput.bind('xhrUpload', function(){
        var self = this;
        $.each(this.files, function(index, file){
          var advance = $('<div>').addClass('inline-upload-advance');
          var pBar    = $('<div>').addClass('inline-upload-progress-bar').append(advance);

          if ((advance.css('height').match(/\d/)[0]|0) == 0) { advance.css('height', '10px'); };
          advance.css('background-color', advance.css('background-color') || '#33a');
          advance.css('width', '0px');

          if ((pBar.css('width').match(/\d/)[0]|0) == 0) { pBar.css('width', '200px'); };
          pBar.css('background-color', pBar.css('background-color') || '#fff');
          pBar.css('border', pBar.css('border') || '1px solid #BBB');

          fileInput.after(pBar);

          var xhrUpload = $.ajax({
            type : "POST",
            url  : settings.url,
            xhr  : function(){
              var xhr = $.ajaxSettings.xhr();
              xhr.upload.onprogress = function(rpe) {
                var progress = (rpe.loaded / rpe.total * 100 >> 0) + '%';
                advance.css('width', progress);
              };
              xhr.onloadstart = function(){
                settings.start.apply(self);
              };
              return xhr;
            },
            beforeSend : function(xhr){
              // here we set custom headers for the rack middleware, first one tells the Rack app we are doing
              // an xhr upload, the two others are self explanatory
              xhr.setRequestHeader("X-XHR-Upload", "1");
              xhr.setRequestHeader("X-File-Name", file.name || file.fileName);
              xhr.setRequestHeader("X-File-Size", file.fileSize);
            },
            success : function(data, status, xhr) {
              settings.success.apply(self, [data, status, xhr]);
            },
            error : function(xhr, text, error) {
              if (xhr.status == 422) {
                settings.error.apply(self, [$.parseJSON(xhr.responseText)]);
              } else if (text != 'abort') {
                settings.error.apply(self);
              };
            },
            complete : function(xhr, status) {
              fileInput.after(fileInput.clone()).remove();
              settings.complete.apply(self);
              pBar.remove();
            },
            contentType : "application/octet-stream",
            dataType    : "json",
            processData : false,
            data        : file 
          });

          $(self).bind('cancelUpload', function(){
            xhrUpload.abort();
            return true;
          })
        });
      });

      // set an iframeUpload callback as fallback for older browsers
      fileInput.bind('iframeUpload', function(){
        var input   = $("<input type='file' class='inline-upload-input'>").attr('name', $(this).attr('name'));
        var iframe  = $("<iframe class='inline-upload-catcher'>").hide().attr('name', 'inline-upload-catcher-' + new Date().getTime());
        var spinner = $('<img>').attr('src', '/images/ajax-loader.gif').addClass('spinner'); // TODO: don't use image.
        var auth    = $("<input type='hidden' name='authenticity_token'>").val($('[name=csrf-token]').attr('content')); // Rails authenticity token
        var form    = $("<form enctype='multipart/form-data' method='post'>").addClass('inline-upload-form').append(input).append(auth);
        form.attr('target', iframe.attr('name'));

        $(this).after(form).after(iframe).hide();

        input.bind('complete', function(event, data){
          if (data.errors) {
            settings.error.apply(this, [data]);
          } else {
            settings.success.apply(this, [data]);
          };
          $(this).nextAll('.spinner').remove();
          settings.complete.apply(this);
        });

        input.change(function(){
          settings.start.apply(this);
          $(this).after(spinner);
          form.attr('action', settings.url).submit();
        });

        iframe.load(function(){
          input.trigger('complete', [$.parseJSON($(this).contents().text())]);
        });
      });

      // Not used just to check browser capabilities
      var xhr = $.ajaxSettings.xhr();
      // If the browser has xhr upload capabilities trigger xhrUpload otherwise fallback to iframe upload
      if (this.files && xhr && xhr.upload && (xhr.upload.onprogress !== undefined)) {
        fileInput.change(function(){ $(this).trigger('xhrUpload') });
      } else {
        fileInput.trigger('iframeUpload');
      };
    })
  };
})(jQuery);
