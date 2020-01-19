const keypress = require('keypress')

const { hideCursor, showCursor, tableMenu } = require('../src')


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
    console.log('Selection: ' + selection + ' - ' + options[selection])
    showCursor()
    process.exit(0)
}

let options = []

function main() {
    options = 'zero one two three four five six seven eight nine'.split(' ')
    hideCursor()
    let menuKeyHandler = tableMenu({
        options,
        columns: 3,
        columnWidth: 10,
        //selection: 3,
        done: menuDone
    })
    listenKeyboard(menuKeyHandler)
}

main()