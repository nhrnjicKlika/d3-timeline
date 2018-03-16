var dataset = [ 
    {
        day: 'Monday',
        type: 'dhw',
        settings:  { hourStart: 13, minuteStart: 30, hourEnd: 17, minuteEnd: 0, temp: 45 }
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


