class Arrow {
  constructor({ position, velocity, direction, imageSrc, scale }) {
    this.position = position;
    this.velocity = velocity;
    this.image = new Image();
    this.image.src = imageSrc;
    this.width = 26 * scale;
    this.height = 7 * scale;
    this.direction = direction;
    this.hit = false;
    this.damage = 10;
  }

  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.scale(this.direction === "left" ? -1 : 1, 1);
    c.drawImage(
      this.image,
      this.direction === "left" ? -this.width : 0,
      0,
      this.width,
      this.height
    );
    c.restore();
  }

  update() {
    this.position.x += this.velocity.x;
    this.draw();
  }
}
