---		 
title: Papers Sessions		
layout: page
active_nav: "Program"
permalink: /info/papers-sessions		
---		

<!-- <script type="text/javascript" src="https://addevent.com/libs/atc/1.6.1/atc.min.js" async defer></script> -->

<!-- TODO this default style is ugly -->
<link href="http://addtocalendar.com/atc/1.5/atc-style-blue.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="https://addtocalendar.com/atc/1.5/atc.min.js" async defer></script>

<script type="text/javascript" src="https://momentjs.com/downloads/moment.min.js"></script>
<script type="text/javascript" src="https://momentjs.com/downloads/moment-timezone-with-data.min.js"></script>

<div class="row">
  <div class="col">
    <label>My Time Zone is</label>
    <select id="timezone"></select>
  </div>

  <!-- <div class="col">
    <a href="#" class="button" id="guessTime">Guess my Time Zone</a>
  </div> -->
</div>

<h3 id="mytime"></h3>

<hr/>

<script type="text/javascript">

  var default_timezone = "America/Denver"
  var times_select = document.getElementById('timezone');
  var print_date_format = "LLL" //#ddd do, LT"
  var schedule_date_format = "YYYY-MM-DD HH:MM"
  
  // TODO get actual now, this is hardcoded only for testing
  var now = "2019-10-22 09:45"
  var start_soon_mins = 30


  var zone_names = moment.tz.names()

  // TODO maybe we could make this list static
  for(i=0; i<zone_names.length; i++){
    var opt = document.createElement("option");
    opt.value= zone_names[i];
    opt.innerHTML = `(GMT${moment.tz(zone_names[i]).format('Z')}) ${zone_names[i]}`;

    times_select.appendChild(opt);
  }
  
  function getLocalTime(t){
    let otime = moment.tz(t,default_timezone)
    let newtime = otime.clone().tz(times_select.value)
    return newtime.format(print_date_format)
  }

  times_select.onchange = function() {
    var value = this.value;
    var newzone = moment.tz.zone(value)

    var start_time_elements = document.getElementsByClassName("start_time");
    var end_time_elements = document.getElementsByClassName("end_time");
    var start_time_el_text = document.getElementsByClassName("start_time_text");
    var end_time_el_text = document.getElementsByClassName("end_time_text");

    for(var i=0; i<start_time_elements.length; i++) {
      let ms_start = moment(now).diff(moment(start_time_elements[i].value));
      let ms_end = moment(end_time_elements[i].value).diff(moment(now));
      let d_start = moment.duration(ms_start);
      let d_end = moment.duration(ms_end);

      let converted_start_time = getLocalTime(start_time_elements[i].value)
      let converted_end_time = getLocalTime(end_time_elements[i].value)

      //console.log("diff mins start" , d_start.asMinutes())
      //console.log("diff mins end" , d_end.asMinutes())
      
      if(d_start.asMinutes() >= 0 && d_end.asMinutes() >= 0){
        start_time_el_text[i].innerHTML = '<span style="color: red">[ Live Now ]</span>&nbsp;' +"<b>"+converted_start_time+"</b>"
        end_time_el_text[i].innerHTML = converted_end_time
      }
      else if(d_start.asMinutes() >= -(start_soon_mins) && d_end.asMinutes() >= 0){
        start_time_el_text[i].innerHTML = '<span style="color: orange">[ Start Soon ]</span>&nbsp;' +"<b>"+converted_start_time+"</b>"
        end_time_el_text[i].innerHTML = converted_end_time
      }
      else{
        start_time_el_text[i].innerHTML = converted_start_time
        end_time_el_text[i].innerHTML = converted_end_time
      }
      
    }

  };

  // TODO optimize this
  function updateTimeSelection(zone){
    for(i=0; i< times_select.length; i++){
      let thisgmt = times_select[i].value
      if(thisgmt == zone){
        times_select[i].selected=true
        times_select.onchange()
        break
      }
    }
  }

  function guessTimeZone(){
    let zone = moment.tz.guess()
    updateTimeSelection(zone)
    return zone;
  }

  // document.getElementById('guessTime').onclick = function() {
  //   guessTimeZone()
  // };

</script>


{% for entry in site.data.papers %}

<a href="#" data-toggle="tooltip" data-placement="top" title="Original Time: {{entry.start}}">
  <input type="hidden" class="start_time" value="{{entry.start}}">
  <b class="start_time_text">{{entry.start}}</b>
</a>
<span>-</span>
<a href="#" data-toggle="tooltip" data-placement="top" title="Original Time: {{entry.end}}">
  <input type="hidden" class="end_time" value="{{entry.end}}">
  <b class="end_time_text">{{entry.end}}</b>
</a>

<h4>{{entry.title}}</h4>
<p>{{entry.authors}}</p>
<a>{{entry.location}}</a>

<!-- Button code -->
<!-- <div title="Add to Calendar" class="addeventatc">
    Add to My Calendar
    <span class="start">{{entry.start}}</span>
    <span class="end">{{entry.end}}</span>
    <span class="timezone">America/Denver</span>
    <span class="title">{{entry.title}}</span>
    <span class="description">{{entry.title}} - {{entry.authors}}</span>
    <span class="location">{{entry.location}}</span>
</div> -->

<span class="addtocalendar atc-style-blue">
    <var class="atc_event">
        <var class="atc_date_start">{{entry.start}}</var>
        <var class="atc_date_end">{{entry.end}}</var>
        <var class="atc_timezone">America/Denver</var>
        <var class="atc_title">{{entry.title}}</var>
        <var class="atc_description">{{entry.title}} - {{entry.authors}}</var>
        <var class="atc_location">{{entry.location}}</var>
        <!-- <var class="atc_organizer">Luke Skywalker</var>
        <var class="atc_organizer_email">luke@starwars.com</var> -->
    </var>
</span>

<br/>
{% endfor %}


<script type="text/javascript">
  guessTimeZone()
</script>
