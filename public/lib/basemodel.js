
function BaseModel (modelX, modelY, parent, armsId = 0) {
    /*

    */
    this.model = new createjs.Container();
    this.heads = new createjs.Container();
    this.headOuterRadius = [];
    this.body = new createjs.Shape();
    this.health = new createjs.Shape();
    this.status = new createjs.Text();

    this.model.x = modelX;
    this.model.y = modelY;
    this.model.scaleX;
    this.model.scaleY;
    this.armsId = armsId;
    this.bodyStrokeColor = '#000';
    this.bodyFillColor = '#000';
    this.r = 0;
    this.name = 'Tank';
    this.p = parent;

    this.setBodyColor('', '', 1);
    this.decorate(this.armsId);
    this.model.addChild(this.heads);
    this.model.addChild(this.body);
//    this.model.addChild(this.health);
//    this.model.addChild(this.status);
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
            alert("How can you reach here ?");
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
            alert("How can you reach here ?"); break;
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