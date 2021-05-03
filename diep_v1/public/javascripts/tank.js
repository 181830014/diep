var socket = io();

var canvas = document.getElementById('canvas');

var ctx = canvas.getContext('2d');
var cvsBox = canvas.getBoundingClientRect();

const CANVAS_LEFT = 50;
const CANVAS_BOTTOM = 50;
const CANVAS_RIGHT = canvas.clientWidth - 50;
const CANVAS_TOP = canvas.clientHeight - 50;
const CANVAS_WIDTH = canvas.clientWidth;
const CANVAS_HEIGHT = canvas.clientHeight;

const STAGE_WIDTH = canvas.clientWidth + 80;     // TODO: change
const STAGE_HEIGHT = canvas.clientHeight + 80;

const MAX_PLAYER_NUMBER = 30;
const MAX_TANK_GRADE = 30;
const KEYBOARD_UP = 87;
const KEYBOARD_DOWN = 83;
const KEYBOARD_LEFT = 65;
const KEYBOARD_RIGHT = 68;

var KEYBOARD_CONDITION = 0;   // 0000 UP DOWN LEFT RIGHT
// tools
var tools = {};

tools.deg2Rad = function(deg) {
    return (deg % 360) * (Math.PI / 180);
};

tools.vec2Deg = function () {
    var radianToDegreesFactor = 180 / Math.PI;
    return function (x, y) {
        if (x == 0 && y == 0) {
            return 360;
        }
        rad = Math.atan(y / x);
        var result = rad * radianToDegreesFactor;
        if (x < 0) {
            result += 180;
        }
        if (result < 0) {
            result += 360;
        }
        return result;
    }
}();


var modelList = [];
var tankList = [];
var creepList = [];
var bulletList = [];

var levelUpThreshold = [0, 1000, 2000, 3000, 4000, 5000];

// Hcanvas part
var attrLevel = [0, 0, 0, 0, 0, 0, 0];
function showBoostMenu(marginLeft = 10, marginTop = 520) {
    const menuColor = ['#e6af88', '#e666ea', '#9466e9', '#6690ea', '#ea6666', '#93ea66', '#66eae6'];
    const attrName = ['Health Regen', 'Max Health', 'Body Damage', 'Bullet Speed', 'Bullet Damage', 'Reload', 'Movement Speed'];
    const H = 20;  // Height
    const W = 220; // Width
    let Lm = marginLeft; // Left Margin
    let Tm = marginTop; // Top Margin

    for(let i = 0; i < menuColor.length; i++) {
        $('#Hcanvas').drawRect({
            fillStyle: '#383838',
            x: Lm + W/2, y: Tm + H/2,
            width: W,
            height: H,
            opacity: 0.8,
            cornerRadius: H/2,
            layer: true
        }).drawRect({
            fillStyle: menuColor[i],
            x: Lm + 2, y: Tm + H/2,
            width: 0,
            height: H - 4,
            cornerRadius: H/2 - 2,
            layer: true,
            name: 'boostRect' + i,
            groups: ['boostRects']
        }).drawArc({
            fillStyle: menuColor[i],
            x: Lm + W - H/2, y: Tm + H/2,
            radius: H/2 - 2,
            layer: true,
            click: function(layer) {
                if($(this).getLayer('boostRect' + i).width >= 180)
                    return;
                $(this).setLayer('boostRect' + i, {
                    x: '+=10',
                    width: '+=20'
                }).drawLayers();
                attrLevel[i] += 1;
            }
        }).drawText({
            fillStyle: '#ffffff',
            x: Lm + W/2 - 20, y: Tm + H/2,
            fontSize: 12,
            fontStyle: 'bold',
            fontFamily: 'Ubuntu, sans-serif',
            text: attrName[i],
            align: 'center',
            mask: true,
            layer: true
        }).drawText({
            fillStyle: '#ffffff',
            x: Lm + W - 30, y: Tm + H/2,
            fontSize: 10,
            fontStyle: 'bold',
            fontFamily: 'Ubuntu, sans-serif',
            text: '[' + (i + 1) + ']',
            align: 'right',
            mask: true,
            layer: true
        }).drawLine({
            strokeStyle: '#525252',
            strokeWidth: 4,
            x1: Lm + W - H/2 - 5, y1: Tm + H/2,
            x2: Lm + W - H/2 + 5, y2: Tm + H/2,
            layer: true,
            intangible: true
        }).drawLine({
            strokeStyle: '#525252',
            strokeWidth: 4,
            x1: Lm + W - H/2, y1: Tm + H/2 - 5,
            x2: Lm + W - H/2, y2: Tm + H/2 + 5,
            layer: true,
            intangible: true
        });
        Tm += 25;
    }
};

