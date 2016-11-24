function Render(characterBody, planeBody){
    this.canvas = document.getElementById("myCanvas");
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");

    this.characterBody = characterBody;
    this.planeBody = planeBody;
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
    update : function(characterBody, planeBody){
        this.planeBody = planeBody;
        this.characterBody = characterBody;
    }
};
if(module !== undefined){
    module.exports = Render;
}