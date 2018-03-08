var dataset = [
    {
        day: 'Monday',
        type: 'dhw',
        settings: { hourStart: 12, minuteStart: 0, hourEnd: 14, minuteEnd: 0, temp: 10 }
    },
    {
        day: 'Monday',
        type: 'dhw',
        settings: { hourStart: 5, minuteStart: 0, hourEnd: 7, minuteEnd: 45, temp: 60 }
    },
    {
        day: 'Tuesday',
        type: 'dhw',
        settings: { hourStart: 9, minuteStart: 0, hourEnd: 12, minuteEnd: 0, temp: 32 }
    },
    {
        day: 'Sunday',
        type: 'dhw',
        settings: { hourStart: 6, minuteStart: 0, hourEnd: 20, minuteEnd: 0, temp: 32 }
    }
]

function timePassedPercente(hour, minute, second){
  var secondsSinceMidnight = second + (minute * 60) + (hour * 3600)
  var totalSecondsInDay = 24 * 60 * 60

  var percentage =  100 * secondsSinceMidnight  / totalSecondsInDay
  return percentage
}

function xAxis(percentage, containerWidth){
    return (containerWidth / 100) * percentage
}

function filterData(dataset, day){
    var result = []
    for(var i = 0; i < dataset.length; i++){
        if(dataset[i].day === day){
            result.push(dataset[i])
        }
    }
    return result
}

function drawTimeIndicatorLinesForRow(row, clientWidth ,lineIndicatorStart){

    var lineLength = 40
    var lineX = lineIndicatorStart
    var lineY = row * lineLength
    var timeIndicatorLineSpan = (clientWidth - lineIndicatorStart) / 24
    var strokeColor = row % 2 === 0 ? '#eff1f4' : '#ffffff'

    for(var i = 0; i < 24; i++){
        var d = 'M' + lineX + ','+ lineY +'L' + lineX + ',' + lineLength * (row + 1)

        svgContainer.append('path')
        .attr('d', d)
        .attr('stroke', strokeColor)

        lineX += timeIndicatorLineSpan
    } 
}

function drawRows(rowHeight, clientWidth, lineIndicatorStart){

    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    var rectY = 0
    var textY = 25
    var fillColor
    var strokeColor

    for(var i = 0; i < days.length; i++){

        fillColor = i % 2 === 0 ? '#ffffff' : '#dce0e8'

        var rectOne = svgContainer.append('rect')
            .attr('x', 0)
            .attr('y', rectY)
            .attr('width', clientWidth)
            .attr('height', rowHeight)
            .attr('stroke', '#ffffff')
            .attr('fill', fillColor)

        svgContainer.append('text')
            .attr('x', 15)
            .attr('y', textY)
            .attr('font-size', 15)
            .text(days[i])

        rectY += rowHeight
        textY += rowHeight

        drawTimeIndicatorLinesForRow(i, clientWidth, lineIndicatorStart)
        drawTimeframes(days[i], i)
    }
}

function drawTimeframes(day, i){

    var data = filterData(dataset, day)
    
    var timelineSelection = 'g.' + day + ' rect'
    var labelSelection = 'g.' + day + ' text'

    svgContainer.selectAll(timelineSelection)
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d){
            var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
            var x = xAxis(percentageStart, clientWidth - 100) + 100
            return x
        })
        .attr('y', function(){
            return (i * 40) + 10
        })
        .attr('width', function(d){
            var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
            var percentageEnd = timePassedPercente(d.settings.hourEnd, d.settings.minuteEnd, 0)
            var x = xAxis(percentageStart, clientWidth - 100) + 100
            var width = xAxis(percentageEnd, clientWidth - 100) + 100 - x
            return width
        })
        .attr('height', 20)
        .attr('fill', function(d){
            var temp = d.settings.temp
            if(temp >= 0 && temp < 15) return 'rgba(255, 87, 87, .6)'
            if(temp >= 15 && temp < 30) return 'rgba(255, 87, 87, .7)'
            if(temp >= 30 && temp < 50) return 'rgba(255, 87, 87, .8)'
            if(temp >= 50) return 'rgba(255, 87, 87, 1)'
        })
        
    svgContainer.selectAll(labelSelection)
        .data(data)
        .enter()
        .append('text')
        .attr('x', function(d){
            var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
            var x = xAxis(percentageStart, clientWidth - 100) + 100
            return x + 5
        })
        .attr('y', function(){
            return (i * 40) + 25
        })
        .html(function(d){
            return d.settings.temp + '&#8451;'
        })
        .attr('fill', 'white')
        .attr('font-size', '13px')
}

function drawHours(clientWidth, lineIndicatorStart){
    var hourTextSpan = (clientWidth - lineIndicatorStart) / 24
    var textX = lineIndicatorStart

    for(var i = 0; i < 24; i++){
        svgContainer.append('text')
            .attr('x', textX - 4)
            .attr('y', 298)
            .attr('font-size', 12)
            .text(i)

        textX += hourTextSpan
    }
}

var clientWidth = document.getElementById('container').clientWidth
var rowHeight = 40
var totalHeight = 7 * rowHeight

var svgContainer = d3.select('#container').append('svg')
    .attr('width', clientWidth)
    .attr('height', totalHeight + 50)

svgContainer.append('line')
    .attr('x1', 0)
    .attr('y1', totalHeight + 1)
    .attr('x2', clientWidth)
    .attr('y2', totalHeight + 1)
    .attr('stroke', '#dce0e8')
    
drawRows(40, clientWidth, 100)
drawHours(clientWidth, 100)

