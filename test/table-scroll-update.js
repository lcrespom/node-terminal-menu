const keypress = require('keypress')
const chalk = require('chalk')

const {
    hideCursor, showCursor, TableMenu   //, computeTableLayout
} = require('../src')


function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

function menuDone(selection) {
    process.stdout.clearScreenDown()
    console.log('Selection: ' + selection + ' - ' + items[selection])
    showCursor()
    process.exit(0)
}

let items = []


function initItems(rows, cols) {
    let result = []
    let i = 1
    for (let row = 1; row <= rows; row++)
        for (let col = 1; col <= cols; col++)
        result.push(`${i++}: row ${row}, col ${col}`)
    return result
}

function main() {
    const ROWS = 40, COLS = 5, COL_WIDTH = 21
    items = initItems(ROWS, COLS)
    items.push('Lorem')
    items.push('Ipsum')
    let descs = ['Desc for item 1', 'Desc for item 2',
        'Line 1 of desc for item 3\nLine 2 of desc\nAnd line 3']
    descs[200] = 'Desc for Lorem'
    //let { columns, columnWidth } = computeTableLayout(items)
    hideCursor()
    let menu = new TableMenu({
        items, descs,
        columns: COLS,
        columnWidth: COL_WIDTH,
        done: menuDone,
        height: 10,
        scrollBarCol: 106,
        colors: {
            item: chalk.bgBlue,
            scrollArea: chalk.bgBlue,
            scrollBar: chalk.yellowBright.bgBlue,
            desc: chalk.white.bgMagenta
        }
    })
    listenKeyboard((ch, key) => {
        if (ch == 'u') {        // Convert items to uppercase
            items = items.map(i => i.toUpperCase())
            menu.update({ items })
        }
        else if (ch == 'd') {   // Delete selected item
            items.splice(menu.selection, 1)
            descs.splice(menu.selection, 1)
            menu.update({ items, descs })
        }
        else menu.keyHandler(ch, key)
    })
}

main()
