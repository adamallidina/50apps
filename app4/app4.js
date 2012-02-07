$(function(){
  $(window).keyup(function(ev){
    if (ev.keyCode == 46){
      // delete
      $(".selected").remove();
    }
  });
  $("#new-note").click(function(){
    // create the div
    var div = $("<div>")
      .addClass("post-it")
      .appendTo("body")
      .click(function(){
        // de-select other ones
        $(".selected").removeClass("selected");
        $(this).addClass("selected");
      })
      .fadeIn(1000);

    // append a close button
    div.append(
      $("<div>")
        .addClass("delete")
        .html("X")
        .click(function(){
          div.remove();
        }));
  });
});
