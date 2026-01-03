/**
* Fonctions de l'écran LCD1602
*/
//% weight=100 color=#794044 icon="\uf108" block="Écran LCD1602"
namespace lcd1602 {
    export let LCD_I2C_ADDR = 0x3f
    let BK = 0x08 
    let RS = 0x01 
    let E = 0x04 

    function setReg(dat: number): void {
        pins.i2cWriteNumber(LCD_I2C_ADDR, dat, NumberFormat.UInt8BE, false)
        basic.pause(1)
    }

    function send(dat: number): void {
        let d = (dat & 0xF0) | BK | RS
        setReg(d)
        setReg(d | E) 
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
        //% block="visible"
        visible = 1,
        //% block="invisible"
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
        basic.pause(2)
    }

    //% blockId="LCD_setAddress" block="LCD1602 Adresse I2C %myAddr"
    //% weight=51
    export function setAddress(myAddr: I2C_ADDR): void {
        LCD_I2C_ADDR = myAddr
        setI2CAddress()
    }

    //% blockId="LCD_setAddress2" block="LCD1602 Adresse I2C num %myAddr"
    //% weight=50
    export function setAddress2(myAddr: number): void {
        LCD_I2C_ADDR = myAddr
        setI2CAddress()
    }

    function AutoAddr(): number {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
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
        return !k ? addr : 0x3f
    }

    //% blockId="LCD_setAddress3" block="Auto set LCD1602 I2C address"
    //% weight=49
    export function setAddress3(): void {
        LCD_I2C_ADDR = AutoAddr()
        setI2CAddress()
    }

    //% blockId="LCD_clear" block="Effacer l'écran"
    //% weight=45
    export function clear(): void {
        setcmd(0x01)
        basic.pause(2)
    }

    //% blockId="LCD_backlight" block="Rétroéclairage %on"
    //% weight=46
    export function set_backlight(on: on_off): void {
        BK = (on == 1) ? 0x08 : 0x00
        setcmd(0x00)
    }

    //% blockId="LCD_Show" block="Affichage visible %show"
    //% weight=47
    export function set_LCD_Show(show: visible): void {
        setcmd(show == 1 ? 0x0C : 0x08)
    }

    //% blockId="LCD_putString" block="LCD afficher %s|x:%x|y:%y"
    //% weight=48 x.min=0 x.max=15 y.min=0 y.max=3
    export function putString(s: string, x: number, y: number): void {
        let a = 0x80
        if (y == 1) a = 0xC0
        if (y == 2) a = 0x80 + 0x14
        if (y == 3) a = 0xC0 + 0x14
        setcmd(a + x)
        for (let i = 0; i < s.length; i++) {
            setdat(s.charCodeAt(i))
        }
    }

    //% blockId="LCD_testMapping" block="Tester les mappings"
    //% weight=10
    export function testMapping(): void {
        let combos = [[0x00, 0x04, 0x08], [0x01, 0x08, 0x04], [0x01, 0x04, 0x08], [0x00, 0x08, 0x04]]
        for (let i = 0; i < combos.length; i++) {
            RS = combos[i][0]; E = combos[i][1]; BK = combos[i][2]
            setcmd(0x01)
            putString("Test " + i, 0, 0)
            basic.showNumber(i)
            basic.pause(2000)
        }
    }
}
