function timePassedPercente(hour, minute, second){
  var secondsSinceMidnight = second + (minute * 60) + (hour * 3600)
  var totalSecondsInDay = 24 * 60 * 60

  var percentage =  100 * secondsSinceMidnight  / totalSecondsInDay
  return percentage
}

function xAxis(percentage, containerWidth){
    return (containerWidth / 100) * percentage
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

function drawRows(numOfRows, rowHeight, clientWidth, lineIndicatorStart){

    var rectY = 0
    var textY = 25
    var fillColor
    var strokeColor

    for(var i = 0; i < numOfRows; i++){

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
            .text('Monday')

        rectY += rowHeight
        textY += rowHeight

        drawTimeIndicatorLinesForRow(i, clientWidth, lineIndicatorStart)
    }
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
    
drawRows(7, 40, clientWidth, 100)
drawHours(clientWidth, 100)

