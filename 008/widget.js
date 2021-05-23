
function BoostMenu(modelX, modelY) {
    /*
        modelX, modelY: 组件左上角坐标
    */
    this.model = new createjs.Container();
    this.entries = []; 
    this.attrLevel = new Array(7).fill(0);
    this.colors = ['#e6af88', '#e666ea', '#9466e9', '#6690ea', '#ea6666', '#93ea66', '#66eae6'];
    this.names = ['Health Regen', 'Max Health', 'Body Damage', 'Bullet Speed', 'Bullet Damage', 'Reload', 'Movement Speed'];
    this.h = 20;
    this.w = 220;
    this.targetX = modelX;

    this.model.x = modelX;
    this.model.y = modelY;
    this.model.scaleX = 1.0;
    this.model.scaleY = 1.0;

    for(let i = 0; i < this.colors.length; i++) {
        let bg = new createjs.Shape();
        let bt = new createjs.Shape();
        let fg = new createjs.Shape();
        let t1 = new createjs.Text(this.names[i], 'bold 12px Ubuntu', '#ffffff');
        let t2 = new createjs.Text('[' + (i + 1) + ']', 'bold 12px Ubuntu', '#ffffff');
        this.entries.push(new createjs.Container());
        this.entries[i].addChild(bg, bt, fg, t1, t2);
        this.model.addChild(this.entries[i]);

        bg.graphics.f('#383838').rr(10, 10 + i * 25, 220, 20, 10);
        bt.graphics.f(this.colors[i]).a(220, 20 + i * 25, 8, 0, Math.PI*2);
        bt.graphics.ss(4).s('#525252').mt(215, 20 + i * 25).lt(225, 20 + i * 25).mt(220, 15 + i * 25).lt(220, 25 + i * 25);
        bt.addEventListener('click', $.proxy(function() { 
            this.boost(i);
        }, this));
        fg.graphics.f(this.colors[i]).rr(12, 12 + i * 25, 18, 16, 8);
        fg.visible = false;
        t1.textAlign = t1.textBaseline = 'center';
        t1.x = 100;
        t1.y = 24 + i * 25;
        t2.textAlign = 'right';
        t2.textBaseline = 'center';
        t2.x = 210;
        t2.y = 24 + i * 25;
    }
}

BoostMenu.prototype.boost = function(idx) {
    let fg = this.entries[idx].getChildAt(2);
    if(this.attrLevel[idx] < 10) {
        this.attrLevel[idx] += 1;
        fg.graphics.clear();
        fg.graphics.f(this.colors[idx]).rr(12, 12 + idx * 25, this.attrLevel[idx] * 18, 16, 8);
    }
    fg.visible = true;
    this.model.stage.update(); // XXX: you must bind this.model to a stage
}

BoostMenu.prototype.slipIn = function() {
    if(this.model.x == this.targetX) return;
    this.model.x = -250;
    createjs.Tween.get(this.model).to({x : this.targetX}, 300);
}

BoostMenu.prototype.slipOut = function() {
    if(this.model.x != this.targetX) return;
    createjs.Tween.get(this.model).to({x : -250}, 500);
}

function MiniMap(modelX, modelY, mapSize, mapImagePath) {
    /*
        modelX, modelY: 组件左上角坐标
               mapSize: 地图画布大小
          mapImagePath: 地图缩略图路径
    */
    this.model = new createjs.Container();
    this.mapView = new createjs.Bitmap(mapImagePath);
    this.mapBorder = new createjs.Shape();
    this.cursor = new createjs.Shape();

    this.scaleX = 172 / mapSize;
    this.scaleY = 172 / mapSize;
    this.model.x = modelX;
    this.model.y = modelY;
    this.model.scaleX = 1.0;
    this.model.scaleY = 1.0;
    this.model.addChild(this.mapBorder, this.mapView, this.cursor);
    
    this.mapView.x = 4;
    this.mapView.y = 4;
    this.mapBorder.graphics.f('#727272').rr(0, 0, 180, 180, 4);
    this.cursor.graphics.f('#9e9e9e').a(0, 0, 4, 0, 2*Math.PI);
    this.cursor.x = 90;
    this.cursor.y = 90;
}

MiniMap.prototype.asyncUpdate = function () {
    // this.model.stage.update();
}

MiniMap.prototype.setCoord = function (nx, ny) {
    this.cursor.x = nx * this.scaleX;
    this.cursor.y = ny * this.scaleY;
}

