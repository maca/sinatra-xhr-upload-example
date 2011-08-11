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
