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

// a function to escape HTML elements
escapeHTML = function(s) {
  if (s){
    var MAP = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&#34;',
      "'": '&#39;'
    };
    var repl = function(c) { return MAP[c]; };
    return s.replace(/[&<>'"]/g, repl);
  }else{
    return "";
  }
};

function saveAll(){
  // All the postits are stored as JSON in local storage
  localStorage["postits"] = JSON.stringify(
    $(".post-it").map(function(){
      // is this the one we're typing in?
      var text;
      if ($(".text textarea", this).length == 0){
        // no
        text = $(".text", this).html();
      } else {
        // yes
        text = escapeHTML($(".text textarea", this).val());
      }

      // save this postit as a basic Javascript object
      return {
        offset: $(this).offset(),
        text: text,
        colour: $(this).css("backgroundImage"),
        timestamp: $(".timestamp", this).html()
      };
    }).toArray());
}

// deselects the selected postit
function deselect(){
  $(".selected")
    .removeClass("selected")
    .children(".text")
      .each(function(){
        // when you deselect something, remove the textarea
        // if it is there and put the contents in as HTML
        if ($("textarea", this).length > 0){
          $(this).html(escapeHTML($("textarea", this).val()));
        }
      });
}

function createPostit(){
  var time = new Date();
  var div = $("<div>")
    .addClass("post-it")
    // each post-it has a div called text which holds the contents of this postit
    .append($("<div>").addClass("text"))
    // another div for holding the time stamp
    .append($("<div>").addClass("timestamp")
        .html($.datepicker.formatDate("yy-mm-dd", time) + " " + (time.getHours() + ":" + time.getMinutes())))
    .click(function(){
      deselect();
      $(this).addClass("selected");
    })
    .draggable({
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
      // delete key - remove the selected post-it
      $(".selected").remove();
      saveAll();
    }else if (ev.keyCode == 27){
      // escape - deselect the current post-it
      deselect();
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
          .html(obj.text)
        .end()
        .children(".timestamp")
          .html(obj.timestamp);
    });
  }
});
