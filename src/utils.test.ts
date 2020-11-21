import {nextDropdownOptionsFromRace} from './utils'
import {ANY} from './constants'
import { RaceKeys } from './types'

describe('nextDropdownOptionsFromRace', () => {
    const emptyMenu = new Map()

    const menu = new Map([
        ['a', new Map([
            ['ag', new Map([
                ['agr', ['agrarian', 'aggressive']]
            ])],
            ['ap', new Map([
                ['app', ['apple', 'application']]
            ])]
        ])],
        ['b', new Map([
            ['ba', new Map([
                ['ban', ['banana', 'bandana']]
            ])]
        ])]
    ])

    describe('incomplete states', () => {
        it ('returns top level keys if race has no items', () => {
            const query = { race: [], complete: false }
            expect(nextDropdownOptionsFromRace(menu, query)).toEqual(['a', 'b'])
        })

        it('returns empty array if race is complete', () => {
            const query = { race: [{ key: RaceKeys.event, value: 'a'}], complete: true }
            expect(nextDropdownOptionsFromRace(menu, query)).toEqual([])
        })

        it('returns empty array if menu is empty', () => {
            const query = { race: [{ key: RaceKeys.event, value: 'a'}], complete: false }
            expect(nextDropdownOptionsFromRace(emptyMenu, query)).toEqual([])
        })
    })

    describe('complete states', () => {
        it('returns menu keys for the next level', () => {
            const query = { race: [{ key: RaceKeys.event, value: 'a'}], complete: false }
            expect(nextDropdownOptionsFromRace(menu, query)).toEqual(['ag', 'ap'])
        })

        it('returns menu values for the bottom level', () => {
            const query = { complete: false, race: [
                { key: RaceKeys.event, value: 'a' },
                { key: RaceKeys.year, value: 'ap' },
                { key: RaceKeys.district_key, value: 'app' },
            ]}
            expect(nextDropdownOptionsFromRace(menu, query)).toEqual(['apple', 'application'])
        })
    })
})