function drawBottomBar() {
    // experience Bar
    $('#Hcanvas').drawRect({
        layer: true,
        name: 'expBar',
        fillStyle: '#3e3e3e',
        x: (CANVAS_LEFT + CANVAS_RIGHT) / 2,
        y: CANVAS_TOP,
        width: 350,
        height: 20,
        cornerRadius: 10,
        opacity: 0.5,
    }).drawText({
        x: (CANVAS_LEFT + CANVAS_RIGHT) / 2,
        y: CANVAS_TOP,
        layer: true,
        fillStyle: '#ffffff',
        fontSize: 15,
        fontStyle: 'bold',
        fontFamily: 'Ubuntu, sans-serif',
        text: 'level n',
        align: 'center',
        mask: true
    });
    // health Bar
    $('#Hcanvas').drawRect({
        layer: true,
        name: 'healthBar',
        fillStyle: '#3e3e3e',
        x: (CANVAS_LEFT + CANVAS_RIGHT) / 2,
        y: CANVAS_TOP - 25,
        width: 260,
        height: 20,
        cornerRadius: 10,
        opacity: 0.5
    }).drawText({
        x: (CANVAS_LEFT + CANVAS_RIGHT) / 2,
        y: CANVAS_TOP - 25,
        layer: true,
        fillStyle: '#ffffff',
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'Ubuntu, sans-serif',
        text: 'Score: 0',
        align: 'center',
        mask: true
    });
    // tankName Text
    $('canvas').drawText({
        layer: true,
        name: 'tankNameText',
        fillStyle: '#ffffff',
        strokeStyle: '#000',
        strokeWidth: 1,
        fontSize: 30,
        fontStyle: 'bold',
        fontFamily: 'Ubuntu, sans-serif',
        text: 'czy',
        x: (CANVAS_LEFT + CANVAS_RIGHT) / 2,
        y: CANVAS_TOP - 50
    });
}

function updateHcanvas() {      // TODO: update exp Bar
    ratio = maintk.experience / levelUpThreshold[maintk.level];
    // let x = $('#Hcanvas').getLayer('expBar').
}

// Global part
function isNear(obj1, obj2) {
    if(obj1.armsId == obj2.armsId)
        return false;
    let x1 = obj1.model.x, y1 = obj1.model.y;
    let x2 = obj2.model.x, y2 = obj2.model.y;
    return Math.abs(y2 - y1) <= (STAGE_HEIGHT >> 1) &&
        Math.abs(x2 - x1) <= (STAGE_WIDTH >> 1);
}

function isCollided(obj1, obj2) {  // 判断两物块是否碰撞
    if(obj1.armsId == obj2.armsId)
        return false;
    if(obj1.type == 1 && obj2.type == 1)
        return false;
    let dx = obj1.model.x - obj2.model.x;
    let dy = obj1.model.y - obj2.model.y;
    let dis = dx * dx + dy * dy;
    let sumr = obj1.r * obj1.model.scaleX + obj2.r * obj2.model.scaleX;
    return dis <= sumr * sumr;
}

function checkCollision(obj1, obj2) { // 碰撞后修改参数
    res = isCollided(obj1, obj2);
    if(res == false)
        return false;

    obj1.healthDrop(obj2.bodyDamage);
    obj2.healthDrop(obj1.bodyDamage);
    if(obj2.healthPoint <= 0)
    {
        if(obj1.type == 0)       // tank
            obj1.experienceUp(obj2.bonus);
        else if(obj1.type == 1)  // bullet
            obj1.belong.experienceUp(obj2.bonus);
    }
    if(obj1.healthPoint <= 0)
    {
        if(obj2.type == 0)       // tank
            obj2.experienceUp(obj1.bonus);
        else if(obj2.type == 1)  // bullet
            obj2.belong.experienceUp(obj1.bonus);
    }

    // TODO: 碰撞动画 & 其他参数修改
    // let destX = obj1.model.x - obj1.xMoveSpeed;
    // let destY = obj1.model.y - obj1.yMoveSpeed;
    // obj1.ban = 1;       // 禁止使用键盘移动
    // createjs.Tween.get(obj1.model).to({x: destX, y: destY}, 20).call(handleComplete1);
    // function handleComplete1() {obj1.ban = 0;}

    // destX = obj2.model.x - obj2.xMoveSpeed;
    // destY = obj2.model.y - obj2.yMoveSpeed;
    // createjs.Tween.get(obj2.model).to({x: destX, y: destY}, 20);
    // obj2.ban = 1;
    // createjs.Tween.get(obj1.model).to({x: destX, y: destY}, 20).call(handleComplete2);
    // function handleComplete2() {obj2.ban = 0;}

    return true;
}


