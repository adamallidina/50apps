// the ability to set cursor positions
new function($) {
  $.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
      $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
      var range = $(this).get(0).createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
    return $(this);
  }
}(jQuery);

function saveAll(){
  localStorage["postits"] = JSON.stringify(
    $(".post-it").map(function(){
      // is this the one we're typing in?
      var text;
      if ($(".text textarea", this).length == 0){
        // no
        text = $(".text", this).html();
      } else {
        // yes
        text = $(".text textarea", this).val();
      }
      return {
        offset: $(this).offset(),
        text: text,
        colour: $(this).css("backgroundImage")
      };
    }).toArray());
}

function deselect(){
  $(".selected")
    .removeClass("selected")
    .children(".text")
      .each(function(){
        $(this).html($("textarea", this).val())
  });
}

function createPostit(){
  // create the div
  var div = $("<div>")
    .addClass("post-it")
    .append($("<div>").addClass("text"))
    .click(function(){
      // when clicked, de-select other ones and select this one
      deselect();
      $(this).addClass("selected");
    })
    .draggable({
      // when we stop dragging, save position
      stop: saveAll
    })
    .appendTo("body")
    .fadeIn(1000);

  // append a close button
  div.append(
    $("<div>")
      .addClass("delete")
      .html("X")
      .click(function(){
        div.remove();
        saveAll();
      }));

  return div;
}

$(function(){
  $(window).keypress(function(ev){
    if (ev.keyCode == 46){
      // delete
      $(".selected").remove();
    }else{
      if ($(".text textarea").length == 0){
        // start typing into the selected box
        var content = $(".selected .text").html() || "";

        if (ev.keyCode == 8){
          // backspace
          if (content.length > 0){
            content = content.substring(0, content.length - 1);
          }
        }else if (
            (ev.which >= 32 && ev.which <= 126) || // regular character
            (ev.which == 9) // tab
          ){
          content += String.fromCharCode(ev.which);
        }else if (ev.which == 10 || ev.which == 13){ // new line
          content += "\r\n";
        }else if (ev.which == 27){ // escape
          deselect();
          return;
        }
        $(".selected .text")
          .html("")
          .append($("<textarea></textarea>")
            .val(content)
            .keyup(saveAll));

        $("textarea").focus().setCursorPosition(content.length + 1);
      }
    }
  });
  $("#new-note").click(function(){
    createPostit();
  });

  $.each(["blue", "red", "yellow", "green"], function(idx, colour){
    $("." + colour).click(function(){
      $(".selected").css("backgroundImage", $(this).css("backgroundImage"));
      saveAll();
    });
  });

  // load all the objects from storage
  var objs = JSON.parse(localStorage["postits"]);

  if (objs){
    $.each(objs, function(idx, obj){
      createPostit()
        .offset(obj.offset)
        .css("backgroundImage", obj.colour)
        .children(".text")
          .html(obj.text);
    });
  }
});
