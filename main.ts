/**
* Fonctions de l'écran LCD1602
*/
//% weight=0 color=#794044 icon="\uf108" block="Écran LCD1602 à cristaux liquides"
namespace lcd1602 {
export let LCD_I2C_ADDR = 0x3f
let buf = 0x00
/*
// correction des bits
let BK = 0x08
let RS = 0x00
let E = 0x04
*/
/* test 2
let BK = 0x04 // rétroéclairage sur P2
let RS = 0x01 // RS sur P0
let E = 0x08 // EN sur P3
*/
let BK = 0x08 // rétroéclairage sur P3
let RS = 0x01 // RS sur P0
let E = 0x04 // EN sur P2
function setReg(dat: number): void { pins.i2cWriteNumber(LCD_I2C_ADDR, dat, NumberFormat.UInt8BE, false)
basic.pause(1)
}/*adaptation de la fonction Send
function send(dat: number): void {
let d = dat & 0xF0
d |= BK
d |= RS
setReg(d)
setReg(d | 0x04)
setReg(d)
}
*/ function send(dat: number): void {
let d = dat & 0xF0
d |= BK
d |= RS
setReg(d)
setReg(d | E) // EN actif
setReg(d)
}
function setcmd(cmd: number): void {
RS = 0
send(cmd)
send(cmd << 4)
}
function setdat(dat: number): void {
RS = 1 
send(dat)
send(dat << 4)
}
export enum I2C_ADDR {
//% block="0x27"
addr1 = 0x27,
//% block="0x3f"
addr2 = 0x3f,
//% block="0x20"
addr3 = 0x20,
//% block="0x62"
addr4 = 0x62,
//% block="0x3e"
addr5 = 0x3e
}
export enum on_off {
//% block="on"
on = 1,
//% block="off"
off = 0
}
export enum visible {
//% block="visibled"
visible = 1,
//% block="invisibled"
invisible = 0
}
function setI2CAddress(): void {
setcmd(0x33)
basic.pause(5)
send(0x30)
basic.pause(5)
send(0x20)
basic.pause(5)
setcmd(0x28)
setcmd(0x0C)
setcmd(0x06)
setcmd(0x01)
}
/**
* Initialisation de l'adresse I2C
*/
//% blockId="LCD_setAddress" block="LCD1602 Adresse I2C %myAddr"
//% weight=51 blockExternalInputs=true
export function setAddress(myAddr: I2C_ADDR): void {
LCD_I2C_ADDR = myAddr
setI2CAddress()
}
/**
* Initialisation de l'adresse I2C (numéro)
*/
//% blockId="LCD_setAddress2" block="LCD1602 Adresse I2C %myAddr"
//% poids=50 blockExternalInputs=true
export function setAddress2(myAddr: number): void {
LCD_I2C_ADDR = myAddr
setI2CAddress()
}
// Identification automatique de l'adresse I2C à partir de https://github.com/microbit-makecode-packages/I2CLCD1620_cn/commit/d22eca95d7dae176f40888ce5b88c4605d5ce78c
function AutoAddr() {
let k = true
let addr = 0x20
let d1 = 0, d2 = 0
while (k && (addr < 0x28)) {
pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
pins.i2cWriteNumber(addr, 0,NumberFormat.Int16LE)
d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
if ((d1 == 7) && (d2 == 0)) k = false
else addr += 1
}
if (!k) return addr
addr = 0x38
while (k && (addr < 0x40)) {
pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
if ((d1 == 7) && (d2 == 0)) k = false
else addr += 1
}
if (!k) return addr
else return 0
}
/**
* Initialisation automatique de l'adresse I2C
*/
//% blockId="LCD_setAddress3" block="Auto set LCD1602 I2C address"
//% weight=50
export function setAddress3(): void {
LCD_I2C_ADDR = AutoAddr()
setI2CAddress()
}
/**
* Effacement de l'écran
*/
//% blockId="LCD_clear" block="LCD clear"
//% weight=45
export function clear(): void {
setcmd(0x01)
}
/**
* Activation du rétroéclairage
*/
//% blockId="LCD_backlight" block="set LCD backlight %on"
//% poids=46
export function set_backlight(on: on_off): void {
if (on == 1)
BK = 0x08
else
BK = 0x00
setcmd(0x00)
}
/**
* Définir l'affichage de chaînes
*/
//% blockId="LCD_Show" block="set string %show"
//% poids=47
export function set_LCD_Show(show: visible): void {
if (show == 1)
setcmd(0x0C)
else
setcmd(0x08)
}
/**
 * Teste plusieurs combinaisons de mapping RS/EN/BK
 */
//% blockId="LCD_testMapping" block="Test LCD mappings"
export function testMapping(): void {
    // Liste des combinaisons à tester : [RS, EN, BK]
    let combos: number[][] = [
        [0x00, 0x04, 0x08], // mapping 1
        [0x01, 0x08, 0x04], // mapping 2
        [0x01, 0x04, 0x08], // mapping 3
        [0x00, 0x08, 0x04], // mapping 4
        [0x01, 0x02, 0x08], // mapping 5
    ]

    let ok = false
    for (let i = 0; i < combos.length && !ok; i++) {
        RS = combos[i][0]
        E  = combos[i][1]
        BK = combos[i][2]

        // Essai simple : effacer, allumer backlight, écrire "A"
        setcmd(0x01)
        set_backlight(1)
        basic.pause(50)
        putString("A", 0, 0)

        // On laisse 1s pour observer
        basic.pause(1000)

        // Si tu vois "A", tu peux noter l’indice et sortir
        basic.showNumber(i)
        ok = true // ici tu devrais arrêter manuellement si ça marche
    }
}

function printChar(ch: number, x: number, y: number): void {
if (x >= 0) {
let a = 0x80
if(y==1)
a = 0xC0
if(y==2)
a = 0x80 + 0x14
if(y==3)
a = 0xC0 + 0x14
a += x
setcmd(a)
}
setdat(ch)
} /**
* Afficher la chaîne
*/
//% blockId="LCD_putString" block="LCD afficher la chaîne %s|sur x:%x|y:%y"
//% weight=49 blockExternalInputs=true x.min=0 x.max=15 y.min=0 y.max=1