MiniMap.prototype.animateCoord = function (nx, ny) {
    // stop
    createjs.Tween.get(this.cursor, {override:true}).to({x:4 + nx * this.scaleX, y:4 + ny * this.scaleY}, 500);
}

function InfoBar (modelX, modelY) {
    /*
        modelX, modelY: 组件中心坐标
    */
    this.model = new createjs.Container();
    this.nameText = new createjs.Text('', 'bold 30px Ubuntu', '#ffffff');
    this.scoreBar = new createjs.Container();
    this.scoreText = new createjs.Text('', 'bold 14px Ubuntu', '#ffffff');
    this.scoreShape = new createjs.Shape();
    this.expBar = new createjs.Container();
    this.expText = new createjs.Text('', 'bold 16px Ubuntu', '#ffffff');
    this.expShapeBg = new createjs.Shape();
    this.expShapeFg = new createjs.Shape();
    this.expShapeMask = new createjs.Shape();
    this.level = 1; // number
    this.exp = 0;   // percent
    this.arms = 'Tank'; // string

    this.scoreBar.addChild(this.scoreShape, this.scoreText);
    this.expBar.addChild(this.expShapeBg, this.expShapeFg, this.expText);
    this.model.addChild(this.nameText, this.scoreBar, this.expBar);

    this.model.x = modelX;
    this.model.y = modelY;
    this.nameText.textAlign = 'center';
    this.nameText.textBaseline = 'center';
    this.nameText.y = -20;
    this.scoreText.textAlign = 'center';
    this.scoreText.textBaseline = 'center';
    this.scoreText.y = 5;
    this.expText.textAlign = 'center';
    this.expText.textBaseline = 'center';
    this.expText.y = 30;
    this.scoreShape.graphics.ss(2).s('#3e3e3e').f('#6cf0a3').rr(-140, -9, 280, 18, 9);
    this.expShapeBg.graphics.f('#3e3e3e').rr(-190, 12, 380, 22, 11);
    this.expShapeMask.graphics.rr(-188, 14, 376, 18, 9);
    this.expShapeFg.x = -190;
    this.expShapeFg.graphics.f('#f0d96c').dr(-380, 14, 760, 18);
    this.expShapeFg.mask = this.expShapeMask;
}

InfoBar.prototype.asyncUpdate = function () {
    this.model.stage.update();
}

InfoBar.prototype.setName = function (nstr, apply = false) {
    this.nameText.text = nstr;
    if(apply) this.asyncUpdate();
}

InfoBar.prototype.setScore = function (s, apply = false) {
    this.scoreText.text = 'Score: ' + s;
    if(apply) this.asyncUpdate();
}

InfoBar.prototype.setArms = function (astr, apply = false) {
    this.arms = astr;
    this.expText.text = 'Lvl ' + this.level + ' ' + this.arms;
    if(apply) this.asyncUpdate();
}

InfoBar.prototype.setExp = function (lv, e, apply = false) {
    this.level = lv;
    this.exp = e;
    this.expText.text = 'Lvl ' + this.level + ' ' + this.arms;
    this.expShapeFg.scaleX = this.exp;
    if(apply) this.asyncUpdate();
}

InfoBar.prototype.animateExp = function (lv, e) {
    this.exp = e;
    if(this.level < lv) {
        createjs.Tween.get(this.expShapeFg, {loop:true, override:true}).to({scaleX: 1.0}, 300).
            wait(50).to({scaleX: 0.0}, 100).wait(50).call(
            $.proxy(function () {
                ++this.level;
                this.expText.text = 'Lvl ' + this.level + ' ' + this.arms;
                if(this.level == lv) 
                    createjs.Tween.get(this.expShapeFg, {override:true}).to({scaleX: this.exp}, 500);
            }, this)
        );
    }
    else createjs.Tween.get(this.expShapeFg, {override:true}).to({scaleX: this.exp}, 500);
}

InfoBar.prototype.init = function (nstr, astr, s = 0, lv = 1, e = 0) {
    this.setName(nstr);
    this.setArms(astr);
    this.setScore(s);
    this.setExp(lv, e, true);
}

