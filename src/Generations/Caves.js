const perlin = require('perlin-noise');

const Generation = require('../Generation');

class GenerationCaves extends Generation {
    constructor() {
        super("Caves", "marioood");
    }

    generate() {
		//super secret hacker setting that enables custom ore
		const useCustomOre = false;
		
		const area = this.x * this.z;
		const volume = this.x * this.y * this.z
		
        const lerp = (a, b, t) => {
            return a + (b - a) * t;
        };
		
		const sphere = (block, x0, y0, z0, r) => {
			//rounding stuff is so the full thing doesnt generate. why? looks a bit better for caves
			let rr = Math.round(r);
			for(let y = 0; y < rr; y++) {
				for(let z = 0; z < rr; z++) {
					for(let x = 0; x < rr; x++) {
						let xSq = (x + x0) - x0;
						let ySq = (y + y0) - y0;
						let zSq = (z + z0) - z0;
						if(Math.sqrt(xSq * xSq + ySq * ySq + zSq * zSq) < r) {
							//faster (i think?) to only do one corner of the sphere and just copy that over than to calculate the distance for all corners
							this.setBlock(block, x0 + x, y0 + y, z0 + z);
							this.setBlock(block, x0 - x, y0 + y, z0 + z);
							this.setBlock(block, x0 + x, y0 - y, z0 + z);
							this.setBlock(block, x0 - x, y0 - y, z0 + z);
							this.setBlock(block, x0 + x, y0 + y, z0 - z);
							this.setBlock(block, x0 - x, y0 + y, z0 - z);
							this.setBlock(block, x0 + x, y0 - y, z0 - z);
							this.setBlock(block, x0 - x, y0 - y, z0 - z);
						}
					}
				}
			}
		};
		
		const sphereOverwrite = (block, x0, y0, z0, r) => {
			for(let y = 0; y < r; y++) {
				for(let z = 0; z < r; z++) {
					for(let x = 0; x < r; x++) {
						let xSq = (x + x0) - x0;
						let ySq = (y + y0) - y0;
						let zSq = (z + z0) - z0;
						if(Math.sqrt(xSq * xSq + ySq * ySq + zSq * zSq) < r) {
							if(this.getBlock(x0 + x, y0 + y, z0 + z) == 1) {
								this.setBlock(block, x0 + x, y0 + y, z0 + z);
							}
							if(this.getBlock(x0 - x, y0 + y, z0 + z) == 1) {
								this.setBlock(block, x0 - x, y0 + y, z0 + z);
							}
							if(this.getBlock(x0 + x, y0 - y, z0 + z) == 1) {
								this.setBlock(block, x0 + x, y0 - y, z0 + z);
							}
							if(this.getBlock(x0 - x, y0 - y, z0 + z) == 1) {
								this.setBlock(block, x0 - x, y0 - y, z0 + z);
							}
							if(this.getBlock(x0 + x, y0 + y, z0 - z) == 1) {
								this.setBlock(block, x0 + x, y0 + y, z0 - z);
							}
							if(this.getBlock(x0 - x, y0 + y, z0 - z) == 1) {
								this.setBlock(block, x0 - x, y0 + y, z0 - z);
							}
							if(this.getBlock(x0 + x, y0 - y, z0 - z) == 1) {
								this.setBlock(block, x0 + x, y0 - y, z0 - z);
							}
							if(this.getBlock(x0 - x, y0 - y, z0 - z) == 1) {
								this.setBlock(block, x0 - x, y0 - y, z0 - z);
							}
						}
					}
				}
			}
		};
		const generate3dNoise = (octaves, scale) => {
			//generates several layers of 2d noise and interpolates them to create 3d noise
			//returns 1d array
			//slowest thing i think
			const yScaled = Math.floor(this.y / scale);
			let base = new Array(yScaled);
			//creating a 2d array with 1d images (not confusing) is ~50ms faster than concatenating a bunch of 1d images into a 1d array
			for(let y = 0; y <= yScaled; y++) {
				base[y] = perlin.generatePerlinNoise(this.x, this.z, {octaveCount: octaves});
			}
			
			let noise3d = new Array(this.x * this.z * this.y);
			//interpolation
			for(let y = 0; y < this.y; y++) {
				for(let z = 0; z < this.z; z++) {
					for(let x = 0; x < this.x; x++) {
						//BUG! - at the bottom its stretchde weirdly
						noise3d[x + z * this.x + y * area] = lerp(
							base[Math.max(Math.floor(y / scale - 0.5), 0)][x + z * this.x],
							base[Math.min(Math.ceil(y / scale  - 0.5), yScaled)][x + z * this.x],
							((y + scale / 2) % scale) / scale
						);
					}
				}
			}
			return noise3d;
		};
		
		//const caveS3d = generate3dNoise(4, 6);
		const caveL3d = generate3dNoise(6, 12);
		const hills = perlin.generatePerlinNoise(this.x, this.z, {octaveCount: 4});
		const hills2 = perlin.generatePerlinNoise(this.x, this.z, {octaveCount: 6});
		const flat = perlin.generatePerlinNoise(this.x, this.z, {octaveCount: 6});
		
        const calculateHeight = (x, z) => {
			let hillsB = hills[x + z * this.x] * 8 * flat[x + z * this.x];
			let hills2B = hills2[x + z * this.x];
			return this.y + hillsB + (hills2B > 0.5 ? hills2B * 16 * flat[z + x * this.z] + 16 : 0) - 64;
		};
		//generate floor
		for(let z = 0; z < this.z; z++) {
			for(let x = 0; x < this.x; x++) {
				let height = Math.floor(calculateHeight(x, z));
				for(let y = 0; y <= height; y++) {
					let mult3d = y > this.y - 64 ? 0.3 : (y / (this.y - 64) * 0.3);
					if(y == 0) {
						this.setBlock(11, x, 0, z); //lava
					} else if(caveL3d[x + z * this.x + y * area] > mult3d) {
						let block = 1; //stone
						if(y > height - hills[z + x * this.z] * 3 - 1) {
							block = 3; //dirt
						}
						this.setBlock(block, x, y, z);
					}
				}
			}
		}
		//generate noode caves
		const biasChangeChance = 0.1;
		const widthChangeChance = 0.1;
		let noodleCount = volume / 65536; //32 noodles on a 128x128x128 map
		for(let noodles = 0; noodles < noodleCount; noodles++) {
			let x = Math.random() * this.x;
			let y = Math.random() * this.y;
			let z = Math.random() * this.z;
			//-1 through 1
			let xBias = Math.random() * 2 - 0.5;
			let yBias = Math.random() * 2 - 0.5;
			let zBias = Math.random() * 2 - 0.5;
			let branchCount = Math.floor(Math.random() * 4) + 1;
			//actually connect together instead of hoping two noodles intersect (makes caving easier)
			let xOld = x;
			let yOld = y;
			let zOld = z;
			for(let branches = 0; branches < branchCount; branches++) {
				let width = Math.random() * 2 + 2;
				let segCount = Math.floor(Math.random() * 128) + 8;
				for(let segs = 0; segs < segCount; segs++) {
					if(y < width) break; //dont generate in the void (crashes!!!)
					if(y > this.y) break; //dont generate in the sky (unecessary!!!)
					sphere(0, Math.round(x), Math.round(y), Math.round(z), width);
					let xMod = (Math.random() * width * 0.75) * xBias;
					let yMod = (Math.random() * width * 0.75) * yBias;
					let zMod = (Math.random() * width * 0.75) * zBias;
					x += xMod;
					y += yMod;
					z += zMod;
					if(Math.random() < biasChangeChance) xBias = Math.random() * 2 - 0.5;
					if(Math.random() < biasChangeChance) yBias = Math.random() * 2 - 0.5;
					if(Math.random() < biasChangeChance) zBias = Math.random() * 2 - 0.5;
					if(Math.random() < widthChangeChance) {
						if(width > 3) {
							width--;
						} else {
							width += Math.random() * 2 - 0.5;
						}
					}
				}
				x = xOld;
				y = yOld;
				z = zOld;
			}
		}
		
		const doOre = (block, maxRadius, maxBlobs, minHeight, ratio) => {
			//ratio is how many ore veins there are in a 128x128x128 world (the magic number is the volume of a 128x128x128 world)
			let veinCount = (volume / 2097152) * ratio;
			for(let veins = 0; veins < veinCount; veins++) {
				let x = Math.floor(Math.random() * this.x);
				//min height is what (normalized) y value the ore appears at
				let y = Math.floor(Math.random() * this.y * minHeight);
				let z = Math.floor(Math.random() * this.z);
				let blobCount = Math.ceil(Math.random() * maxBlobs);
				for(let blob = 0; blob < blobCount; blob++) {
					sphereOverwrite(block, x, y, z, Math.random() * maxRadius);
					if(blobCount > 1) {
						let xMod = Math.ceil(Math.random() * maxRadius / 2);
						let yMod = Math.ceil(Math.random() * maxRadius / 2);
						let zMod = Math.ceil(Math.random() * maxRadius / 2);
						if(Math.random() < 0.5) xMod *= -1;
						if(Math.random() < 0.5) yMod *= -1;
						if(Math.random() < 0.5) zMod *= -1;
						x += xMod;
						y += yMod;
						z += zMod;
						if(y < maxRadius) break; //dont generate in the void (crashes!!!)
					}
				}
			}
		};
		doOre(3, 5, 3, 0.9, 512); //dirt
		doOre(16, 3, 3, 1, 256); //coal
		doOre(15, 2, 6, 0.9, 256); //iron
		doOre(14, 2, 3, 0.25, 128); //gold
		doOre(41, 1, 1, 0.1, 8); //gold block
		doOre(42, 1, 1, 0.15, 16); //iron block
		if(useCustomOre) {
			doOre(68, 1.5, 2, 0.2, 64); //diamond
			doOre(69, 2, 5, 0.3, 96); //redstone (nice!)
			doOre(70, 2, 5, 0.5, 96); //lapis
			doOre(71, 1.2, 2, 0.8, 32); //emerald
		}
		//grass (3d noise eats through it!!) and trees
		//post 3d noise heights
		let newHeights = new Array(area);
		const dist = 2; //tree dist from edge
		for(let z = 0; z < this.z; z++) {
			for(let x = 0; x < this.x; x++) {
				let height = Math.floor(calculateHeight(x, z));
				for(let y = height; y > 0; y--) {
					let block = this.getBlock(x, y ,z);
					if(block == 3) {
						let valid = x > dist && z > dist && x < this.x - dist && z < this.z - dist;
						if(Math.floor(Math.random() * 256) == 0 && valid) {
							this.tree(x, y + 1, z);
						} else {
							this.setBlock(2, x, y, z) //grass
						}
						newHeights[x + z * this.x] = y;
						break;
					} else if(block != 0) {
						newHeights[x + z * this.x] = y;
						break;
					}
				}
			}			
		}
		
		for(let blobs = 0; blobs < (this.x + this.z) / 8; blobs++) {
			let x = Math.floor(Math.random() * this.x);
			let z = Math.floor(Math.random() * this.z);
			let block = 37; //dandelion
			if(Math.random() > 0.5) {
				block++; //rose
			}
			let flowerCount = Math.ceil(Math.random() * 32) + 4;
			for(let flowers = 0; flowers < flowerCount; flowers++) {
				let y = newHeights[x + z * this.x];
				if(this.getBlock(x, y, z) == 2) {
					this.setBlock(block, x, y + 1, z);
				}
				let xOff = Math.ceil(Math.random() * 4);
				let zOff = Math.ceil(Math.random() * 4);
				if(Math.random() > 0.5) xOff *= -1;
				if(Math.random() > 0.5) zOff *= -1;
				x += xOff;
				z += zOff;
				if(Math.abs(x % this.x) != x) break;
				if(Math.abs(z % this.z) != z) break;
			}
		}
		//MUSHROOOOMS!!!!
		for(let mushrooms = 0; mushrooms < (this.x + this.z + this.y) * 4; mushrooms++) {
			let x = Math.floor(Math.random() * this.x);
			//spawn more deeper
			let y = Math.random();
			y = Math.floor((y * y) * (this.y - 64));
			let z = Math.floor(Math.random() * this.z);
			let block = 39; //brown
			if(Math.random() > 0.5) {
				block++; //red
			}
			
			if(this.getBlock(x, y, z) == 0) {
				for(let s = y; s > 2; s--) {
					if(this.getBlock(x, s, z) != 0) {
						this.setBlock(block, x, s + 1, z);
						break;
					}
				}
			}
		}
    }
}

module.exports = new GenerationCaves();