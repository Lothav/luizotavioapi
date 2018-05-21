function Render(devil_slimes, characterBody, planeBody, devilSlimeBody, platforms){
    //this.canvas = document.getElementById("myCanvas");
    //this.w = this.canvas.width;
    //this.h = this.canvas.height;
    //this.ctx = this.canvas.getContext("2d");

    this.devil_slimes = devil_slimes;
    this.platforms = platforms;

    this.characterBody = characterBody;
    this.planeBody = planeBody;
    this.devilSlimeBody = devilSlimeBody;
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

        this.ctx.fillStyle = 'blue';
        this.devil_slimes.forEach(function(ds){
            this.drawBox.call(this, ds.devilSlimeBody);
        }.bind(this));

        this.drawPlatforms.call(this);

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
    drawPlatforms: function() {
        for(var plat in this.platforms){
            if(this.platforms.hasOwnProperty(plat)){
                var y0 = this.platforms[plat].body.position[1],
                    x0 = this.platforms[plat].body.position[0],
                    width = this.platforms[plat].width,
                    height = this.platforms[plat].height;
                this.ctx.fillRect(x0 - (width/2), y0 + (height/2), width, -height);
            }
        }
    },
    update : function(devil_slimes, characterBody, planeBody, devilSlimeBody, platforms){
        this.planeBody = planeBody;
        this.characterBody = characterBody;
        this.devilSlimeBody = devilSlimeBody;
        this.devil_slimes = devil_slimes;
        this.platforms = platforms;
    }
};
if(module !== undefined){
    module.exports = Render;
}