function UpgradeMenu(modelX, modelY) {
    /*
        modelX, modelY: 组件左上角坐标
        该组件宽度为 220px
    */
    this.model = new createjs.Container();
    this.titleText = new createjs.Text('Upgrades', 'bold 30px Ubuntu', '#ffffff');
    this.slots = new Array(5);
    this.slotNum = 5;
    this.ignoreButton = new createjs.Container();
    this.targetX = modelX;
    this.armsIdList = new Array(5).fill(0);

    this.model.x = modelX;
    this.model.y = modelY;
    this.model.addChild(this.titleText);
    this.titleText.x = 110;
    this.titleText.y = 30;
    this.titleText.textAlign = 'center';
    this.titleText.textBaseline = 'center';
    let frameCols = {
        0 : ['#94faf6', '#80c3c1'],
        1 : ['#b7fa94', '#96cc7b'],
        2 : ['#fa9494', '#cc7b7b'],
        3 : ['#fae894', '#ccbe7b'],
        4 : ['#ffffff', '#000000'],
        5 : ['#b0b0b0', '#919191']
    };
    for(let i = 0; i < 5; i++) {
        this.slots[i] = new createjs.Container();
        this.slots[i].x = (i & 1) ? 115 : 5;
        this.slots[i].y = 60 + (i >> 1) * 110;
        let frame = new createjs.Shape();
        let item = new BaseModel(50, 45, undefined, 16);
        let text = new createjs.Text('Tank', 'bold 16px Ubuntu', '#ffffff');
            // TODO: text.text = item.model.namestr
        frame.graphics.ss(4).s('#616161').lf(frameCols[i], [0.4, 0.6], 0, 2, 0, 96).rr(2, 2, 96, 96, 4);
        item.model.scaleX = item.model.scaleY = 0.5;
        createjs.Ticker.addEventListener('tick', function() {
            item.model.rotation += 1;
        });
        text.x = 50, text.y = 80;
        text.textAlign = 'center';
        this.slots[i].addChild(frame, item.model, text);
        this.slots[i].addEventListener('click', $.proxy(function() {
            this.upgradeTo(this.armsIdList[i]);
            this.slipOut();
        }, this));
        this.model.addChild(this.slots[i]);
    }
    this.slots[4].visible = false; // TODO: 5th slot
    let buttonShape = new createjs.Shape();
    let buttonText = new createjs.Text('Ignore', 'bold 16px Ubuntu', '#ffffff');
    buttonShape.x = 65;
    buttonShape.y = 280;
    buttonShape.graphics.ss(4).s('#616161').lf(frameCols[5], [0.3, 0.7], 0, 2, 0, 36).rr(2, 2, 86, 36, 4);
    buttonText.x = 110, buttonText.y = 305;
    buttonText.textAlign = buttonText.textBaseline = 'center';
    this.ignoreButton.addChild(buttonShape, buttonText);
    this.ignoreButton.addEventListener('click', $.proxy(function() { 
        this.slipOut();
    }, this));
    this.model.addChild(this.ignoreButton);
}

UpgradeMenu.prototype.setItemOnShow = function(slotId, armsId) {
    let item = new BaseModel(50, 45, undefined, armsId);
    let i = slotId;

    item.model.scaleX = item.model.scaleY = 0.5;
    createjs.Ticker.addEventListener('tick', function() {
        item.model.rotation += 1;
    });
    this.slots[i].removeChildAt(1);
    this.slots[i].addChildAt(item.model, 1);
    this.armsIdList[i] = armsId;
}

UpgradeMenu.prototype.upgradeTo = function(armsId) {
    // TODO: 
    alert(armsId + "::Please Complement UpgradeMenu.prototype.upgradeTo()");
}

UpgradeMenu.prototype.slipIn = function() {
    if(this.model.x == this.targetX) return;
    this.model.x = -250;
    createjs.Tween.get(this.model).to({x : this.targetX}, 300);
}

UpgradeMenu.prototype.slipOut = function() {
    if(this.model.x != this.targetX) return;
    createjs.Tween.get(this.model).to({x : -250}, 500);
}

function Scoreboard(modelX, modelY) {
    /*
        modelX, modelY: 组件左上角坐标
        该组件宽度为 220px
    */
    this.model = new createjs.Container();
    this.titleText = new createjs.Text('Scoreboard', 'bold 30px Ubuntu', '#ffffff');
    this.slots = new Array(10);
    this.slotNum = 10;
    
    this.model.x = modelX;
    this.model.y = modelY;
    this.model.addChild(this.titleText);
    this.titleText.x = 110;
    this.titleText.y = 30;
    this.titleText.textAlign = 'center';
    this.titleText.textBaseline = 'center';

    for(let i = 0; i < 5; i++) {
        this.slots[i] = new createjs.Container();
        // TODO: def of slot[i]
        this.model.addChild(this.slots[i]);
    }
}