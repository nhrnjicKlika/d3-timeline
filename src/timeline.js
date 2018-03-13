var timeline = (function(){

    var _dataset = []
    var _svgContainer = null
    var _clientWidth = 0
    var _secondsInADay = 24 * 60 * 60
    /*
        Calculates percentage of day based on time params    
    */
    function timePassedPercente(hour, minute, second){
        var secondsSinceMidnight = second + (minute * 60) + (hour * 3600)
        var totalSecondsInDay = 24 * 60 * 60

        var percentage =  100 * secondsSinceMidnight  / totalSecondsInDay
        return percentage
    }

    function xPercentageInParent(x){
        return (x / (_clientWidth - 100)) * 100
    }

    function getTimeByPercentage(percentage){
        var seconds = (_secondsInADay / 100) * percentage
        var hour = Math.floor(seconds / 3600)
        var minutes = (seconds - (hour * 3600)) / 60
        return{
            hour: hour,
            minute: roundNumber(minutes, 10)
        }
    }

    function xAxis(percentage, containerWidth){
        return (containerWidth / 100) * percentage
    }

    function roundNumber(num, acc){
        if( acc < 0 ){
            return Math.round(num*acc)/acc;
        }else{
            return Math.round(num/acc)*acc;
        }
    }
    
    function filterDataForDay(_dataset, day){
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
        var newRect
        var newRectStartX

        for(var i = 0; i < days.length; i++){

            fillColor = i % 2 === 0 ? '#ffffff' : '#dce0e8'

            var rectOne = _svgContainer.append('rect')
                .attr('x', 0)
                .attr('y', rectY)
                .attr('width', _clientWidth)
                .attr('height', rowHeight)
                .attr('stroke', '#ffffff')
                .attr('fill', fillColor)
                .call(d3.drag()
                    .on("start", function(){
                        var y = parseInt(this.getAttribute('y'))
                        var mouseClickX = d3.event.x
                        newRectStartX = mouseClickX
                        newRect = _svgContainer.append('rect')
                                    .attr('x', mouseClickX)
                                    .attr('y', y + 10)
                                    .attr('width', 10)
                                    .attr('height', 20)
                                    .attr('fill', 'red')
                    })
                    .on("drag", function(){
                        if(newRect){
                            var mouseClickX = d3.event.x
                            var rectX = mouseClickX - newRectStartX
                            newRect.attr('width', rectX)
                        }
                    })
                    .on("end", function(){
                        var mouseX = d3.event.x
                        var y = parseInt(this.getAttribute('y'))
                        var percentageXStart = xPercentageInParent(newRectStartX - 100)
                        var percentageXEnd = xPercentageInParent(mouseX - 100)

                        var startTime = getTimeByPercentage(percentageXStart)
                        var endTime = getTimeByPercentage(percentageXEnd)

                        createTooltipHtml(newRect ,newRectStartX, y)                   
                    })
                    
                )

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
        var data = filterDataForDay(_dataset, day)
        
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

    function createTooltipHtml(newRect ,newRectStartX, y){
        var tooltip = _svgContainer.append('foreignObject')
                .attr('x', newRectStartX)
                .attr('y', y + 35)
                .attr('width', 400)
                .attr('height', 200)
        
        var div = tooltip.append('xhtml:div')
                    .append('div')
                    .attr('class', 'tooltip-wrapper')
        
        var start = div.append('div').attr('class','time-start-div')

        startHtml = '<span> Set time: </span> <span class = "input-wrapper"> <span> 12 </span> <span id = "start_hour_plus_id"> + </span> <span id = "start_hour_minus_id"> - </span> </span>'
        startHtml += '<span> : </span> <span class = "input-wrapper"> <span> 12 </span> <span id = "start_hour_plus_id"> + </span> <span id = "start_hour_minus_id"> - </span> </span>'
        
        startHtml += '<span> - </span> <span class = "input-wrapper"> <span> 12 </span> <span id = "start_hour_plus_id"> + </span> <span id = "start_hour_minus_id"> - </span> </span>'
        startHtml += '<span> : </span> <span class = "input-wrapper"> <span> 12 </span> <span id = "start_hour_plus_id"> + </span> <span id = "start_hour_minus_id"> - </span> </span>'

        startHtml += '<span class = "temp_span"> Set temperature: </span> <input />'

        startHtml += '<button id = "cancel_btn_id"> Cancel </button> <button> Save </button>'
        start.html(startHtml)

        var cancelButton = document.getElementById('cancel_btn_id')
        cancelButton.onclick = function(){
            tooltip.remove()
            newRect.remove()
        }
        
    }

    return{
        create: function(elementId ,dataset){
            _dataset = dataset
            _clientWidth = document.getElementById(elementId).clientWidth
            var rowHeight = 40
            var totalHeight = 7 * rowHeight

            if(_svgContainer){
                _svgContainer.remove('svg')
            }

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