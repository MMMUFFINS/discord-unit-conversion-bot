'use strict';

module.exports = (() => {

    class MessageParser {
        static get units() {
            // 0th index will always be the "primary" unit on which all conversions are based
            // all other entries must have a conversion function that returns equivalent in primary unit
            return {
                'temperature': [{
                    // symbol order is important here
                    // parser will loop through these and write down matches
                    // 'celsius' is more specific than 'c', so it will record this as the match text
                    // if 'c' were put first, all results would be normalized to the first match (c)
                        symbols: [
                            'degrees Celsius',
                            'degrees Centigrade',
                            'degrees C',
                            'deg C',
                            'Celsius',
                            'Centigrade',
                            'C'
                        ]
                    },
                    {
                        name: 'Fahrenheit',
                        symbols: [
                            'degrees Fahrenheit',
                            'degrees F',
                            'deg F',
                            'Fahrenheit',
                            'F'
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
            
            let matches = [];
            let matchedIndices = [];
            
            let indexOfFoundValue = -1;
            for (let unitIdx = 0; unitIdx < MessageParser.units.temperature.length; unitIdx++) {
                let unit = MessageParser.units.temperature[unitIdx];
                
                for (let symbolIdx = 0; symbolIdx < unit.symbols.length; symbolIdx++) {
                    let symbol = unit.symbols[symbolIdx];

                    let regex = new RegExp('([+-]?[0-9]*\\.*[0-9]+) *(' + symbol + ')', 'gi')
                    
                    var match;
                    while (match = regex.exec(message.content)) {
                        if (matchedIndices.indexOf(match.index) === -1) {
                            // add to the list of matches so we don't double-count this
                            // eg 99 Celsius being counted again as 99 C
                            matchedIndices.push(match.index);
                            
                            matches.push({
                                index: match.index,
                                originalValue: match[0]
                            });
                        }
                    }
                }
            }
            
            return matches.sort((a,b) => {
                if (a.index < b.index) return -1;
                else return 1;
            });
        }
    }

    let parser = new MessageParser();
    return parser;
})()