// BaseModel part
function BaseModel (modelX, modelY, armsId = 0) {
    this.model = new createjs.Container();
    this.heads = new createjs.Container();
    this.headOuterRadius = [];
    this.body = new createjs.Shape();
    this.health = new createjs.Shape();
    this.status = new createjs.Text();

    this.type = 0;
    this.model.x = modelX;
    this.model.y = modelY;
    this.model.scaleX = 0.8;
    this.model.scaleY = 0.8;
    this.armsId = armsId;
    this.bodyStrokeColor = '#000';
    this.bodyFillColor = '#000';
    this.r = 0;
    this.name = 'Tank';

    this.ban = 0;

    this.setBodyColor('', '', 1);
    this.decorate(this.armsId);
    this.model.addChild(this.heads);
    this.model.addChild(this.body);
    this.model.addChild(this.health);
    this.model.addChild(this.status);
}

BaseModel.prototype.setBodyColor = function (strokeColor, fillColor, builtInColorStyle = 0) {
    switch(builtInColorStyle) {
        case 1: this.bodyStrokeColor = '#1f90ae', this.bodyFillColor = '#00b2e1'; break;
        case 2: this.bodyStrokeColor = '#bfae4e', this.bodyFillColor = '#ffe869'; break;
        case 3: this.bodyStrokeColor = '#c28081', this.bodyFillColor = '#fc7677'; break;
        case 4: this.bodyStrokeColor = '#5869bd', this.bodyFillColor = '#768dfc'; break;
        case 5: this.bodyStrokeColor = '#b43a3f', this.bodyFillColor = '#f14e54'; break;
        default: this.bodyStrokeColor = strokeColor, this.bodyFillColor = fillColor;
    }
}

BaseModel.prototype.decorate = function (armsId) {
    this.headDecorate(armsId >> 4);
    this.bodyDecorate(armsId & 3);
    if(((armsId >> 2) & 3) != 1) {
        // 不是子弹，画血条
        this.health.graphics.clear().f('#555555').rr(-30, this.r  + 10, 60, 8, 4);
        this.health.graphics.f('#85e37d').rr(-28, this.r  + 12, 56, 4, 2);
    }
    if(((armsId >> 2) & 3) == 0) {
        // 是坦克，画状态 [未启用]
        this.status.text = this.name;
        this.status.font = 'bold 20px Ubuntu';
        this.status.color = '#000000';
        this.status.x = 0;
        this.status.y = -this.r - 30;
        this.status.textAlign = 'center';
        this.status.visible = false;
    }
    this.setHealthCond(1.0);
    this.armsId = armsId;
}

