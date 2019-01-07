function plot1(){
var fullwidth = 500;
var fullheight = 200;
var margin = { top: 20, right: 30, bottom: 20, left: 70 };


var width = fullwidth - margin.left - margin.right;
var height = fullheight - margin.top - margin.bottom;

var timeParse = d3.timeParse("%Y");
var timeFormat = d3.timeFormat("%Y");
var xScale = d3.scaleTime()
          .range([0, width]);

var yScale = d3.scaleLinear()
          .range([0, height]);

var xAxis = d3.axisBottom(xScale)
        .tickFormat(function(d) {
          return timeFormat(d);
        })
        .ticks(5);

var yAxis = d3.axisLeft(yScale).ticks(5);

var line = d3.line()
  .x(function(d) {
    return xScale(timeParse(d.Year));
  })
  .y(function(d) {
    return yScale(+d.Amount);
  })
  // .curve(d3.curveCardinal) ;

var year = ["2000","2017"];
var svg = d3.select(".plot1")
      .append("svg")
      .attr("width", fullwidth)
      .attr("height", fullheight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var radius = 3;
var tooltipMine = d3.select("body")
                .append("div")
                .attr("class", "tooltipMine");


d3.csv("plot1.csv",function(data){
  console.log(data);
  // var dataset = d3.nest()
  //                 .key(function(d){
  //                   return d.Country;
  //                 })
  //               .entries(data);
  // console.log(dataset);

  xScale.domain(
    d3.extent(year, function(d){
      return timeParse(d);
    })
  );
  yScale.domain([
    d3.max(data, function(d) {
      return +d.Amount;
    }),
    0
  ])
  .nice();

//groups
groups = svg.append("path")
   .datum(data)
   .attr("class", "line")
   .attr("d", line);

// groups.on("mouseover", mouseoverGroups)
//       .on("mouseout", mouseoutGroups);


//circles
var circles = svg.selectAll("circle")
  .data(data)
  // .data(function(d) {
  //       return d.Amount;
  // })
  .enter()
  .append("circle");

circles.attr("cx", function(d) {
    return xScale(timeParse(d.Year));
  })
  .attr("cy", function(d) {
    return yScale(+d.Amount);
  })
  .attr("r", radius)
  .attr("opacity", 0);

circles
  .on("mouseover", mouseoverCircle)
  .on("mousemove", mousemoveCircle)
  .on("mouseout",	mouseoutCircle);


//axis
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("class", "ylabel")
  .attr("transform", "translate(110, 0)")
  .style("z-index", "10")
  .style("text-anchor", "top")
  .text("恐怖袭击事件个数");

})
// function mouseoverGroups(d) {
//
//
// 	d3.select(this).classed("unfocused", false).classed("focused", true);
//
// }
//
// function mouseoutGroups() {
// 		d3.select("path.line").classed("unfocused", true).classed("focused", false);
//
// }



function mouseoverCircle(d) {
  d3.select(this)
    .transition()
    .style("opacity", 1)
    .attr("r", radius * 1.5);

  tooltipMine
    .style("display", null)
    .html(
      "<p>年份: " + d.Year +
      "<br>恐怖袭击事件数: "+ d.Amount + "</p>"
    );
  }

function mousemoveCircle(d) {
  tooltipMine
    .style("top", (d3.event.pageY - 60) + "px" )
    .style("left", (d3.event.pageX - 50) + "px");
  }

function mouseoutCircle(d) {
  d3.select(this)
    .transition()
    .style("opacity", 0)
    .attr("r", 3);


  tooltipMine.style("display", "none");
}
}
//-----------------plot1---------------
//----------------plot2---------------
function plot2(){
  var fullwidth = 500,
          fullheight = 200;

      var margin = {top: 20, right: 30, bottom: 20, left: 70},
          width = fullwidth - margin.left - margin.right,
          height = fullheight - margin.top - margin.bottom;

      var svg = d3.select(".plot2").append("svg")
              .attr("width", fullwidth )
              .attr("height", fullheight)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var xScale = d3.scaleTime()
              .range([0, width]);

      var yScale = d3.scaleLinear()
              .range([height, 0]);

      var colorScale = d3.scaleOrdinal()
                         .range(["rgb(96, 5, 2)","#900A06"]); //
      var xAxis = d3.axisBottom(xScale).ticks(5);
      var yAxis = d3.axisLeft(yScale).ticks(5);

      var formatDate = d3.timeFormat("%Y");
      var parseDate = d3.timeParse("%Y");
      var tooltipMine = d3.select("body")
                      .append("div")
                      .attr("class", "tooltipMine");


//  NEW HERE

      //用于处理数据，把数据做成直接能画area的状态
      var stack = d3.stack()

      // 用stack的结果去画area
      var area = d3.area()
              // .curve(d3.curveCardinal)
              .x(function(d) {return xScale(parseDate(d.data.Year)); })
              .y0(function(d) { return yScale(d[0]); })
              .y1(function(d) { return yScale(d[1]); });

      d3.csv("plot1.csv", function(error, data) {

          if (error) { console.log(error); };
console.log(data);

          // 1. wide data prepared
          // console.log("wide dataset", dataset)

          // 2. stack function
          var category = ["Fatalities","Injuries"]

          stack.keys(category)
              .order(d3.stackOrderNone)
              // .order(d3.stackOrderInsideOut)
              .offset(d3.stackOffsetNone)
              // .offset(d3.stackOffsetWiggle);

          // 3. stack the data
          var layers = stack(data);
          console.log("layers", layers);  // it adds a y0 and y1 to the data values.


          var maxY = d3.max(
              layers,  function(l){
                  return d3.max(l, function(d) { return d[1]; })
              }
          )
          console.log(maxY) // highest y1

          xScale.domain(d3.extent(data, function(d) { return parseDate(d.Year); }));
          yScale.domain([0, maxY]);


          // 5. draw stacked layers
          svg.selectAll(".layer")
              .data(layers) //上面stack出来的，记得吗？
              .enter()
              .append("path")
              .attr("class", "layer")
              .attr('d', area) // 用上面的area生成器来画
              .style("fill", function(d) { return colorScale(d.key); }); // just count off
              // .append("title")
              // .text(function(d) {
              //     return d.key;
              // })
          var layers = d3.selectAll(".layer")
          .on("mouseover", mouseoverFunc)
          .on("mousemove", mousemoveFunc)
              .on("mouseout", mouseoutFunc);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);
      });
      function mouseoverFunc(d){
        console.log(this);
        d3.selectAll(".layer")
          .style("opacity","0.2")
        d3.select(this)
        .style("opacity", "1")
        tooltipMine
          .style("display", null);
        if (d.key === "Fatalities") {
          tooltipMine.html("<p>死亡人数</p>");
        }
        else {
          tooltipMine.html("<p>受伤人数</p>");
        }

      }
      function mousemoveFunc(d) {
        tooltipMine
          .style("top", (d3.event.pageY - 10) + "px" )
          .style("left", (d3.event.pageX + 10) + "px");
        }
      function mouseoutFunc(d){
        d3.selectAll(".layer")
        .style("opacity", "1")
        .style("fill", function(d) { return colorScale(d.key); });
        tooltipMine.style("display", "none");
      }


}
//-----------------------plot2---------------------
//-----------------------plot3---------------------
function plot3(){
  var fullwidth = 650;
  var fullheight = 370;

  var margin = { top: 20, right: 10, bottom: 50, left: 50 };

  var width = fullwidth - margin.right - margin.left;
  var height = fullheight - margin.top - margin.bottom;

  var dateParse = d3.timeParse("%Y/%m/%d");
  var dateFormat = d3.timeFormat("%Y-%m-%d");
  var outputFormat = d3.timeFormat("%Y");
  var tooltipMine = d3.select("body")
                  .append("div")
                  .attr("class", "tooltipMine");



  var svg = d3.select(".plot3")
      .append("svg")
      .attr("width", fullwidth)
      .attr("height", fullheight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

  var dotRadius = 4;
  var dateDomain = ["2000/1/1", "2017/12/31"];

  var xScale = d3.scaleTime()
            .range([ 0, width])
              xScale.domain(d3.extent(dateDomain,function(d){ return dateParse(d); }));
            // .domain([-1, 100]);

  var yScale = d3.scaleLinear()
            .range([ height, 0 ])
            // .domain([-1, 100]);

  var xAxis = d3.axisBottom(xScale);

  var yAxis = d3.axisLeft(yScale);


  // utility for label placement jitter
  /*function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }*/


  d3.csv("GTDrawdata.csv", function(data) {
    console.log(data);
    var menu = d3.select("#menu select")
        .on("change", filter);

    // 初始下拉菜单
      menu.property("value", "all");

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("text")
      .attr("class", "xlabel")
      .attr("transform", "translate(" + (width - 20) + " ," +
            (height + 25) + ")")
      .style("text-anchor", "middle")
      .attr("dy", 12)
      .text("年份");

    svg.append("text")
      .attr("class", "ylabel")
      .attr("transform", "translate(50,-15)")
      .style("text-anchor", "middle")
      .attr("dy", 20)
      .text("死亡人数");

    //初始化
    var curSelection = menu.property("value");
      render(data);  // do the full dataset render first.


      // Functions for handling updates and drawing with data
    function filter() {
      //get下拉菜单的当前value
      curSelection = menu.property("value");

      if (curSelection === "all") {
          var newData = data;
      } else { //poorest 10
          var newData = data.sort(function(a,b) {
            return b.FATALITIES - a.FATALITIES;
          }).slice(0, 10);
      }
        console.log(newData);
      render(newData);
    }


    function render(data) {

      // xScale.domain(d3.extent(dateDomain,function(d){ return dateParse(d); }));
      yScale.domain(d3.extent(data,function(d){ return +d.FATALITIES; })).nice();

      // data join
      var circles = svg.selectAll("circle")
        .data(data, function(d) {return d.ID;}); // key function!

      circles.enter()
        .append("circle")
        .merge(circles)
        .attr("class", "dots")
        .attr("fill", function(d){
          if (d.Information == "") {
            return "rgb(161, 161, 161)";
          }
          else {
            return "rgb(78, 16, 26)";
          }
        })
        .transition()
        .duration(2000)
        .attr("cx", function(d) {
          return xScale(dateParse(d.DATE));
        })
        .attr("cy", function(d) {
          return yScale(+d.FATALITIES);
        })
        .attr("r", function() {
          if (curSelection !== "all") {
            return dotRadius * 2;
          }
          else {
            return dotRadius;
          }
        })



      circles
        .exit()
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();


      // Update the axes
      svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

            svg.select(".y.axis")
                .transition()
                .duration(1000)
                .call(yAxis);



    } // end of render
    var tooltipMine = svg.selectAll("circle")
          .on("mouseover",mouseoverFunc)
          .on("mousemove",mousemoveFunc)
          .on("mouseout", mouseoutFunc);

  });
  function mouseoverFunc(d){
    console.log(this);
    d3.select(this)
      .style("opacity", "0.5");
      tooltipMine
        .style("display", null)
        .html(
          "<p>日期: " + d.DATE +
          "<br>地点："+ d.chinese +
          "<br>死亡人数: "+ d.FATALITIES + "</p>"
        );
  }
  function mousemoveFunc(d) {
    tooltipMine
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
    }
  function mouseoutFunc(d){
    d3.selectAll(".dots")
      .style("opacity", "1");
    tooltipMine
      .style("display","none");
  }

}
//-----------------plot3---------------------
//-----------------plot4---------------------
function plot4(){
  var width = 500;
  var height = 400;
  var deathNumber = d3.select(".deathNumber");
  var injuryNumber = d3.select(".injuryNumber");
  var dateContainer = d3.select(".dateContainer");
  var placeContainer = d3.select(".placeContainer");
  var otherOptions = d3.select(".otherOptions");
  var attackType = d3.select(".attackType");

  var svg = d3.select("#china")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  var g_china = svg.append("g").attr("class","china"),
    g_location = svg.append("g").attr("class","location");

  var r = 3;
  var mapTooltip = d3.select("#china")
                  .append("div")
                  .attr("class", "mapTooltip")

  var projection = d3.geoMercator()

  var geoGenerator = d3.geoPath()
    .projection(projection);


  // var colorScale2 = d3.scaleLinear().range(["#fee0d2", "#de2d26"]);

  // we use queue because we have 2 data files to load.
  queue()
      .defer(d3.json, "china_diaoyudao.json")
      .defer(d3.csv, "GTDrawdata.csv", typeAndSet)
      .await(loaded);

  function typeAndSet(d){
    d.longitude = +d.longitude;
    d.latitude = + d.latitude;
    // districtByName.set(d.district, d)
    return d;
  }

  function loaded(error, china, location){
    if(error) throw error;

    console.log(location);

    projection.fitSize([500,400], china);

    // china map
    var map = g_china.selectAll("path")
      .data(china.features);

    map.enter()
      .append("path")
      .attr("d", geoGenerator)
      .attr("fill", "#c3c3c3")
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("stroke-width", "1px");

    var circles = g_location.selectAll("circle")

      .data(location)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("id", function(d){return d.ID})
      .attr("cx", function(d){ return projection([d.longitude, d.latitude])[0]} )
      .attr("cy", function(d){ return projection([d.longitude, d.latitude])[1]})
      .attr("r", r)
      .style("position", "absolute");

    circles
      .on("mouseover", mouseoverFunc)
      .on("mouseout", mouseoutFunc)
      .on("click", clickFunc)

  //-----------实现下拉菜单功能------------
  var menu = d3.select(".optionpicker");
               menu.on("change", filter);
  menu.property("value", "43");
  var curSelection = menu.property("value");
  filter();

  circles
      .data(location)
      .attr("fill", function(d){
        if (curSelection === d.ID) {
          return "rgb(244, 37, 0)";
        }
        else if (d.Information == "") {
          return 'rgb(161,161,161)';
        }
        else{
          return "rgb(78, 16, 26)";
        }
      });

    function geteachData(Id){
      var a = Id - 1;
      return location[a];
    }
    var curData = geteachData(curSelection)
    mapTooltip
        .html("<p style='color: rgb(78, 16, 26); font-size: 18px;'>" + curData.chinese + "</p>")
          .style("top", "40px")
          .style("left", "30px");

    function filter(){
      var  curSelection = menu.property("value");
      var curData = geteachData(curSelection);
      console.log(curSelection);
      circles
          .data(location)
          .attr("fill", function(d){
            if (curSelection === d.ID) {
              return "rgb(244, 37, 0)";
            }
            else if (d.Information == "") {
              return 'rgb(161,161,161)';
            }
            else{
              return "rgb(78, 16, 26)";
            }
          })
            .style("z-index", function(d){
              if (curSelection === d.ID) {
                return "999";
              }
              else {
                return "9";
              }
            });

          mapTooltip
              .html("<p style='color: rgb(78, 16, 26); font-size: 18px;'>" + curData.chinese + "</p>")
                .style("top", "40px")
                .style("left", "30px");
      deathNumber
          .html("<p>" + curData.FATALITIES + "</p>");
          injuryNumber
            .html("<p>" + curData.INJURED + "</p>");
            dateContainer
              .html("<p class='dateAndPlace'>" + curData.DATE +"</p>");
            placeContainer
              .html("<p class='dateAndPlace'>" + curData.chinese +"</p>");
            attackType
                .html("<p class='attackTy'>" + curData.TYPE +"</p>");

    }



};

  function mouseoverFunc(d){

    mapTooltip
        .style("display", null)
        .html("<p style='color: rgb(78, 16, 26); font-size: 18px;'>" + d.chinese + "</p>")
        .style("top", "40px")
        .style("left", "30px");
    d3.select(this)
      .attr("r", r * 2);
  }

  function mouseoutFunc(d){
    d3.selectAll(".circle")
      .attr("r", r);
    // d3.select(this)
    //   .attr("r", r*2);

    // mapTooltip
    //     .style("display", "none");
  }

  function clickFunc(d){
    d3.selectAll(".circle")
      .attr("fill", function(d){
        if (d.Information == "") {
          return 'rgb(161,161,161)';
        }
        else{
          return "rgb(78, 16, 26)";
        }
      })
    d3.select(this)
      .attr("fill", "rgb(244, 37, 0)");


    var menu = d3.select(".optionpicker");
    menu.property("value", +d.ID);
    deathNumber
      .html("<p>" + d.FATALITIES + "</p>");
    injuryNumber
      .html("<p>" + d.INJURED + "</p>");
    dateContainer
      .html("<p class='dateAndPlace'>" + d.DATE +"</p>");
    placeContainer
      .html("<p class='dateAndPlace'>" + d.chinese +"</p>");
    otherOptions
      .html(d.Information);
    attackType
      .html("<p class='attackTy'>" + d.TYPE +"</p>");
    menu.property("value", "correct");

  }
}
