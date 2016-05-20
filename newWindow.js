function nWin() {
  var w = window.open();
  //var html = $("#toNewWindow").html();
  var html = $("svg").html();
  console.log(html);
  $(w.document.body).html(html);
}

$(function() {
  $("a#print").click(nWin);
});

