import { generate, putPawns } from "./generate.js"

let urcolor
let dist = 55
let gameData = {}
const startPos = {
    red: 0, blue: 10, green: 20, yellow: 30
}
const colors = ["red", "blue", "green", "yellow"]
let active = []
let startVote = false
let begun = 0
let playerCount = 0
let playerNames = {}
let nick
let gameId
let loader
let turnNow
let turnInterval
let firstRound = true
let currPos = {}
let currTile = {}
let on = true
let size
let speculatingElement
const $ = (id) => {
    return document.getElementById(id)
}

const toggleLight = () => {
    document.getElementById('stylesheet').href = on ? "css/style.css" : "css/newcss.css"
    $("background").style.opacity = on ? "0" : "1"
    on = !on
}

window.onload = (async() => {
    size = window.innerWidth / 30
    $("background").style.width = `${window.innerWidth}px`
    $("btns").style.top = `${window.innerWidth / 4.2}px`
    $("btns").style.left = `${window.innerWidth / 2}px`
    $("form").style.top = `${window.innerWidth / 4.2}px`
    $("form").style.left = `${window.innerWidth / 2}px`

    var style = document.createElement('style');
    style.innerHTML = `
    .field { height: ${size}px; width: ${size}px } 
    .field p { font-size: ${size*.7}px } 
    .rplayer p, .bplayer p, .gplayer p, .yplayer p { font-size: ${size/2}px !important }`;
    document.getElementsByTagName('head')[0].appendChild(style);
    dist = window.innerWidth / 27.7
    window.scrollTo(0, window.innerHeight / 2 - 11 * dist);

    const res = await fetch(`game.php?query=checksession`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "get"
    })
    const str = await res.text()
    $("nick").addEventListener("keypress", enterClicked)
    if (str) {
        $("nick").value = str
        await getColor()
    } else {
        $("enter").addEventListener("click", async() => await getColor())
    }
    generate(dist)
    $("i").addEventListener("click", () => toggleLight())
    $("vote").addEventListener("click", () => vote())
    loader = setInterval(() => load(), 1000);
})

const enterClicked = async(e) => {
    if (e.key === "Enter") {
        await getColor()
    }
}

const vote = () => {
    startVote = !startVote
    if (startVote) {
        fetch(`game.php?query=setvote&color=${urcolor}&vote=add&id=${gameId}`)
        $("vote").classList.add("active")
    } else {
        fetch(`game.php?query=setvote&color=${urcolor}&vote=sub&id=${gameId}`)
        $("vote").classList.remove("active")
    }
}

const getColor = async() => {
    nick = $("nick").value
    console.log(nick);
    const pat = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/
    if(pat.test(nick)){
        $("nick").removeEventListener("keypress", enterClicked)
        const res = await fetch("game.php?query=setlogin&login="+nick, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "get"
        })
        const json = await res.json()
        nick = json["nick"]
        urcolor = json["color"]
        gameId = json["id"]
        const msg = json["msg"]
        msg ? alertShow(`<p>${msg}<p>`) : null
        await new Promise(res => setTimeout(res, 2000));
        $("form").style.top = "-200px"
        $("background").style.opacity = "1"
        $("game").style.opacity = "1"
        $("btns").style.opacity = "1"
        $("room_id").innerHTML += gameId
    } else {
        alert("only letters and digits")
    }
}

const alertShow = (msg) => {
    $("form").innerHTML = msg
}

const updatePlayers = () => {
    $("players").innerHTML = ""
    Object.keys(playerNames).forEach(e => {
        const name = playerNames[e]
        let style = ""
        let text = nick === name.substring(0, name.length - 1) ? `${nick} (you)` : name.substring(0, name.length - 1)
        if (name[name.length - 1] == "1") {
            style = "class='"+e+"'"
            if (nick == name.substring(0, name.length - 1)) {
                $("vote").classList.add("active")
                startVote = true
            }
        }
        $("players").innerHTML += `<div id='${name}' ${style}><p>${text}</p></div>`
    });
}

const won = (color) => {
    const message = color === urcolor ? `<h1>YOU WON!!!</h1>` : `<h1><span style="color: ${color}">${color}</span> won!</h1>`
    alertShow(message)
    clearInterval(loader)
    clearInterval(turnInterval)
    $("form").style.top = `${window.innerWidth / 4.2}px`
    $("background").style.opacity = ".1"
    $("game").style.opacity = ".1"
    $("btns").style.opacity = ".1"
    placeMFs()
}

