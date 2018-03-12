var dataset = [
    {
        day: 'Monday',
        type: 'dhw',
        settings: { hourStart: 0, minuteStart: 0, hourEnd: 7, minuteEnd: 45, temp: 60 }
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


