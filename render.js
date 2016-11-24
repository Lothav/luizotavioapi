function Render(){
    this.canvas = document.getElementById("myCanvas");
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");
}

Render.prototype = {

    render: function() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.w, this.h);

        // Transform the canvas
        // Note that we need to flip the y axis since Canvas pixel coordinates
        // goes from top to bottom, while physics does the opposite.
        this.ctx.save();
        //ctx.translate(w/2, h/2);  // Translate to the center
        this.ctx.scale(1, -1);   // Zoom in and flip y axis

        // Draw all bodies
        this.ctx.strokeStyle = 'none';

        this.ctx.fillStyle = 'green';
        this.drawPlane.call(this);

        this.ctx.fillStyle = 'red';
        this.drawBox.call(this, this.characterBody);

        // Restore transform
        this.ctx.restore();
    },

    drawBox: function(body) {
        this.ctx.beginPath();
        var x = body.position[0],
            y = body.position[1],
            s = body.shapes[0];
        this.ctx.save();
        this.ctx.translate(x, y);     // Translate to the center of the box
        this.ctx.rotate(body.angle);  // Rotate to the box body frame
        this.ctx.fillRect(-s.width / 2, -s.height / 2, s.width, s.height);
        this.ctx.restore();
    },

    drawPlane: function() {
        var y0 = this.planeBody.position[1],
            x0 = this.planeBody.position[0];
        this.ctx.fillRect(x0, y0, this.w, -64);
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
    }
};

module.exports = Render;