const load = async() => {
    if (gameId) {
        const res = await fetch((begun === 0 ? `game.php?query=getplayers&id=${gameId}` : `game.php?query=getscores&id=${gameId}`), {
            headers: {
                "Content-Type": "application/json"
            },
            method: "get"
        })
        const dataBundle = await res.text()
        const newData = JSON.parse(dataBundle.split("|")[0])
        const oldData = begun === 1 ? gameData : playerNames
        if (newData != oldData) {
            if (begun == 0) {
                playerNames = newData
                playerCount = Object.keys(playerNames).length
                updatePlayers()
            } else {
                if (firstRound) {
                    $("vote").style.display = "none"
                    Object.keys(playerNames).forEach(e => {
                        playerNames[e] = `${playerNames[e].substring(0, playerNames[e].length - 1)}1`
                    })
                    putPawns(playerCount, dist)
                    updatePlayers()
                    firstRound = false
                }
                if (dataBundle.split("|")[1].length >= 3) {
                    won(dataBundle.split("|")[1])
                } else {
                    gameData = newData
                    if (turnNow != colors[gameData["turn"]]) {
                        placeMFs()
                        turn(colors[gameData["turn"]])
                    }
                }
            }
        }
        begun = begun === 0 ? parseInt(dataBundle.split("|")[1]) : 1
    }
}

const placeMFs = async() => {
    Object.keys(gameData).forEach(async e => {
        if (e != "turn" && !(playerCount == 2 && (e.length == 7 || e.length == 6)) && !(playerCount == 3 && e.length == 7)) {
            const color = e.substring(0, e.length - 1)
            if (gameData[e] > 40) {
                place(`${color[0]}${gameData[e]}`, e)
                currTile[e] = null
            } else if (gameData[e] == 0) {
                place(`${color}place${e.substring(e.length-1, e.length)}`, e)
                currTile[e] = null
            } else {
                if (currPos[e] && gameData[e] - currPos[e] >= 0) {
                    let dist = gameData[e] - currPos[e]
                    let pos
                    while (dist != -1) {
                        await new Promise(res => setTimeout(res, 200));
                        pos = startPos[color] + gameData[e] - dist
                        place(`f${pos === 40 ? pos : (pos % 40)}`, e)
                        dist--
                    }
                    currTile[e] = pos === 40 ? pos : (pos % 40)
                } else {
                    let pos = startPos[color] + gameData[e]
                    pos = pos === 40 ? pos : (pos % 40)
                    place(`f${pos}`, e)
                    currTile[e] = pos
                }
                currPos[e] = gameData[e]
            }
        }
    });
}

const place = (id, placed) => {
    $(placed).style.top = $(id).style.top
    $(placed).style.left = $(id).style.left
}

