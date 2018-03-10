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
    },
    {
        day: 'Monday',
        type: 'Living room',
        settings: { hourStart: 17, minuteStart: 30, hourEnd: 19, minuteEnd: 0, temp: 25 }
    },
    {
        day: 'Monday',
        type: 'Living room',
        settings: { hourStart: 7, minuteStart: 0, hourEnd: 10, minuteEnd: 30, temp: 35 }
    },
    {
        day: 'Tuesday',
        type: 'Room 3',
        settings: { hourStart: 5, minuteStart: 0, hourEnd: 12, minuteEnd: 0, temp: 10 }
    },
    {
        day: 'Sunday',
        type: 'Room 3',
        settings: { hourStart: 4, minuteStart: 0, hourEnd: 7, minuteEnd: 0, temp: 15 }
    }
]

var typeSelect = document.getElementById('type')
var type = typeSelect.options[typeSelect.selectedIndex].value

typeSelect.onchange = function(e){
    type = typeSelect.options[typeSelect.selectedIndex].value
    filteredData = dataset.filter(function(item){
        if(item.type === type){
            return item
        }
    })

    timeline.create('container' ,filteredData)
}

var filteredData = dataset.filter(function(item){
    if(item.type === type){
        return item
    }
})


timeline.create('container' ,filteredData)


