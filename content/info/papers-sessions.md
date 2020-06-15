---		 
title: Papers Sessions		
layout: page
active_nav: "Program"
permalink: /info/papers-sessions		
---		

<script type="text/javascript" src="https://addevent.com/libs/atc/1.6.1/atc.min.js" async defer></script>
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
  var times_select = document.getElementById('timezone');
  var date_format = "ddd do, LT"
  
  var zone_names = moment.tz.names()

  // TODO maybe we could make this list static
  for(i=0; i<zone_names.length; i++){
    var opt = document.createElement("option");
    opt.value= zone_names[i];
    opt.innerHTML = `(GMT${moment.tz(zone_names[i]).format('Z')}) ${zone_names[i]}`;

    times_select.appendChild(opt);
  }
  
  function getLocalAndOriginalTime(t){
    let otime = moment.tz(t,"America/Denver")
    let newtime = otime.clone().tz(times_select.value)
    console.log("in ", otime.format(date_format), "out", newtime.format(date_format))
    return newtime.format(date_format)
  }

  times_select.onchange = function() {
    var value = this.value;
    var newzone = moment.tz.zone(value)

    var elements = document.getElementsByClassName("time");
    var elements_text = document.getElementsByClassName("time_value");
    for(var i=0; i<elements.length; i++) {
      elements_text[i].innerHTML = "<b>"+getLocalAndOriginalTime(elements[i].value)+"</b>"
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

  document.getElementById('guessTime').onclick = function() {
    guessTimeZone()
  };

</script>


{% for entry in site.data.papers %}

<a href="#" data-toggle="tooltip" data-placement="top" title="Original Time: {{entry.start}}">
  <input type="hidden" class="time" value="{{entry.start}}">
  <b class="time_value">{{entry.start}}</b>
</a>
<span>-</span>
<a href="#" data-toggle="tooltip" data-placement="top" title="Original Time: {{entry.end}}">
  <input type="hidden" class="time" value="{{entry.end}}">
  <b class="time_value">{{entry.end}}</b>
</a>

<h4>{{entry.title}}</h4>
<p>{{entry.authors}}</p>
<a>{{entry.location}}</a>

<!-- Button code -->
<div title="Add to Calendar" class="addeventatc">
    Add to My Calendar
    <span class="start">{{entry.start}}</span>
    <span class="end">{{entry.end}}</span>
    <span class="timezone">America/Denver</span>
    <span class="title">{{entry.title}}</span>
    <span class="description">{{entry.title}} - {{entry.authors}}</span>
    <span class="location">{{entry.location}}</span>
</div>

<br/>
{% endfor %}


<script type="text/javascript">
  guessTimeZone()
</script>