BaseModel.prototype.headDecorate = function (headId) {
    headShapes = [];
    this.headOuterRadius.length = 0;

    switch(headId) {
        case 0: // 无炮管
            break;
        case 1: // 矩形炮管 * 1
            headShapes.push(new createjs.Shape());
            this.headOuterRadius.push(60);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            break;
        case 2: // 矩形长炮管 * 1
            headShapes.push(new createjs.Shape());
            this.headOuterRadius.push(70);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 70, 30);
            break;
        case 3: // 矩形炮管 * 1 + 矩形短炮管 * 1
            headShapes.push(new createjs.Shape(), new createjs.Shape());
            this.headOuterRadius.push(60, 45);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            headShapes[1].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 45, 30);
            headShapes[1].rotation = 180;
            break;
        case 4: // 梯形炮管 * 1
            headShapes.push(new createjs.Shape());
            this.headOuterRadius.push(60);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999');
            headShapes[0].graphics.mt(-30, 0).lt(60, -20).mt(58, -20).lt(58, 20).mt(60, 20).lt(-30, 0);
            break;
        case 5: // 双发炮管 * 1
            headShapes.push(new createjs.Shape(), new createjs.Shape());
            this.headOuterRadius.push(60, 60);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -20, 60, 17);
            headShapes[1].graphics.ss(4).s('#727272').f('#999999').dr(0, 3, 60, 17);
            break;
        case 6: // 三发炮管 * 1
            headShapes.push(new createjs.Shape(), new createjs.Shape(), new createjs.Shape());
            this.headOuterRadius.push(50, 50, 50);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -10, 50, 20);
            headShapes[1].graphics.ss(4).s('#727272').f('#999999').dr(0, -10, 50, 20);
            headShapes[1].rotation = 315;
            headShapes[2].graphics.ss(4).s('#727272').f('#999999').dr(0, -10, 50, 20);
            headShapes[2].rotation = 45;
            break;
        case 7: // 矩形炮管 * 4
            headShapes.push(new createjs.Shape(), new createjs.Shape(), new createjs.Shape(), new createjs.Shape());
            this.headOuterRadius.push(60, 60, 60, 60);
            headShapes[0].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            headShapes[1].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            headShapes[1].rotation = 90;
            headShapes[2].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            headShapes[2].rotation = 180;
            headShapes[3].graphics.ss(4).s('#727272').f('#999999').dr(0, -15, 60, 30);
            headShapes[3].rotation = 270;
            break;
        default:
            alert('How can you reach here ?');
            break;
    }
    this.heads.removeAllChildren();
    for(let i = 0; i < headShapes.length; i++)
        this.heads.addChild(headShapes[i]);
    this.heads.scaleX = this.heads.scaleY = 1;
}

BaseModel.prototype.bodyDecorate = function (bodyId) {
    this.body.graphics.clear().ss(4).s(this.bodyStrokeColor).f(this.bodyFillColor);
    switch(bodyId) {
        case 0: // 圆形底座
            this.body.graphics.dc(0, 0, 30);
            this.r = 30; break;
        case 1: // 方形底座
            this.body.graphics.dr(-20, -20, 40, 40);
            this.r = 20; break;
        case 2: // 正三角形
            this.body.graphics.dp(0, 0, 20, 3, 0, 0);
            this.r = 10; break;
        case 3: // 正五边形
            this.body.graphics.dp(0, 0, 40, 5, 0, 0);
            this.r = 32.4; break;
        default:
            alert('How can you reach here ?'); break;
    }
    this.body.scaleX = this.body.scaleY = 1;
}

BaseModel.prototype.setHealthCond = function (ratio) {
    if(ratio < 0.0 || ratio > 1.0) return;
    if(((this.armsId >> 2) & 3) != 1) {
        // 不是子弹，画血条
        this.health.graphics.clear().f('#555555').rr(-30, this.r  + 10, 60, 8, 4);
        this.health.graphics.f('#85e37d').rr(-28, this.r  + 12, 56 * ratio, 4, 2);
    }
}

// GeneralModel part
function GeneralModel (modelX, modelY, armsId) {
    BaseModel.call(this, modelX, modelY, armsId);
    this.type = 0;
    this.bonus = 800;
    this.healthPoint = 100;
    this.maxHealthPoint = 100;
    this.xMoveSpeed = 0;
    this.yMoveSpeed = 0;
    this.maxMoveSpeed = 5;
    this.bodyDamage = 30;

    this.nearTank = [];
    this.nearCreep = [];
    this.nearBullet = [];
}

GeneralModel.prototype = new BaseModel();
GeneralModel.prototype.constructor = GeneralModel;

GeneralModel.prototype.healthDrop = function(damage) {
    this.healthPoint -= damage;
    if(this.healthPoint < 0)
        this.healthPoint = 0;
    this.setHealthCond(this.healthPoint / this.maxHealthPoint);
    if(this.healthPoint <= 0) {
        createjs.Tween.removeTweens(this.model);
        stage.removeChild(this.model);
        for(let i = 0; i < tankList.length; i++)
            if(this == tankList[i]) {
                tankList.splice(i, 1);
                return;
            }
        for(let i = 0; i < creepList.length; i++)
            if(this == creepList[i]) {
                creepList.splice(i, 1);
                return;
            }
        for(let i = 0; i < bulletList.length; i++)
            if(this == bulletList[i]) {
                bulletList.splice(i, 1);
                return;
            }
    }
}

GeneralModel.prototype.getNearTank = function() {
    this.nearTank = [];
    for(let i = 0; i < tankList.length; i++)
        if(isNear(this, tankList[i]))
            this.nearTank.push(tankList[i].armsId);
}

