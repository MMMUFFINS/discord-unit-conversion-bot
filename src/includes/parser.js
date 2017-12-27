'use strict';

module.exports = (() => {

    class MessageParser {
        static get quantities() {
            // 0th index will always be the "primary" unit on which all conversions are based
            // all other entries must have a conversion function that returns equivalent in primary unit
            return {
                temperature: {
                    units: [{
                            // symbol order is important here
                            // parser will loop through these and write down matches
                            // 'celsius' is more specific than 'c', so it will record this as the match text
                            // if 'c' were put first, all results would be normalized to the first match (c)
                            recognizedSymbols: [
                                'degrees Celsius',
                                'degrees Centigrade',
                                'degrees C',
                                'deg C',
                                'Celsius',
                                'Centigrade',
                                'ºC',
                                'C'
                            ],
                            printSymbol: 'C'
                        },
                        {
                            name: 'Fahrenheit',
                            recognizedSymbols: [
                                'degrees Fahrenheit',
                                'degrees F',
                                'deg F',
                                'Fahrenheit',
                                'ºF',
                                'F'

                            ],
                            printSymbol: 'F',
                            convertFrom: (fahrenheit) => {
                                return (fahrenheit - 32) * 5.0 / 9.0;
                            },
                            convertTo: (celsius) => {
                                return (celsius * 9.0 / 5.0) + 32;
                            }
                        },
                        {
                            name: 'Kelvin',
                            recognizedSymbols: [
                                'Kelvin'
                            ],
                            printSymbol: 'K',
                            convertFrom: (kelvin) => {
                                return kelvin - 273.15;
                            },
                            convertTo: (celsius) => {
                                return celsius + 273.15;
                            }
                        }
                    ]
                },
                mass: {
                    units: [{
                            recognizedSymbols: [
                                'kilograms',
                                'kilos',
                                'kg'
                            ],
                            printSymbol: 'kg'
                        },
                        {
                            name: 'pounds',
                            recognizedSymbols: [
                                'pounds',
                                'pder',
                                'lbs'
                            ],
                            printSymbol: 'lbs',
                            convertFrom: (pounds) => {
                                return pounds/2.2046226218;
                            },
                            convertTo: (kg) => {
                                return kg * 2.2046226218;
                            }
                        },
                        {
                            name: 'stone',
                            recognizedSymbols: [
                                'stone',
                                'st'
                            ],
                            printSymbol: 'st',
                            convertFrom: (stone) => {
                                return stone * 6.35029318;
                            },
                            convertTo: (kg) => {
                                return kg / 6.35029318;
                            }
                        }
                    ]
                }
                // TODO: mass and length
            }
        }



        constructor() {}

        findQuantities(message) {
            // define base pattern
            // can take a plus/minus sign, optional leading digits, optional decimal, mandatory number(s), optional space, then (case insens.) unit

            let matches = [];
            let matchedIndices = [];

            let indexOfFoundValue = -1;

            for (let quantityName in MessageParser.quantities) {
                if (MessageParser.quantities.hasOwnProperty(quantityName)) {
                    let quantity = MessageParser.quantities[quantityName];

                    for (let unitIdx = 0; unitIdx < quantity.units.length; unitIdx++) {
                        let unit = quantity.units[unitIdx];

                        for (let symbolIdx = 0; symbolIdx < unit.recognizedSymbols.length; symbolIdx++) {
                            let symbol = unit.recognizedSymbols[symbolIdx];

                            let regex = new RegExp('(^| )([+-]?[0-9]*\\.*[0-9]+) *(' + symbol + ')\\b', 'gim')

                            var match;
                            while (match = regex.exec(message.content)) {
                                if (matchedIndices.indexOf(match.index) === -1) {
                                    // add to the list of matches so we don't double-count this
                                    // eg 99 Celsius being counted again as 99 C
                                    matchedIndices.push(match.index);

                                    // get the number value
                                    let numVal = Number(match[2]);

                                    matches.push({
                                        msgIdx: match.index,
                                        unitIdx: unitIdx,
                                        rawText: match[0],
                                        numVal: numVal,
                                        quantity: quantityName
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return matches.sort((a, b) => {
                if (a.msgIdx < b.msgIdx) return -1;
                else return 1;
            });
        }

        convertQuantities(matches) {
            let convertedQuantities = matches.map((match) => {
                let output = match;
                //                 console.log('output')
                //                 console.log(output)
                output.conversions = [];


                let matchedQuantity = MessageParser.quantities[match.quantity];
                //                 console.log('matchedQuantity')
                //                 console.log(matchedQuantity)

                // if base unit, convert to others, skip converting to itself
                for (let i = 0; i < matchedQuantity.units.length; i++) {
                    let unit = matchedQuantity.units[i];
                    let value = match.numVal;


                    if (match.unitIdx === 0) {
                        if (i === 0) continue; // skip first because it's itself

                        output.conversions.push({
                            value: unit.convertTo(value),
                            symbol: unit.printSymbol
                        });
                    } else {
                        if (i === match.unitIdx) continue; // skip itself
                        let inConvertedUnits;
                        let matchedUnit = matchedQuantity.units[match.unitIdx];

                        if (i === 0) {
                            inConvertedUnits = matchedUnit.convertFrom(value); // base unit was already converted to
                        } else {
                            let inPrimaryUnits = matchedUnit.convertFrom(value);
                            inConvertedUnits = unit.convertTo(inPrimaryUnits);
                        }

                        output.conversions.push({
                            value: inConvertedUnits,
                            symbol: unit.printSymbol
                        })
                    }
                }

                return output;
            });

            return convertedQuantities;
        }
    }

    let parser = new MessageParser();
    return parser;
})()