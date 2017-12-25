'use strict';

module.exports = (() => {

    class MessageParser {
        static get units() {
            // 0th index will always be the "primary" unit on which all conversions are based
            // all other entries must have a conversion function that returns equivalent in primary unit
            return {
                'temperature': [{
                        symbols: [
                            'C',
                            'degrees C',
                            'deg C',
                            'Celsius',
                            'Centigrade'
                        ]
                    },
                    {
                        name: 'Fahrenheit',
                        symbols: [
                            'F',
                            'degrees F',
                            'deg F',
                            'degrees Fahrenheit',
                            'Fahrenheit'
                        ],
                        conversion: (fahrenheit) => {
                            return (fahrenheit - 32) * 5.0/9.0;
                        }
                    }
                ]
            }
        }

        constructor() {}

        findValues(message) {
            // define base pattern
            // can take a plus/minus sign, optional leading digits, optional decimal, mandatory number(s), optional space, then (case insens.) unit
            console.log(message.content);
            
            let matches = [];
            
            let indexOfFoundValue = -1;
            for (let unitIdx = 0; unitIdx < MessageParser.units.temperature.length; unitIdx++) {
                let unit = MessageParser.units.temperature[unitIdx];
                
                for (let symbolIdx = 0; symbolIdx < unit.symbols.length; symbolIdx++) {
                    let symbol = unit.symbols[symbolIdx];
                    console.log(symbol)
                    let regex = new RegExp('([+-]?[0-9]*\\.*[0-9]+) *(' + symbol + ')', 'gi')
                    console.log(regex);
                    console.log('regex.exec');
                    
                    var match;
                    while (match = regex.exec(message.content)) {
                        matches.push({
                            index: match.index,
                            originalValue: match[0]
                        });
                    }
                }
                
                
            }
            
            console.log('finished looping through units')
            console.log(matches);
        }
    }

    let parser = new MessageParser();
    return parser;
})()