const sendShit = async() => {
    active.forEach(e => {
        deactivate(e)
    });
    active = []
    if ((gameData["turn"] == 1 && playerCount == 2) || (gameData["turn"] == 2 && playerCount == 3)) {
        gameData["turn"] = 0
    } else {
        gameData["turn"] = (gameData["turn"] + 1) % 4
    }
    await fetch(`game.php?query=setmoved&id=${gameId}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "post",
        body: JSON.stringify(gameData)
    })
}

const turn = async(col) => {
    turnNow = col
    clearInterval(turnInterval)
    $("time_left").style.opacity = ".7"
    $(playerNames[col]).appendChild($("time_left"))
    const res = await fetch(`game.php?query=getdate&id=${gameId}`)
    const text = await res.text()
    const date = new Date(text)
    turnInterval = setInterval(async() => {
        const res_curr = await fetch(`game.php?query=getcurr`)
        const text = await res_curr.text()
        const curr = new Date(text)
        const time = 60 - (Math.abs(curr - date) / 1000)
        $("time_left").innerHTML = time
        if (time <= 0) {
            sendShit()
            clearInterval(turnInterval)
        }
    }, 500)
    $("dice").src = `kostki/0.gif`
    $("dice").style.boxShadow = `inset 1px -1px 30px ${col}`
    if (col == urcolor) {
        $("dice").addEventListener("click", throwDice)
        $("dice").style.cursor = "pointer"
        active.push("dice")
    } else {
        active.forEach(e => {
            deactivate(e)
        });
    }
}
const activate = (id) => {
    $(id).addEventListener("click", move)
    $(id).addEventListener("mouseover", speculate)
    $(id).addEventListener("mouseout", stopSpeculate)
    $(id).style.cursor = "pointer"
    $(id).classList.add("movable")
    $(id).style.zIndex = "1000"
    active.push(id)
}

const deactivate = (id) => {
    stopSpeculate()
    $(id).removeEventListener("click", move)
    $(id).removeEventListener("mouseover", speculate)
    $(id).removeEventListener("mouseout", stopSpeculate)
    $(id).style.cursor = "default"
    $(id).classList.remove("movable")
    $(id).style.zIndex = "1"
}

const throwDice = async() => {
    const res = await fetch(`game.php?query=setthrow&id=${gameId}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "get"
    })
    const str = await res.text()

    const msg = new SpeechSynthesisUtterance();
    msg.text = parseInt(str);
    speechSynthesis.speak(msg)

    deactivate("dice")
    $("dice").removeEventListener("click", throwDice)
    $("dice").src = `kostki/${parseInt(str)}.png`
    let activePawn = false
    const temp = [1,2,3,4]
    temp.forEach(e => {
        if ((gameData[`${urcolor}${e}`] != 0 || parseInt(str) == 6 || parseInt(str) == 1) && gameData[`${urcolor}${e}`] <= 40) {
            activate(`${urcolor}${e}`)
            activePawn = true
        }
    });
    if (!activePawn) {
        await new Promise(res => setTimeout(res, 1000));
        sendShit()
    }
}

const move = async(e) => {
    const player = e.currentTarget.id
    const res = await fetch(`game.php?query=getthrown&id=${gameId}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "get"
    })
    const str = await res.text()
    let thrown = parseInt(str)
    if (gameData[player] <= 40) {
        if (gameData[player] == 0) thrown = 1
        if (gameData[player] + thrown > 40) {
            const ids = [1,2,3,4]
            let houses = []
            ids.forEach((e) => {//wolne domy
                if (gameData[`${urcolor}${e}`] > 40) {
                    houses.push(gameData[`${urcolor}${e}`])
                }
            })
            const temp = gameData[player] + thrown > 44 ? 44 : (gameData[player] + thrown)
            for (let i = temp; i >= 40 ; i--) {//znajdz wolny dom
                if (!houses.includes(i)) {
                    gameData[player] = i
                    break
                }
            }
        } else {
            gameData[player] = gameData[player] + thrown > 44 ? 44 : (gameData[player] + thrown)
        }
        if (gameData[`${urcolor}1`] > 40 && gameData[`${urcolor}2`] > 40 && gameData[`${urcolor}3`] > 40 && gameData[`${urcolor}4`] > 40 ) {
            fetch(`game.php?query=setwon&won=${urcolor}&id=${gameId}`)
            console.log("we done");
        }
        let thisPos = startPos[urcolor] + gameData[player]
        thisPos = thisPos === 40 ? thisPos : (thisPos % 40)

        const samePos = Object.keys(currTile).filter((e) => {
            return e.substring(0, e.length - 1) !== urcolor && currTile[e] === thisPos && e != player
        })
        if (samePos != []) {
            samePos.forEach((e) => {
                console.log(e, gameData[e]);
                gameData[e] = 0
            })
        }
    }
    sendShit()
}
const speculate = async(e) => {
    const pawn = e.currentTarget.id
    const currScore = gameData[pawn]
    const res = await fetch(`game.php?query=getthrown&id=${gameId}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "get"
    })
    const str = await res.text()
    const thrown = currScore === 0 ? 1 : parseInt(str)
    const speculation = currScore + thrown + startPos[urcolor]
    stopSpeculate()
    speculatingElement = $(`f${speculation === 40 ? speculation : speculation % 40}`)
    if (speculation - startPos[urcolor] <= 40){
        speculatingElement.style.border = `5px double ${urcolor}`
    }    
}
const stopSpeculate = async() => {
    speculatingElement ? speculatingElement.style.border = `0px double ${urcolor}` : null
}