var timeline = (function(){

    var _dataset = []
    var _svgContainer = null
    var _clientWidth = 0

    function timePassedPercente(hour, minute, second){
        var secondsSinceMidnight = second + (minute * 60) + (hour * 3600)
        var totalSecondsInDay = 24 * 60 * 60

        var percentage =  100 * secondsSinceMidnight  / totalSecondsInDay
        return percentage
    }

    function xAxis(percentage, containerWidth){
        return (containerWidth / 100) * percentage
    }

    function filterData(_dataset, day){
        var result = []
        for(var i = 0; i < _dataset.length; i++){
            if(_dataset[i].day === day){
                result.push(_dataset[i])
            }
        }
        return result
    }

    function drawTimeIndicatorLinesForRow(row, _clientWidth ,lineIndicatorStart){
        var lineLength = 40
        var lineX = lineIndicatorStart
        var lineY = row * lineLength
        var timeIndicatorLineSpan = (_clientWidth - lineIndicatorStart) / 24
        var strokeColor = row % 2 === 0 ? '#eff1f4' : '#ffffff'

        for(var i = 0; i < 24; i++){
            var d = 'M' + lineX + ','+ lineY +'L' + lineX + ',' + lineLength * (row + 1)

            _svgContainer.append('path')
            .attr('d', d)
            .attr('stroke', strokeColor)

            lineX += timeIndicatorLineSpan
        } 
    }

    function drawRows(rowHeight, _clientWidth, lineIndicatorStart){
        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        var rectY = 0
        var textY = 25
        var fillColor
        var strokeColor

        for(var i = 0; i < days.length; i++){

            fillColor = i % 2 === 0 ? '#ffffff' : '#dce0e8'

            var rectOne = _svgContainer.append('rect')
                .attr('x', 0)
                .attr('y', rectY)
                .attr('width', _clientWidth)
                .attr('height', rowHeight)
                .attr('stroke', '#ffffff')
                .attr('fill', fillColor)

            _svgContainer.append('text')
                .attr('x', 15)
                .attr('y', textY)
                .attr('font-size', 15)
                .text(days[i])

            rectY += rowHeight
            textY += rowHeight

            drawTimeIndicatorLinesForRow(i, _clientWidth, lineIndicatorStart)
            drawTimeframes(days[i], i)
        }
    }

    function drawTimeframes(day, i){
        var data = filterData(_dataset, day)
        
        var timelineSelection = 'g.' + day + ' rect'
        var labelSelection = 'g.' + day + ' text'

        _svgContainer.selectAll(timelineSelection)
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function(d){
                var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
                var x = xAxis(percentageStart, _clientWidth - 100) + 100
                return x
            })
            .attr('y', function(){
                return (i * 40) + 10
            })
            .attr('width', function(d){
                var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
                var percentageEnd = timePassedPercente(d.settings.hourEnd, d.settings.minuteEnd, 0)
                var x = xAxis(percentageStart, _clientWidth - 100) + 100
                var width = xAxis(percentageEnd, _clientWidth - 100) + 100 - x
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
            
        _svgContainer.selectAll(labelSelection)
            .data(data)
            .enter()
            .append('text')
            .attr('x', function(d){
                var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
                var x = xAxis(percentageStart, _clientWidth - 100) + 100
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

    function drawHours(_clientWidth, lineIndicatorStart){
        var hourTextSpan = (_clientWidth - lineIndicatorStart) / 24
        var textX = lineIndicatorStart

        for(var i = 0; i < 24; i++){
            _svgContainer.append('text')
                .attr('x', textX - 4)
                .attr('y', 298)
                .attr('font-size', 12)
                .text(i)

            textX += hourTextSpan
        }
    }

    return{
        create: function(elementId ,dataset){
            _dataset = dataset
            _clientWidth = document.getElementById(elementId).clientWidth
            var rowHeight = 40
            var totalHeight = 7 * rowHeight

            _svgContainer = d3.select('#' + elementId).append('svg')
                .attr('width', _clientWidth)
                .attr('height', totalHeight + 50)

            _svgContainer.append('line')
                .attr('x1', 0)
                .attr('y1', totalHeight + 1)
                .attr('x2', _clientWidth)
                .attr('y2', totalHeight + 1)
                .attr('stroke', '#dce0e8')
                
            drawRows(40, _clientWidth, 100)
            drawHours(_clientWidth, 100)
        }
    }
})()