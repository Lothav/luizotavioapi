
var change_d = 1;
function Devil(render, player, webScokets){

    this.devRender = render;

    if( !render ){
        p2 = require('p2');
    } else {
        this.render = new Render(this.characterBody, this.planeBody);
    }

    this._webSockets = webScokets;
    this.world = new p2.World();
    this.characterBody = null;
    this.planeBody = null;
    this.buttons = {
        space: false,
        left: false,
        right: false
    };

    this.player = player;

    this.jumpSpeed = 1500;
    this.walkSpeed = 160;
    this.timeStep = 1 / 60;
    this.maxSubSteps = 10;



    this.init();
}

Devil.prototype = {

    init: function() {

        this.world.defaultContactMaterial.friction = 0.5;
        this.world.setGlobalStiffness(1e5);

        // Init materials
        var groundMaterial = new p2.Material(),
            characterMaterial = new p2.Material();

        // Add a character body
        var characterShape = new p2.Box({width: 58*2, height: 64*2});
        this.characterBody = new p2.Body({
            position: [600, -200],
            mass: 1,
            fixedRotation: true
        });
        this.characterBody.addShape(characterShape);
        this.world.addBody(this.characterBody);

        characterShape.material = characterMaterial;
        this.characterBody.damping = 0.5;
        this.characterBody.gravityScale = 350;

        var planeShape = new p2.Plane();
        this.planeBody = new p2.Body({
            position: [0, -536]
        });
        this.planeBody.addShape(planeShape);
        this.world.addBody(this.planeBody);
        planeShape.material = groundMaterial;

        var groundCharacterCM = new p2.ContactMaterial(groundMaterial, characterMaterial, {
            friction: 0.0
        });
        this.world.addContactMaterial(groundCharacterCM);

        this.animate();

    },
    animate: function(t) {
        if(this.devRender) {
            requestAnimationFrame(this.animate.bind(this));
        }
        var dt = t !== undefined && this.lastTime !== undefined ? t / 1000 - this.lastTime : 0;




        // Apply button response
        if (this.buttons.right) this.characterBody.velocity[0] = this.walkSpeed;
        else if (this.buttons.left) this.characterBody.velocity[0] = -this.walkSpeed;
        else this.characterBody.velocity[0] = 0;
        if (this.checkIfCanJump()) this.characterBody.velocity[1] = this.jumpSpeed;


        if(this.characterBody.position[0] > 1560) change_d = -1;
        if(this.characterBody.position[0] < 40) change_d = 1;

        if(change_d > 0){
            this.characterBody.velocity[0] = this.walkSpeed;

        }else{
            this.characterBody.velocity[0] = -this.walkSpeed;

        }

        // Move physics bodies forward in time
        this.world.step(this.timeStep, dt, this.maxSubSteps);

        // Render scene


        this.lastTime = t / 1000;
        if(!this.devRender) {
            setTimeout(function(){
                for(var i in this._webSockets){
                    if(this._webSockets[i].readyState == 1){

                        this._webSockets[i].send(JSON.stringify({ devil: {
                            x : this.characterBody.position[0],
                            y : -this.characterBody.position[1]
                        }}));
                    }
                }
                this.animate(new Date());
            }.bind(this),100);
        }else{
            this.render.update(this.characterBody, this.planeBody);
            this.render.render();
        }
    },

    checkIfCanJump: function() {
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;
        for (var i = 0; i < this.world.narrowphase.contactEquations.length; i++) {
            var c = this.world.narrowphase.contactEquations[i];
            if (c.bodyA === this.characterBody || c.bodyB === this.characterBody) {
                var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                if (c.bodyA === this.characterBody) d *= -1;
                if (d > 0.5) result = true;
            }
        }
        return result;
    },
    updateSockets : function(webSockets){
        this._webSockets = webSockets;
    }
};
if(module !== undefined){
    module.exports = Devil;
}
