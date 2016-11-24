var p2 = require('p2');

function Devil(render, player){

    this.devRender = render;

    if(render){
        var Render = require('./render');
        this.render = new Render();
    }

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
        requestAnimationFrame( this.animate.bind(this) );

        var dt = t !== undefined && this.lastTime !== undefined ? t / 1000 - this.lastTime : 0;




        // Apply button response
        if (this.buttons.right) this.characterBody.velocity[0] = this.walkSpeed;
        else if (this.buttons.left) this.characterBody.velocity[0] = -this.walkSpeed;
        else this.characterBody.velocity[0] = 0;




        // Move physics bodies forward in time
        this.world.step(this.timeStep, dt, this.maxSubSteps);

        // Render scene
        if(this.devRender) {
            this.render();
        }
        this.lastTime = t / 1000;
    }

};

module.exports = Devil;