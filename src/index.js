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

timeline.create('container' ,dataset)