GeneralModel.prototype.getNearCreep = function() {
    this.nearCreep = [];
    for(let i = 0; i < creepList.length; i++)
        if(isNear(this, creepList[i]))
            this.nearCreep.push(creepList[i].armsId);
}

GeneralModel.prototype.getNearBullet = function() {
    this.nearBullet = [];
    for(let i = 0; i < bulletList.length; i++)
        if(isNear(this, bulletList[i]))
            this.nearBullet.push(bulletList[i].armsId);
}

GeneralModel.prototype.packageInfo = function() {
    // TODO: package infomation
    return this;
}

// Tank part
function Tank (modelX, modelY, armsId = 0) {
    GeneralModel.call(this, modelX, modelY, armsId);
    this.type = 0;
    this.level = 1;
    this.experience = 0;
    this.reloadRate = 10;
    this.regenerationRate = 10;
}

Tank.prototype = new GeneralModel();
Tank.prototype.constructor = Tank;

Tank.prototype.levelUp = function() {
    if(this.level == MAX_TANK_GRADE)
        return 0;
    this.level ++;
    showBoostMenu();    // 显示加点条
    return 0;
}

Tank.prototype.experienceUp = function(exp) {
    this.experience += exp;
    updateHcanvas();
    if(this.experience >= levelUpThreshold[this.level]) {
        this.experience -= levelUpThreshold[this.level];
        this.levelUp();
    }
}

Tank.prototype.tankMove = function() {

    if(this.healthPoint <= 0 || this.ban == 1)
        return;
    this.xMoveSpeed = 0;
    this.yMoveSpeed = 0;
    if(KEYBOARD_CONDITION & 8) this.yMoveSpeed = -this.maxMoveSpeed;
    if(KEYBOARD_CONDITION & 4) this.yMoveSpeed = this.maxMoveSpeed;
    if(KEYBOARD_CONDITION & 2) this.xMoveSpeed = -this.maxMoveSpeed;
    if(KEYBOARD_CONDITION & 1) this.xMoveSpeed = this.maxMoveSpeed;

    if(this.xMoveSpeed != 0 && this.yMoveSpeed != 0) {
        this.xMoveSpeed *= Math.sqrt(2) / 2;
        this.yMoveSpeed *= Math.sqrt(2) / 2;
    }

    this.model.x += this.xMoveSpeed;
    this.model.y += this.yMoveSpeed;

    socket.emit('move', [this.armsId, this.model.x, this.model.y]);

    for(let i = 0; i < tankList.length; i++) {
        if(checkCollision(this, tankList[i]) == true)
            return;
    }

    for(let i = 0; i < creepList.length; i++) {
        if(checkCollision(this, creepList[i]) == true)
            return;
    }
}

Tank.prototype.fireBullet = function() {
    for(let i = 0; i < this.heads.numChildren; i++) {
        let angle = tools.deg2Rad(this.heads.rotation + this.heads.getChildAt(i).rotation)
        let bulletX = this.headOuterRadius[i] * Math.cos(angle);
        let bulletY = this.headOuterRadius[i] * Math.sin(angle);
        let bullet = new Bullet(this.model.x + bulletX, this.model.y + bulletY, armsId = 4, this);  // 01 00
        bullet.xMoveSpeed = bullet.maxMoveSpeed * Math.cos(angle);
        bullet.yMoveSpeed = bullet.maxMoveSpeed * Math.sin(angle);
        bulletList.push(bullet);
        stage.addChild(bullet.model);
        bullet.bulletMove();
    }
}


// Bullet part
function Bullet (modelX, modelY, armsId = 4, belong) {
    GeneralModel.call(this, modelX, modelY, armsId);
    this.type = 1;
    this.healthPoint = 1;
    this.belong = belong;
    this.model.scaleX = 0.4;
    this.model.scaleY = 0.4;
    this.bonus = 0;
}

