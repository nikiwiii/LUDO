let board
let color = "red"
const createField = (coords, id, col) => {
    const x = coords[0] + window.innerWidth / 3.7
    const y = coords[1] + window.innerWidth / 3.7
    if (col == "img") {
        board.innerHTML += `<img src="kostki/0.png" alt="dice" id="${id}" class="field ${col}" style="left: ${x}px;top: ${y}px;">`
    } else if (col) {
        let num = id[id.length - 1]
        const obj = col[1] === "p" ? {"1": "I", "2": "II", "3": "III", "4": "IV"} : {"1": "Ϣ", "2": "Ж", "3": "Ѧ", "4": "Ѡ"}
        num = obj[num]
        //ϢЖѦѠ
        board.innerHTML += `<div id="${id}" class="field ${col}" style="left: ${x}px;top: ${y}px;"><p>${num}</p></div>`
    } else if (color) {
        board.innerHTML += `<div id="f${id}" class="field ${color}" style="left: ${x}px;top: ${y}px;"></div>`
        color = null
    } else {
        board.innerHTML += `<div id="f${id}" class="field" style="left: ${x}px;top: ${y}px"></div>`
    }
}

export const generate = (dist) => {
    board = document.querySelector(".board")
    for(let i = 1; i <= 40; i++){
        if (i <= 5) {
            createField([i * dist, 5 * dist], i, "")
        } else if (i <= 9) {
            createField([5 * dist, 5 * dist - (i % 5) * dist], i, "")
        } else if (i == 10) {
            createField([6 * dist, dist], i, "")
        } else if (i <= 15) {
            color = i === 11 ? "blue" : null
            createField([7 * dist, (i % 10) * dist], i, "")
        } else if (i <= 19) {
            createField([7 * dist + (i % 15) * dist, 5 * dist], i, "")
        } else if (i == 20) {
            createField([11 * dist,6 * dist], i, "")
        } else if (i <= 25) {
            color = i === 21 ? "green" : null
            createField([11 * dist - (i % 21) * dist, 7 * dist], i, "")
        } else if (i <= 29) {
            createField([7 * dist, 7 * dist + (i % 25) * dist], i, "")
        } else if (i == 30) {
            createField([6 * dist, 11 * dist], i, "")
        } else if (i <= 35) {
            color = i === 31 ? "yellow" : null
            createField([5 * dist, 11 * dist - (i % 31) * dist], i, "")
        } else if (i <= 39) {
            createField([5 * dist - (i % 35) * dist, 7 * dist], i, "")
        } else if (i == 40) {
            createField([dist, 6 * dist], i, "")
        }
    }
    for(let i = 1; i <= 4; i++) {
        createField([dist + (i) * dist, 6 * dist], `r${40 + i}`, "red")
        createField([6 * dist, dist + (i) * dist], `b${40 + i}`, "blue")
        createField([11 * dist - (i) * dist, 6 * dist], `g${40 + i}`, "green")
        createField([6 * dist, 11 * dist - (i) * dist], `y${40 + i}`, "yellow")
    }
    createField([dist + 5 * dist, 6 * dist], "dice", "img")
}
export const putPawns = (count, dist) => {
    for(let i = 1; i <= 4; i++) {
        let pos = {x: 0, y: 0}
        switch (i) {
            case 2:
                pos = {x: dist, y: 0}
                break;
            case 3:
                pos = {x: 0, y: dist}
                break;
            case 4:
                pos = {x: dist, y: dist}
                break;
        }
        createField([2 * dist + pos.x, 2 * dist + pos.y], `redplace${i}`, "pplace")
        createField([9 * dist + pos.x, 2 * dist + pos.y], `blueplace${i}`, "pplace")
        count > 2 ? createField([9 * dist + pos.x, 9 * dist + pos.y], `greenplace${i}`, "pplace") : null
        count > 3 ? createField([2 * dist + pos.x, 9 * dist + pos.y], `yellowplace${i}`, "pplace") : null

        createField([2 * dist + pos.x, 2 * dist + pos.y], `red${i}`, "rplayer")
        createField([9 * dist + pos.x, 2 * dist + pos.y], `blue${i}`, "bplayer")
        count > 2 ? createField([9 * dist + pos.x, 9 * dist + pos.y], `green${i}`, "gplayer") : null
        count > 3 ? createField([2 * dist + pos.x, 9 * dist + pos.y], `yellow${i}`, "yplayer") : null
    }
}