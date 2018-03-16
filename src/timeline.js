var timeline = (function(){

    var _dataset = []
    var _svgContainer = null
    var _clientWidth = 0
    var _secondsInADay = 24 * 60 * 60
    var dragOn = true
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
                        if(dragOn){ 
                            var y = parseInt(this.getAttribute('y'))
                            var mouseClickX = d3.event.x
                            newRectStartX = mouseClickX
                            newRect = _svgContainer.append('rect')
                                        .attr('x', mouseClickX)
                                        .attr('y', y + 10)
                                        .attr('width', 10)
                                        .attr('height', 20)
                                        .attr('fill', 'rgb(81, 219, 101)')
                        }
                    })
                    .on("drag", function(){
                        if(dragOn){ 
                            if(newRect){
                                var mouseClickX = d3.event.x
                                var rectX = mouseClickX - newRectStartX
                                newRect.attr('width', rectX)
                            }
                        }
                    })
                    .on("end", function(){
                        if(dragOn){ 
                            dragOn = false
                            var mouseX = d3.event.x
                            var y = parseInt(this.getAttribute('y'))
                            var percentageXStart = xPercentageInParent(newRectStartX - 100)
                            var percentageXEnd = xPercentageInParent(mouseX - 100)
                            var startTime = getTimeByPercentage(percentageXStart)
                            var endTime = getTimeByPercentage(percentageXEnd)
                            var dayIndex = Math.floor(y / 40)

                            var timeframe = {
                                day: days[dayIndex],
                                hourStart: startTime.hour,
                                minuteStart: startTime.minute,
                                hourEnd: endTime.hour,
                                minuteEnd: endTime.minute
                            }

                            var options = {
                                newRect,
                                timeline: timeframe,
                                newRectStartX,
                                y
                            }

                            createTooltipHtml(options)
                        }             
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
                return d.xStart
            })
            .attr('y', function(){
                return (i * 40) + 10
            })
            .attr('width', function(d){
                return d.xEnd - d.xStart
            })
            .attr('height', 20)
            .attr('fill', function(d){
                var temp = d.settings.temp
                return getRectColor(temp)
            })
            .on('click', function(d, i){
                var options = {
                    newRect: this,
                    timeline: d.settings,
                    newRectStartX: d.xStart,
                    y: (i * 40) + 10
                }

                createTooltipHtml(options)
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

    function getRectColor(temp){
        if(temp >= 0 && temp < 15) return 'rgba(81, 219, 101, .6)'
        if(temp >= 15 && temp < 30) return 'rgba(81, 219, 101, .7)'
        if(temp >= 30 && temp < 50) return 'rgba(81, 219, 101, .8)'
        if(temp >= 50) return 'rgba(81, 219, 101, 1)'
    }

    function createTooltipHtml(options){

        var { newRect, timeline, newRectStartX, y } = options

        var startHour = timeline.hourStart
        var startMinute = timeline.minuteStart
        var endHour = timeline.hourEnd
        var endMinute = timeline.minuteEnd

        var tooltip = _svgContainer.append('foreignObject')
                .attr('x', newRectStartX)
                .attr('y', y + 35)
                .attr('width', 400)
                .attr('height', 200)
        
        var div = tooltip.append('xhtml:div')
                    .append('div')
                    .attr('class', 'tooltip-wrapper')
        
        var start = div.append('div').attr('class','time-start-div')
        var htmlContent = '<span> Start: </span> <span id = "start_hour_id"> '+create2DigitNumber(startHour)+' </span> : <span id = "start_minute_id"> '+create2DigitNumber(startMinute)+' </span>'
        htmlContent += '<img id = "start_up_id" src = "src/logo/plus.png" /> <img id = "start_down_id" src = "src/logo/minus.png" />'
        htmlContent += '<span class = "end-time-label"> End: </span> <span id = "end_hour_id"> '+create2DigitNumber(endHour)+' </span> : <span id = "end_minute_id"> '+create2DigitNumber(endMinute)+' </span>'
        htmlContent += '<img id = "end_up_id" src = "src/logo/plus.png" /> <img id = "end_down_id" src = "src/logo/minus.png" />'
        htmlContent += '<span class = "temp_id"> Temperature </span> <input id = "temp_input_id" value = "0" />'
        htmlContent += '<div class = "actions-wrapper">'
        htmlContent += '<button id = "cancel_btn_id"> Cancel </button> <button id = "save_btn_id"> Save </button>'
        htmlContent += '</div>'
        
        start.html(htmlContent)

        var startHourElement = document.getElementById('start_hour_id')
        var startMinuteElement = document.getElementById('start_minute_id')
        var endHourElement = document.getElementById('end_hour_id')
        var endMinuteElement = document.getElementById('end_minute_id')
        var temperatureInput = document.getElementById('temp_input_id')

        var startUp = document.getElementById('start_up_id')
        var startDown = document.getElementById('start_down_id')
        var endUp = document.getElementById('end_up_id')
        var endDown = document.getElementById('end_down_id')

        var cancelBtn = document.getElementById('cancel_btn_id')
        var saveBtn = document.getElementById('save_btn_id')

        cancelBtn.onclick = function(){
            dragOn = true
            newRect.remove()
            tooltip.remove()
        }

        saveBtn.onclick = function(){
            dragOn = true
            var result = {
                day: timeline.day,
                startHour: startHour,
                startMinute: startMinute,
                endHour: endHour,
                endMinute: endMinute,
                temperature: parseInt(temperatureInput.value)
            }

            var percentageStart = timePassedPercente(result.startHour, result.startMinute, 0)
            newRectStartX = xAxis(percentageStart, _clientWidth - 100) + 100
            var percentageEnd = timePassedPercente(result.endHour, result.endMinute, 0)
            var newRectEndX = xAxis(percentageEnd, _clientWidth - 100) + 100
            newRect.attr('x', newRectStartX).attr('width', newRectEndX - newRectStartX)
            newRect.attr('fill', getRectColor(result.temperature))
            tooltip.remove()

            var labelY = parseInt(newRect.attr('y'))

            _svgContainer.append('text')
                .attr('x', newRectStartX + 5)
                .attr('y', labelY + 15)
                .attr('fill', 'white')
                .text(result.temperature)
        }
        
        startUp.onclick = function(){
            var nextTime = getNextTime(startHour, startMinute)
            startHour = nextTime.hour
            startMinute = nextTime.minute
            startHourElement.innerText = create2DigitNumber(startHour)
            startMinuteElement.innerText = create2DigitNumber(startMinute)
        }

        startDown.onclick = function(){
            var prevTime = getPrevTime(startHour, startMinute)
            startHour = prevTime.hour
            startMinute = prevTime.minute
            startHourElement.innerText = create2DigitNumber(startHour)
            startMinuteElement.innerText = create2DigitNumber(startMinute)
        }

        endUp.onclick = function(){
            var nextTime = getNextTime(endHour, endMinute)
            endHour = nextTime.hour
            endMinute = nextTime.minute
            endHourElement.innerText = create2DigitNumber(endHour)
            endMinuteElement.innerText = create2DigitNumber(endMinute)
        }

        endDown.onclick = function(){
            var prevTime = getPrevTime(endHour, endMinute)
            endHour = prevTime.hour
            endMinute = prevTime.minute
            endHourElement.innerText = create2DigitNumber(endHour)
            endMinuteElement.innerText = create2DigitNumber(endMinute)
        }
    }

    function create2DigitNumber(number){
        if(number >= 0 && number < 10){
            return '0' + number
        }else{
            return number
        }
    }

    function getNextTime(hour, minute){
        if((minute + 10) >= 60){
            minute = 0

            if((hour + 1) >= 24){
                hour = 0
            }else{
                hour += 1
            }
        }else{
            minute += 10
        }

        return{ hour: hour, minute: minute }
    }

    function getPrevTime(hour, minute){
        if((minute - 10) < 0){
            minute = 50

            if((hour - 1) < 0){
                hour = 23
            }else{
                hour -= 1
            }
        }else{
            minute -= 10
        }

        return{ hour: hour, minute: minute }
    }

    function addCordinatesToDataset(dataset){

        var newDataset = []

        for(var i = 0; i < dataset.length; i++){
            var d = dataset[i]
            var percentageStart = timePassedPercente(d.settings.hourStart, d.settings.minuteStart, 0)
            var xStart = xAxis(percentageStart, _clientWidth - 100) + 100
            var percentageEnd = timePassedPercente(d.settings.hourEnd, d.settings.minuteEnd, 0)
            var xEnd = xAxis(percentageEnd, _clientWidth - 100) + 100
            newDataset = [...newDataset ,{ ...d, xStart, xEnd }]
        }
        return newDataset
    }

    return{
        create: function(elementId ,dataset){
            _clientWidth = document.getElementById(elementId).clientWidth
            _dataset = addCordinatesToDataset(dataset) 
            var rowHeight = 40
            var totalHeight = 7 * rowHeight

            if(_svgContainer){
                _svgContainer.remove('svg')
            }

            _svgContainer = d3.select('#' + elementId).append('svg')
                .attr('width', _clientWidth)
                .attr('height', totalHeight + 150)

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