Bullet.prototype = new GeneralModel();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.bulletMove = function() {
    let xTime, yTime, This = this;

    if(this.xMoveSpeed > 0) xTime = (CANVAS_RIGHT - this.model.x) / this.xMoveSpeed;
    else if(this.xMoveSpeed < 0) xTime = (CANVAS_LEFT - this.model.x) / this.xMoveSpeed;
    if(this.yMoveSpeed > 0) yTime = (CANVAS_TOP - this.model.y) / this.yMoveSpeed;
    else if(this.yMoveSpeed < 0) yTime = (CANVAS_BOTTOM - this.model.y) / this.yMoveSpeed;
    let time = Math.min(xTime, yTime);

    let destX = this.model.x + this.xMoveSpeed * time;
    let destY = this.model.y + this.yMoveSpeed * time;

    // this.model.x = destX;
    // this.model.y = destY;
    createjs.Tween.get(this.model).to({x: destX, y: destY}, 30 * time).
    call(handleComplete).
    addEventListener('change', handleChange);

    function handleChange(event) {
        for(let i = 0; i < tankList.length; i++) {
            if(checkCollision(This, tankList[i]) == true)
                return;
        }
        for(let i = 0; i < creepList.length; i++) {
            if(checkCollision(This, creepList[i]) == true)
                return;
        }
    }

    function handleComplete() {
        stage.removeChild(This.model);
        for(let i = 0; i < bulletList.length; i++)
            if(This == bulletList[i]) {
                bulletList.splice(i, 1);
                break;
            }
    };
}


// Creep part
function Creep (modelX, modelY, armsId = 0) {
    GeneralModel.call(this, modelX, modelY, armsId);
    this.type = 2;
}

Creep.prototype = new GeneralModel();
Creep.prototype.constructor = Creep;


// KeyBoard Event & Mouse Event
document.onkeydown = function(ev) {
    var kEvent = ev || window.event;
    if(kEvent.keyCode == KEYBOARD_UP)
        KEYBOARD_CONDITION |= 8;
    else if(kEvent.keyCode == KEYBOARD_DOWN)
        KEYBOARD_CONDITION |= 4;
    else if(kEvent.keyCode == KEYBOARD_LEFT)
        KEYBOARD_CONDITION |= 2;
    else if(kEvent.keyCode == KEYBOARD_RIGHT)
        KEYBOARD_CONDITION |= 1;
}

document.onkeyup = function(ev) {
    var kEvent = ev || window.event;
    if(kEvent.keyCode == KEYBOARD_UP)
        KEYBOARD_CONDITION &= 7;
    else if(kEvent.keyCode == KEYBOARD_DOWN)
        KEYBOARD_CONDITION &= 11;
    else if(kEvent.keyCode == KEYBOARD_LEFT)
        KEYBOARD_CONDITION &= 13;
    else if(kEvent.keyCode == KEYBOARD_RIGHT)
        KEYBOARD_CONDITION &= 14;
}

document.onmousemove = function(ev) {
    var mEvent = ev || window.event;
    let x = Math.round(mEvent.clientX - cvsBox.left - stage.x);
    let y = Math.round(mEvent.clientY - cvsBox.top - stage.y);
    maintk.heads.rotation = tools.vec2Deg(x - maintk.model.x, y - maintk.model.y)
    stage.update();
}

document.onmousedown = function(ev) {
    maintk.fireBullet();
}


// Handle Server Message
function serverMessage(data) {
    if (serverEvent[data[0]])
        serverEvent[data[0]](data);
}

var maintk;

var serverEvent = {
    control: function(data) {
        for(let i = 0; i < tankList.length; i++)
            if(tankList[i].armsId == data[1])
                maintk = tankList[i];
    },
    move: function(data) {
        for(let i = 0; i < tankList.length; i++)
            if(tankList[i].armsId == data[1]) {
                tankList[i].model.x = data[2];
                tankList[i].model.y = data[3];
            }
    },
    turn: function(data) {
        for(let i = 0; i < tankList.length; i++)
            if(tankList[i].armsId == data[1])
                tankList[i].heads.rotation = data[2];
    },
    addTank: function(data) {
        tankList.push(data[1]);
        stage.addChild(data[1].model);
    }
};

// 实例
function main() {
    drawBottomBar();
    var stage = new createjs.Stage('canvas');
    createjs.Ticker.framerate = 30;
    createjs.Ticker.addEventListener('tick', handleTick);

    socket.on('addTank', serverMessage);
    socket.on('control', serverMessage);
    socket.on('move', serverMessage);
}

function handleTick() {
    stage.x = (canvas.clientWidth >> 1) - maintk.model.x;
    stage.y = (canvas.clientHeight >> 1) - maintk.model.y;
    if(maintk)
        maintk.tankMove();
    stage.update();
}

main();
// function updateNear() {
//     maintk.getNearTank();
//     console.log(maintk.nearTank);
// }
//
// setInterval(updateNear, 1000);